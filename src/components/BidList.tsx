import React, { memo, useCallback, useState, useMemo } from 'react';
import { BidItem } from '../types/bid';
import './BidList.css';

type SortOption = 'default' | 'title' | 'agency' | 'deadline' | 'amount';
type SortOrder = 'asc' | 'desc';

interface BidListProps {
  bids: BidItem[];
  loading: boolean;
  onBidClick: (bid: BidItem) => void;
}

const BidList: React.FC<BidListProps> = memo(({ bids, loading, onBidClick }) => {
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const formatAmount = useCallback((amount: string) => {
    if (!amount) return '미정';
    const num = parseInt(amount);
    if (isNaN(num)) return amount;
    return `${num.toLocaleString()}만원`;
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return '미정';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // 정렬된 입찰공고 목록
  const sortedBids = useMemo(() => {
    if (sortOption === 'default') return bids;

    const sorted = [...bids].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'title':
          comparison = a.bidNtceNm.localeCompare(b.bidNtceNm);
          break;
        case 'agency':
          comparison = a.dminsttNm.localeCompare(b.dminsttNm);
          break;
        case 'deadline':
          const dateA = new Date(a.bidClseDt).getTime();
          const dateB = new Date(b.bidClseDt).getTime();
          comparison = dateA - dateB;
          break;
        case 'amount':
          const amountA = parseInt(a.estmtPrce) || 0;
          const amountB = parseInt(b.estmtPrce) || 0;
          comparison = amountA - amountB;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [bids, sortOption, sortOrder]);

  const handleSortChange = useCallback((option: SortOption) => {
    if (sortOption === option) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortOrder('asc');
    }
  }, [sortOption]);

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

      {/* 정렬 옵션 */}
      <div className="sort-options">
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortOption === 'default' ? 'active' : ''}`}
            onClick={() => handleSortChange('default')}
          >
            기본순
          </button>
          <button
            className={`sort-btn ${sortOption === 'title' ? 'active' : ''}`}
            onClick={() => handleSortChange('title')}
          >
            제목순 {sortOption === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${sortOption === 'agency' ? 'active' : ''}`}
            onClick={() => handleSortChange('agency')}
          >
            기관순 {sortOption === 'agency' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${sortOption === 'deadline' ? 'active' : ''}`}
            onClick={() => handleSortChange('deadline')}
          >
            마감일순 {sortOption === 'deadline' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            className={`sort-btn ${sortOption === 'amount' ? 'active' : ''}`}
            onClick={() => handleSortChange('amount')}
          >
            예산순 {sortOption === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      <div className="bid-list">
        {sortedBids.map((bid) => (
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
});

BidList.displayName = 'BidList';

export default BidList;
