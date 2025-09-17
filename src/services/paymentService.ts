import { loadStripe } from '@stripe/stripe-js';
import { PricingPlan, PaymentIntent, Subscription, PaymentHistory } from '../types/payment';

// Stripe 설정
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '/.netlify/functions';
  }

  // 가격 플랜 조회
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/get-pricing-plans`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '가격 플랜을 불러오는데 실패했습니다.');
      }

      return data.plans || [];
    } catch (error) {
      console.error('가격 플랜 조회 오류:', error);
      // 기본 플랜 반환
      return this.getDefaultPlans();
    }
  }

  // 기본 가격 플랜
  private getDefaultPlans(): PricingPlan[] {
    return [
      {
        id: 'free',
        name: '무료',
        price: 0,
        currency: 'KRW',
        interval: 'month',
        features: [
          '입찰공고 검색 무제한',
          'AI 요약 10회/월',
          '알림 조건 3개',
          '기본 지원'
        ]
      },
      {
        id: 'premium',
        name: '프리미엄',
        price: 9900,
        currency: 'KRW',
        interval: 'month',
        features: [
          '입찰공고 검색 무제한',
          'AI 요약 무제한',
          '알림 조건 10개',
          '우선 지원',
          '고급 분석 도구',
          'CSV 내보내기'
        ],
        popular: true,
        stripePriceId: 'price_premium_monthly'
      },
      {
        id: 'premium_yearly',
        name: '프리미엄 (연간)',
        price: 99000,
        currency: 'KRW',
        interval: 'year',
        features: [
          '입찰공고 검색 무제한',
          'AI 요약 무제한',
          '알림 조건 10개',
          '우선 지원',
          '고급 분석 도구',
          'CSV 내보내기',
          '2개월 무료'
        ],
        stripePriceId: 'price_premium_yearly'
      }
    ];
  }

  // 결제 의도 생성
  async createPaymentIntent(planId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '결제 의도 생성에 실패했습니다.');
      }

      return data.paymentIntent;
    } catch (error) {
      console.error('결제 의도 생성 오류:', error);
      throw error;
    }
  }

  // 결제 확인
  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentIntentId, 
          paymentMethodId 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '결제 확인에 실패했습니다.');
      }

      return data.success;
    } catch (error) {
      console.error('결제 확인 오류:', error);
      throw error;
    }
  }

  // 구독 조회
  async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await fetch(`${this.baseUrl}/get-subscription`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '구독 정보를 불러오는데 실패했습니다.');
      }

      return data.subscription;
    } catch (error) {
      console.error('구독 조회 오류:', error);
      return null;
    }
  }

  // 구독 취소
  async cancelSubscription(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '구독 취소에 실패했습니다.');
      }

      return data.success;
    } catch (error) {
      console.error('구독 취소 오류:', error);
      throw error;
    }
  }

  // 결제 내역 조회
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/get-payment-history`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '결제 내역을 불러오는데 실패했습니다.');
      }

      return data.payments || [];
    } catch (error) {
      console.error('결제 내역 조회 오류:', error);
      return [];
    }
  }

  // Stripe 인스턴스 가져오기
  async getStripe() {
    return await stripePromise;
  }
}

export default new PaymentService();
