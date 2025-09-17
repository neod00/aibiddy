import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
}

export function useVirtualization<T>(
  items: T[],
  options: UseVirtualizationOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
  };
}

// Hook for infinite scrolling
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean,
  threshold: number = 100
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      await fetchMore();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    } finally {
      setLoading(false);
    }
  }, [fetchMore, hasMore, loading]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

      if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !loading) {
        loadMore();
      }
    },
    [loadMore, hasMore, loading, threshold]
  );

  return {
    loading,
    error,
    loadMore,
    handleScroll,
  };
}
