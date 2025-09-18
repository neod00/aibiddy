import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SearchCondition, ConditionContextType } from '../types/condition';
import { useAuth } from './AuthContext';
import googleSheetsService from '../services/googleSheetsService';

const ConditionContext = createContext<ConditionContextType | undefined>(undefined);

interface ConditionProviderProps {
  children: ReactNode;
}

export const ConditionProvider: React.FC<ConditionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conditions, setConditions] = useState<SearchCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConditions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userConditions = await googleSheetsService.getUserConditions(user.id);
      setConditions(userConditions);
    } catch (err) {
      console.error('조건 로드 오류:', err);
      setError(err instanceof Error ? err.message : '조건을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 사용자 변경 시 조건 목록 로드
  useEffect(() => {
    if (user) {
      loadConditions();
    } else {
      setConditions([]);
    }
  }, [user, loadConditions]);

  const addCondition = async (condition: Omit<SearchCondition, 'id' | 'userId' | 'createdAt'>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // 계정 타입별 제한 확인
      const activeConditions = conditions.filter(c => c.isActive).length;
      const maxConditions = user.accountType === 'premium' ? 10 : 3;
      
      if (activeConditions >= maxConditions) {
        setError(`조건은 최대 ${maxConditions}개까지 등록할 수 있습니다.`);
        return false;
      }

      const conditionId = await googleSheetsService.addCondition({
        ...condition,
        userId: user.id,
      });

      const newCondition: SearchCondition = {
        ...condition,
        id: conditionId,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      setConditions(prev => [...prev, newCondition]);
      return true;
    } catch (err) {
      console.error('조건 추가 오류:', err);
      setError(err instanceof Error ? err.message : '조건을 추가하는데 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCondition = async (id: string, updates: Partial<SearchCondition>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      await googleSheetsService.updateCondition(id, updates);

      setConditions(prev =>
        prev.map(condition =>
          condition.id === id ? { ...condition, ...updates } : condition
        )
      );
      return true;
    } catch (err) {
      console.error('조건 업데이트 오류:', err);
      setError(err instanceof Error ? err.message : '조건을 업데이트하는데 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCondition = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      await googleSheetsService.deleteCondition(id);

      setConditions(prev => prev.filter(condition => condition.id !== id));
      return true;
    } catch (err) {
      console.error('조건 삭제 오류:', err);
      setError(err instanceof Error ? err.message : '조건을 삭제하는데 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const condition = conditions.find(c => c.id === id);
      if (!condition) {
        setError('조건을 찾을 수 없습니다.');
        return false;
      }

      // 활성화하려는 경우 제한 확인
      if (!condition.isActive) {
        const activeConditions = conditions.filter(c => c.isActive).length;
        const maxConditions = user.accountType === 'premium' ? 10 : 3;
        
        if (activeConditions >= maxConditions) {
          setError(`조건은 최대 ${maxConditions}개까지 활성화할 수 있습니다.`);
          return false;
        }
      }

      await googleSheetsService.updateCondition(id, { isActive: !condition.isActive });

      setConditions(prev =>
        prev.map(condition =>
          condition.id === id ? { ...condition, isActive: !condition.isActive } : condition
        )
      );
      return true;
    } catch (err) {
      console.error('조건 토글 오류:', err);
      setError(err instanceof Error ? err.message : '조건 상태를 변경하는데 실패했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: ConditionContextType = {
    conditions,
    addCondition,
    updateCondition,
    deleteCondition,
    toggleCondition,
    loading,
    error,
  };

  return (
    <ConditionContext.Provider value={value}>
      {children}
    </ConditionContext.Provider>
  );
};

export const useCondition = (): ConditionContextType => {
  const context = useContext(ConditionContext);
  if (context === undefined) {
    throw new Error('useCondition must be used within a ConditionProvider');
  }
  return context;
};
