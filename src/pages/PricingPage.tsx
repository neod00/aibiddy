import React, { useState } from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { useAuth } from '../contexts/AuthContext';
import PricingCard from '../components/PricingCard';
import PaymentModal from '../components/PaymentModal';
import './PricingPage.css';

const PricingPage: React.FC = () => {
  const { plans, selectedPlan, setSelectedPlan, loading } = usePayment();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleUpgrade = () => {
    if (user) {
      setShowPaymentModal(true);
    } else {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // 성공 메시지 표시 또는 리다이렉트
    alert('결제가 완료되었습니다! 계정이 업그레이드되었습니다.');
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>💳 요금제 선택</h1>
        <p>AI낙찰이의 다양한 기능을 활용해보세요</p>
      </div>

      <div className="pricing-content">
        <div className="plans-grid">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={handlePlanSelect}
              loading={loading}
            />
          ))}
        </div>

        <div className="pricing-actions">
          <button
            className="upgrade-button"
            onClick={handleUpgrade}
            disabled={!selectedPlan || loading}
          >
            {selectedPlan ? '업그레이드하기' : '플랜을 선택하세요'}
          </button>
        </div>

        <div className="pricing-features">
          <h2>모든 플랜에 포함된 기능</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div className="feature-content">
                <h3>입찰공고 검색</h3>
                <p>나라장터의 모든 입찰공고를 실시간으로 검색</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-content">
                <h3>모바일 최적화</h3>
                <p>언제 어디서나 모바일에서 편리하게 이용</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔔</div>
              <div className="feature-content">
                <h3>알림 서비스</h3>
                <p>조건에 맞는 입찰공고를 이메일로 알림</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-content">
                <h3>보안</h3>
                <p>개인정보 보호 및 안전한 결제 시스템</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pricing-faq">
          <h2>자주 묻는 질문</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>언제든지 플랜을 변경할 수 있나요?</h3>
              <p>네, 언제든지 플랜을 변경하거나 취소할 수 있습니다. 변경사항은 다음 결제 주기부터 적용됩니다.</p>
            </div>
            <div className="faq-item">
              <h3>무료 체험 기간이 있나요?</h3>
              <p>무료 플랜으로 제한된 기능을 체험해보실 수 있습니다. 프리미엄 플랜은 7일 무료 체험을 제공합니다.</p>
            </div>
            <div className="faq-item">
              <h3>결제는 어떻게 이루어지나요?</h3>
              <p>안전한 Stripe 결제 시스템을 통해 신용카드로 결제됩니다. 모든 결제 정보는 암호화되어 보호됩니다.</p>
            </div>
            <div className="faq-item">
              <h3>환불 정책은 어떻게 되나요?</h3>
              <p>결제 후 7일 이내에는 전액 환불이 가능합니다. 더 자세한 내용은 고객지원팀에 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PricingPage;
