import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UpgradePrompt from '../components/UpgradePrompt';
import './PricingPage.css';

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'ai_limit' | 'condition_limit' | 'general'>('general');

  const handleUpgrade = (reason: 'ai_limit' | 'condition_limit' | 'general' = 'general') => {
    if (user) {
      setUpgradeReason(reason);
      setShowUpgradePrompt(true);
    } else {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  };

  const handleUpgradeConfirm = () => {
    setShowUpgradePrompt(false);
    // 실제로는 계정 타입을 premium으로 변경
    alert('🍽️ 밥 한 번 쏘겠습니다! 프리미엄 계정으로 업그레이드되었습니다!');
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>🍽️ 밥 한 번 쏘겠습니다!</h1>
        <p>AI낙찰이의 프리미엄 기능을 무료로 체험해보세요</p>
      </div>

      <div className="pricing-content">
        <div className="plans-grid">
          <div className="plan-card free">
            <div className="plan-header">
              <h3>무료</h3>
              <div className="plan-price">무료</div>
            </div>
            <div className="plan-features">
              <ul>
                <li>🔍 입찰공고 검색 무제한</li>
                <li>🤖 AI 요약 10회/월</li>
                <li>🔔 알림 조건 3개</li>
                <li>📱 모바일 최적화</li>
              </ul>
            </div>
            <div className="plan-status">
              <span className="current-plan">현재 플랜</span>
            </div>
          </div>

          <div className="plan-card premium">
            <div className="plan-badge">인기</div>
            <div className="plan-header">
              <h3>프리미엄</h3>
              <div className="plan-price">밥 한 번 쏘겠습니다!</div>
            </div>
            <div className="plan-features">
              <ul>
                <li>🔍 입찰공고 검색 무제한</li>
                <li>🤖 AI 요약 무제한</li>
                <li>🔔 알림 조건 10개</li>
                <li>📊 고급 분석 도구</li>
                <li>📧 우선 지원</li>
                <li>📤 CSV 내보내기</li>
              </ul>
            </div>
            <div className="plan-actions">
              <button 
                className="upgrade-btn"
                onClick={() => handleUpgrade('general')}
              >
                🍽️ 밥 한 번 쏘겠습니다!
              </button>
            </div>
          </div>
        </div>

        <div className="upgrade-reasons">
          <h2>언제 업그레이드하나요?</h2>
          <div className="reasons-grid">
            <div className="reason-card" onClick={() => handleUpgrade('ai_limit')}>
              <div className="reason-icon">🤖</div>
              <h3>AI 요약 한도 초과</h3>
              <p>AI가 10번 일한 후에는 "밥 한 번 쏘겠습니다!" 버튼이 나타납니다</p>
            </div>
            <div className="reason-card" onClick={() => handleUpgrade('condition_limit')}>
              <div className="reason-icon">🔔</div>
              <h3>알림 조건 한도 초과</h3>
              <p>3개 조건을 넘으면 "밥 한 번 쏘겠습니다!" 버튼이 나타납니다</p>
            </div>
            <div className="reason-card" onClick={() => handleUpgrade('general')}>
              <div className="reason-icon">🚀</div>
              <h3>더 많은 기능 원할 때</h3>
              <p>언제든지 "밥 한 번 쏘겠습니다!" 버튼을 눌러 업그레이드하세요</p>
            </div>
          </div>
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
              <h3>정말로 밥을 사주시나요? 🍽️</h3>
              <p>아니요! "밥 한 번 쏘겠습니다"는 재미있는 표현일 뿐입니다. 실제로는 무료로 프리미엄 기능을 사용할 수 있어요.</p>
            </div>
            <div className="faq-item">
              <h3>언제든지 업그레이드할 수 있나요?</h3>
              <p>네, 언제든지 "밥 한 번 쏘겠습니다!" 버튼을 눌러 프리미엄 계정으로 업그레이드할 수 있습니다.</p>
            </div>
            <div className="faq-item">
              <h3>업그레이드 후 되돌릴 수 있나요?</h3>
              <p>물론입니다! 언제든지 무료 계정으로 되돌릴 수 있습니다. 다만 프리미엄 기능은 사용할 수 없게 됩니다.</p>
            </div>
            <div className="faq-item">
              <h3>왜 이런 재미있는 방식을 사용하나요?</h3>
              <p>복잡한 결제 시스템 대신 사용자에게 즐거운 경험을 제공하고 싶어서요! 😊</p>
            </div>
          </div>
        </div>
      </div>

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={handleUpgradeConfirm}
        reason={upgradeReason}
      />
    </div>
  );
};

export default PricingPage;
