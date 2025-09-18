import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SummaryContextType, SummaryResponse, UsageInfo } from '../types/summary';
import { useAuth } from './AuthContext';
import summaryService from '../services/summaryService';

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

interface SummaryProviderProps {
  children: ReactNode;
}

export const SummaryProvider: React.FC<SummaryProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 변경 시 사용량 정보 로드
  useEffect(() => {
    if (user) {
      loadUsageInfo();
    } else {
      setUsageInfo(null);
    }
  }, [user, loadUsageInfo]);

  const loadUsageInfo = useCallback(async () => {
    if (!user) return;

    try {
      const info = await summaryService.getUsageInfo(user.id, user.accountType);
      setUsageInfo(info);
    } catch (err) {
      console.error('사용량 정보 로드 오류:', err);
    }
  }, [user]);

  const getSummary = async (bidId: string, bidTitle: string, bidContent: string): Promise<SummaryResponse> => {
    if (!user) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    try {
      setLoading(true);
      setError(null);

      // 사용량 확인
      if (usageInfo && usageInfo.remainingUsage <= 0) {
        return {
          success: false,
          error: 'AI 요약 사용 한도를 초과했습니다. 유료 계정으로 업그레이드하세요.',
          usageCount: usageInfo.totalUsage,
          remainingUsage: usageInfo.remainingUsage,
        };
      }

      // 캐시 확인
      const cached = await summaryService.getSummaryCache(bidId);
      if (cached) {
        return {
          success: true,
          summary: cached,
          usageCount: usageInfo?.totalUsage || 0,
          remainingUsage: usageInfo?.remainingUsage || 0,
        };
      }

      // AI 요약 생성
      const result = await summaryService.generateSummary({
        bidId,
        bidTitle,
        bidContent,
      });

      if (result.success && result.summary) {
        // 사용량 증가
        await summaryService.incrementUsage(user.id);
        
        // 캐시 저장
        await summaryService.saveSummaryCache(bidId, result.summary);
        
        // 사용량 정보 업데이트
        await loadUsageInfo();
        
        return {
          ...result,
          usageCount: (usageInfo?.totalUsage || 0) + 1,
          remainingUsage: Math.max(0, (usageInfo?.remainingUsage || 0) - 1),
        };
      }

      return result;
    } catch (err) {
      console.error('AI 요약 생성 오류:', err);
      setError(err instanceof Error ? err.message : 'AI 요약 생성 중 오류가 발생했습니다.');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'AI 요약 생성 중 오류가 발생했습니다.',
      };
    } finally {
      setLoading(false);
    }
  };

  const value: SummaryContextType = {
    usageInfo,
    getSummary,
    loading,
    error,
  };

  return (
    <SummaryContext.Provider value={value}>
      {children}
    </SummaryContext.Provider>
  );
};

export const useSummary = (): SummaryContextType => {
  const context = useContext(SummaryContext);
  if (context === undefined) {
    throw new Error('useSummary must be used within a SummaryProvider');
  }
  return context;
};
