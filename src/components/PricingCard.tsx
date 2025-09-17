import React from 'react';
import { PricingPlan } from '../types/payment';
import './PricingCard.css';

interface PricingCardProps {
  plan: PricingPlan;
  isSelected: boolean;
  onSelect: (plan: PricingPlan) => void;
  loading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isSelected, 
  onSelect, 
  loading = false 
}) => {
  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return '무료';
    
    const formattedPrice = price.toLocaleString();
    const intervalText = interval === 'year' ? '/년' : '/월';
    
    return `${formattedPrice}원${intervalText}`;
  };

  const getSavings = () => {
    if (plan.interval === 'year' && plan.price > 0) {
      const monthlyPrice = plan.price / 12;
      const savings = Math.round((9900 - monthlyPrice) / 9900 * 100);
      return savings > 0 ? `${savings}% 절약` : null;
    }
    return null;
  };

  return (
    <div 
      className={`pricing-card ${isSelected ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
      onClick={() => !loading && onSelect(plan)}
    >
      {plan.popular && (
        <div className="popular-badge">
          인기
        </div>
      )}
      
      <div className="card-header">
        <h3 className="plan-name">{plan.name}</h3>
        <div className="plan-price">
          <span className="price">{formatPrice(plan.price, plan.currency, plan.interval)}</span>
          {getSavings() && (
            <span className="savings">{getSavings()}</span>
          )}
        </div>
      </div>

      <div className="card-body">
        <ul className="features-list">
          {plan.features.map((feature, index) => (
            <li key={index} className="feature-item">
              <span className="feature-icon">✓</span>
              <span className="feature-text">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-footer">
        <button 
          className={`select-button ${isSelected ? 'selected' : ''}`}
          disabled={loading}
        >
          {loading ? '처리 중...' : isSelected ? '선택됨' : '선택하기'}
        </button>
      </div>
    </div>
  );
};

export default PricingCard;
