import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { usePayment } from '../contexts/PaymentContext';
import { PricingPlan } from '../types/payment';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

const PaymentForm: React.FC<{ plan: PricingPlan; onSuccess: () => void; onClose: () => void }> = ({ 
  plan, 
  onSuccess, 
  onClose 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent, confirmPayment, loading } = usePayment();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // 결제 의도 생성
      const paymentIntent = await createPaymentIntent(plan.id);
      
      // 카드 요소에서 결제 방법 가져오기
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('카드 정보를 찾을 수 없습니다.');
      }

      // 결제 확인
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || '결제 처리 중 오류가 발생했습니다.');
      } else if (confirmedPaymentIntent?.status === 'succeeded') {
        // 서버에서 결제 확인
        const success = await confirmPayment(confirmedPaymentIntent.id, '');
        
        if (success) {
          onSuccess();
        } else {
          setError('결제 확인에 실패했습니다.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="plan-summary">
        <h3>{plan.name} 플랜</h3>
        <div className="plan-price">
          {plan.price === 0 ? '무료' : `${plan.price.toLocaleString()}원/${plan.interval === 'year' ? '년' : '월'}`}
        </div>
      </div>

      <div className="card-section">
        <label className="card-label">카드 정보</label>
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <span>{error}</span>
        </div>
      )}

      <div className="payment-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={processing}
        >
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!stripe || processing || loading}
        >
          {processing ? '처리 중...' : `${plan.price === 0 ? '무료로 시작' : '결제하기'}`}
        </button>
      </div>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { selectedPlan, setSelectedPlan } = usePayment();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowPaymentForm(false);
    }
  }, [isOpen]);

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan) {
      if (selectedPlan.price === 0) {
        // 무료 플랜은 바로 성공 처리
        onSuccess();
      } else {
        setShowPaymentForm(true);
      }
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    onSuccess();
  };

  const handleClose = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 결제하기</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {!showPaymentForm ? (
            <div className="plan-selection">
              <p className="selection-description">
                원하는 플랜을 선택하고 결제를 진행하세요.
              </p>
              
              <div className="plans-grid">
                {/* 무료 플랜 */}
                <div 
                  className={`plan-option ${selectedPlan?.id === 'free' ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect({ 
                    id: 'free', 
                    name: '무료', 
                    price: 0, 
                    currency: 'KRW', 
                    interval: 'month',
                    features: ['입찰공고 검색 무제한', 'AI 요약 10회/월', '알림 조건 3개']
                  })}
                >
                  <h3>무료</h3>
                  <div className="price">무료</div>
                  <ul>
                    <li>입찰공고 검색 무제한</li>
                    <li>AI 요약 10회/월</li>
                    <li>알림 조건 3개</li>
                  </ul>
                </div>

                {/* 프리미엄 플랜 */}
                <div 
                  className={`plan-option ${selectedPlan?.id === 'premium' ? 'selected' : ''}`}
                  onClick={() => handlePlanSelect({ 
                    id: 'premium', 
                    name: '프리미엄', 
                    price: 9900, 
                    currency: 'KRW', 
                    interval: 'month',
                    features: ['입찰공고 검색 무제한', 'AI 요약 무제한', '알림 조건 10개', '우선 지원']
                  })}
                >
                  <h3>프리미엄</h3>
                  <div className="price">9,900원/월</div>
                  <ul>
                    <li>입찰공고 검색 무제한</li>
                    <li>AI 요약 무제한</li>
                    <li>알림 조건 10개</li>
                    <li>우선 지원</li>
                  </ul>
                </div>
              </div>

              <div className="selection-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleProceedToPayment}
                  disabled={!selectedPlan}
                >
                  {selectedPlan ? '다음 단계' : '플랜을 선택하세요'}
                </button>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ locale: 'ko' }}>
              <PaymentForm 
                plan={selectedPlan!} 
                onSuccess={handlePaymentSuccess}
                onClose={handleClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
