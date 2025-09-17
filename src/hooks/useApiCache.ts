import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface UseApiCacheOptions {
  cacheKey: string;
  ttl?: number; // Time to live in milliseconds
  enabled?: boolean;
}

export function useApiCache<T>(
  fetchFn: () => Promise<T>,
  options: UseApiCacheOptions
) {
  const { cacheKey, ttl = 5 * 60 * 1000, enabled = true } = options; // Default 5 minutes
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = useCallback((): T | null => {
    if (!enabled) return null;
    
    try {
      const cached = localStorage.getItem(`api_cache_${cacheKey}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      if (now > entry.expiry) {
        localStorage.removeItem(`api_cache_${cacheKey}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }, [cacheKey, enabled]);

  const setCachedData = useCallback((newData: T) => {
    if (!enabled) return;

    try {
      const entry: CacheEntry<T> = {
        data: newData,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
      };
      localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }, [cacheKey, ttl, enabled]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, setCachedData, enabled]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`api_cache_${cacheKey}`);
    setData(null);
  }, [cacheKey]);

  const refresh = useCallback(() => {
    clearCache();
    fetchData();
  }, [clearCache, fetchData]);

  useEffect(() => {
    if (!enabled) return;

    const cached = getCachedData();
    if (cached) {
      setData(cached);
    } else {
      fetchData();
    }
  }, [enabled, getCachedData, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
  };
}

// Hook for caching API responses with automatic refresh
export function useApiCacheWithRefresh<T>(
  fetchFn: () => Promise<T>,
  options: UseApiCacheOptions & { refreshInterval?: number }
) {
  const { refreshInterval = 0, ...cacheOptions } = options;
  const cache = useApiCache(fetchFn, cacheOptions);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        cache.refresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, cache.refresh]);

  return cache;
}
