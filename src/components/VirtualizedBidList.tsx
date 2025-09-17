import React, { memo } from 'react';
import { BidItem } from '../types/bid';
import { useVirtualization } from '../hooks/useVirtualization';
import './VirtualizedBidList.css';

interface VirtualizedBidListProps {
  bids: BidItem[];
  loading: boolean;
  onBidClick: (bid: BidItem) => void;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedBidList: React.FC<VirtualizedBidListProps> = memo(({
  bids,
  loading,
  onBidClick,
  itemHeight = 120,
  containerHeight = 600,
}) => {
  const { visibleItems, totalHeight, offsetY, handleScroll, startIndex } = useVirtualization(
    bids,
    { itemHeight, containerHeight }
  );

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
      <div className="virtualized-bid-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>입찰공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="virtualized-bid-list">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>입찰공고가 없습니다</h3>
          <p>검색 조건을 변경해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="virtualized-bid-list">
      <div className="list-header">
        <h3>입찰공고 목록 ({bids.length}건)</h3>
      </div>
      
      <div
        className="virtual-container"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div
          className="virtual-content"
          style={{
            height: totalHeight,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((bid, index) => (
            <div
              key={bid.bidNtceNo}
              className="bid-item"
              style={{ height: itemHeight }}
              onClick={() => onBidClick(bid)}
            >
              <div className="bid-content">
                <div className="bid-header">
                  <h4 className="bid-title">{bid.bidNtceNm}</h4>
                  <span className="bid-number">#{startIndex + index + 1}</span>
                </div>
                
                <div className="bid-details">
                  <div className="detail-item">
                    <span className="label">기관:</span>
                    <span className="value">{bid.dminsttNm}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">지역:</span>
                    <span className="value">{bid.rgnNm}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">예산:</span>
                    <span className="value">{formatAmount(bid.estmtPrce)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">마감:</span>
                    <span className="value">{formatDate(bid.bidClseDt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedBidList.displayName = 'VirtualizedBidList';

export default VirtualizedBidList;
