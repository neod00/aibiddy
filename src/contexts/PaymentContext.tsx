import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentContextType, PricingPlan, PaymentIntent, Subscription, PaymentHistory } from '../types/payment';
import { useAuth } from './AuthContext';
import paymentService from '../services/paymentService';

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 가격 플랜 로드
  useEffect(() => {
    loadPricingPlans();
  }, []);

  const loadPricingPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const pricingPlans = await paymentService.getPricingPlans();
      setPlans(pricingPlans);
    } catch (err) {
      console.error('가격 플랜 로드 오류:', err);
      setError(err instanceof Error ? err.message : '가격 플랜을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async (planId: string): Promise<PaymentIntent> => {
    try {
      setLoading(true);
      setError(null);
      const paymentIntent = await paymentService.createPaymentIntent(planId);
      return paymentIntent;
    } catch (err) {
      console.error('결제 의도 생성 오류:', err);
      setError(err instanceof Error ? err.message : '결제 의도 생성에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string, paymentMethodId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);
      return success;
    } catch (err) {
      console.error('결제 확인 오류:', err);
      setError(err instanceof Error ? err.message : '결제 확인에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubscription = async (): Promise<Subscription | null> => {
    try {
      setLoading(true);
      setError(null);
      const subscription = await paymentService.getSubscription();
      return subscription;
    } catch (err) {
      console.error('구독 조회 오류:', err);
      setError(err instanceof Error ? err.message : '구독 정보를 불러오는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await paymentService.cancelSubscription();
      return success;
    } catch (err) {
      console.error('구독 취소 오류:', err);
      setError(err instanceof Error ? err.message : '구독 취소에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentHistory = async (): Promise<PaymentHistory[]> => {
    try {
      setLoading(true);
      setError(null);
      const history = await paymentService.getPaymentHistory();
      return history;
    } catch (err) {
      console.error('결제 내역 조회 오류:', err);
      setError(err instanceof Error ? err.message : '결제 내역을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value: PaymentContextType = {
    plans,
    selectedPlan,
    setSelectedPlan,
    createPaymentIntent,
    confirmPayment,
    getSubscription,
    cancelSubscription,
    getPaymentHistory,
    loading,
    error,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
