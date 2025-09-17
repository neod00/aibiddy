// 결제 관련 타입 정의

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  plan: PricingPlan;
  cancel_at_period_end: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string;
  receipt_url?: string;
}

export interface PaymentContextType {
  plans: PricingPlan[];
  selectedPlan: PricingPlan | null;
  setSelectedPlan: (plan: PricingPlan | null) => void;
  createPaymentIntent: (planId: string) => Promise<PaymentIntent>;
  confirmPayment: (paymentIntentId: string, paymentMethodId: string) => Promise<boolean>;
  getSubscription: () => Promise<Subscription | null>;
  cancelSubscription: () => Promise<boolean>;
  getPaymentHistory: () => Promise<PaymentHistory[]>;
  loading: boolean;
  error: string | null;
}
