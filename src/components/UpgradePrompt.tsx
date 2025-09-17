import React, { useState } from 'react';
import './UpgradePrompt.css';

interface UpgradePromptProps {
  onUpgrade: () => void;
  onClose: () => void;
  reason: 'ai_limit' | 'condition_limit' | 'general';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onUpgrade, onClose, reason }) => {
  const [showWittyMessage, setShowWittyMessage] = useState(false);

  const getReasonMessage = () => {
    switch (reason) {
      case 'ai_limit':
        return {
          title: '🤖 AI 요약 한도 초과!',
          message: 'AI가 너무 많이 일해서 지쳤어요 😅',
          subMessage: '프리미엄으로 업그레이드하면 AI가 무제한으로 일해줄게요!'
        };
      case 'condition_limit':
        return {
          title: '🔔 알림 조건 한도 초과!',
          message: '조건이 너무 많아서 혼란스러워요 🤯',
          subMessage: '프리미엄으로 업그레이드하면 더 많은 조건을 관리할 수 있어요!'
        };
      default:
        return {
          title: '🚀 프리미엄으로 업그레이드!',
          message: '더 많은 기능을 사용해보세요!',
          subMessage: '프리미엄 계정으로 업그레이드하면 모든 제한이 해제됩니다.'
        };
    }
  };

  const reasonInfo = getReasonMessage();

  const handleUpgradeClick = () => {
    setShowWittyMessage(true);
    setTimeout(() => {
      onUpgrade();
    }, 2000);
  };

  if (showWittyMessage) {
    return (
      <div className="upgrade-prompt-overlay">
        <div className="witty-message">
          <div className="message-content">
            <h2>🍽️ 밥 한 번 쏘겠습니다!</h2>
            <p>프리미엄 계정으로 업그레이드 중...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="sub-message">
              (실제로는 무료로 업그레이드됩니다 😉)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upgrade-prompt-overlay">
      <div className="upgrade-prompt">
        <div className="prompt-header">
          <h2>{reasonInfo.title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="prompt-body">
          <div className="reason-icon">
            {reason === 'ai_limit' ? '🤖' : reason === 'condition_limit' ? '🔔' : '🚀'}
          </div>
          
          <div className="reason-message">
            <h3>{reasonInfo.message}</h3>
            <p>{reasonInfo.subMessage}</p>
          </div>

          <div className="benefits">
            <h4>프리미엄 혜택</h4>
            <ul>
              <li>🤖 AI 요약 무제한</li>
              <li>🔔 알림 조건 10개까지</li>
              <li>📊 고급 분석 도구</li>
              <li>📧 우선 지원</li>
            </ul>
          </div>
        </div>

        <div className="prompt-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            나중에
          </button>
          <button className="btn btn-primary" onClick={handleUpgradeClick}>
            🍽️ 밥 한 번 쏘겠습니다!
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
