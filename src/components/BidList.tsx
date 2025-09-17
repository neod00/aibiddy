import React from 'react';
import { BidItem } from '../types/bid';
import './BidList.css';

interface BidListProps {
  bids: BidItem[];
  loading: boolean;
  onBidClick: (bid: BidItem) => void;
}

const BidList: React.FC<BidListProps> = ({ bids, loading, onBidClick }) => {
  const formatAmount = (amount: string) => {
    if (!amount) return '미정';
    const num = parseInt(amount);
    if (isNaN(num)) return amount;
    return `${num.toLocaleString()}만원`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '미정';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bid-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>입찰공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bid-list-container">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 검색 조건으로 다시 시도해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-list-container">
      <div className="bid-list-header">
        <h2>입찰공고 목록</h2>
        <span className="bid-count">{bids.length}건</span>
      </div>
      
      <div className="bid-list">
        {bids.map((bid) => (
          <div
            key={bid.bidNtceNo}
            className="bid-item"
            onClick={() => onBidClick(bid)}
          >
            <div className="bid-header">
              <h3 className="bid-title">{bid.bidNtceNm}</h3>
              <span className="bid-type">{bid.bidMethdNm}</span>
            </div>
            
            <div className="bid-info">
              <div className="bid-info-item">
                <span className="info-label">기관:</span>
                <span className="info-value">{bid.dminsttNm}</span>
              </div>
              
              <div className="bid-info-item">
                <span className="info-label">지역:</span>
                <span className="info-value">{bid.rgnNm}</span>
              </div>
              
              <div className="bid-info-item">
                <span className="info-label">예산:</span>
                <span className="info-value amount">{formatAmount(bid.estmtPrce)}</span>
              </div>
              
              <div className="bid-info-item">
                <span className="info-label">마감:</span>
                <span className="info-value deadline">{formatDate(bid.bidClseDt)}</span>
              </div>
            </div>
            
            <div className="bid-actions">
              <span className="view-detail">상세보기 →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidList;
