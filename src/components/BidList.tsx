import React, { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { BidItem } from '../types/bid';
import bidService from '../services/bidService';
import './BidList.css';

type SortOption = 'default' | 'title' | 'agency' | 'deadline' | 'amount';
type SortOrder = 'asc' | 'desc';

interface BidListProps {
  bids: BidItem[];
  loading: boolean;
  onBidClick: (bid: BidItem) => void;
  currentPage?: number;
  pageSize?: number;
}

const BidList: React.FC<BidListProps> = memo(({ bids, loading, onBidClick, currentPage = 1, pageSize = 10 }) => {
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [bidsWithBasisAmount, setBidsWithBasisAmount] = useState<BidItem[]>([]);

  const formatAmount = useCallback((amount: string) => {
    if (!amount) return '';
    const num = parseInt(amount);
    if (isNaN(num)) return amount;
    return num.toLocaleString();
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\./g, '-').replace(/\s/g, ' ');
  }, []);

  // 기초금액 로드
  useEffect(() => {
    const loadBasisAmounts = async () => {
      if (bids.length === 0) return;
      
      const updatedBids = await Promise.all(
        bids.map(async (bid) => {
          try {
            const basisAmount = await bidService.getBasisAmount(bid.bidNtceNo, '물품');
            return { ...bid, bssamt: basisAmount };
          } catch (error) {
            console.error(`기초금액 로드 실패 (${bid.bidNtceNo}):`, error);
            return bid;
          }
        })
      );
      
      setBidsWithBasisAmount(updatedBids);
    };
    
    loadBasisAmounts();
  }, [bids]);

  // 태그 생성 함수
  const getTags = useCallback((bid: BidItem) => {
    const tags = [];
    
    // 전자입찰 태그
    if (bid.bidMethdNm && bid.bidMethdNm.includes('전자')) {
      tags.push({ text: '전자', type: 'electronic' });
    }
    
    // 긴급 태그 (공고상태에서)
    if (bid.ntceKindNm && bid.ntceKindNm.includes('긴급')) {
      tags.push({ text: '긴급', type: 'urgent' });
    }
    
    // 수의계약 태그
    if (bid.cntrctMthNm && bid.cntrctMthNm.includes('수의')) {
      tags.push({ text: '수의', type: 'private' });
    }
    
    // 취소 태그
    if (bid.ntceKindNm && bid.ntceKindNm.includes('취소')) {
      tags.push({ text: '취소', type: 'cancelled' });
    }
    
    return tags;
  }, []);

  // 정렬된 입찰공고 목록
  const sortedBids = useMemo(() => {
    const sourceBids = bidsWithBasisAmount.length > 0 ? bidsWithBasisAmount : bids;
    if (sortOption === 'default') return sourceBids;

    const sorted = [...sourceBids].sort((a, b) => {
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
  }, [bids, bidsWithBasisAmount, sortOption, sortOrder]);

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
      
      {/* 테이블 형태로 변경 */}
      <div className="bid-table-container">
        <table className="bid-table">
          <thead>
            <tr>
              <th className="col-number">번호</th>
              <th className="col-title">공고명 / 공고번호</th>
              <th className="col-region">지역 / 공고기관</th>
              <th className="col-amount">기초금액 / 추정가격</th>
              <th className="col-dates">입력일 / 입찰일시</th>
              <th className="col-deadline">참가신청마감일 / 투찰마감일시</th>
            </tr>
          </thead>
          <tbody>
            {sortedBids.map((bid, index) => {
              const tags = getTags(bid);
              return (
                <tr
                  key={bid.bidNtceNo}
                  className="bid-row"
                  onClick={() => onBidClick(bid)}
                >
                  <td className="col-number">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="col-title">
                    <div className="title-content">
                      <div className="tags">
                        {tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className={`tag tag-${tag.type}`}>
                            {tag.text}
                          </span>
                        ))}
                      </div>
                      <div className="title-text">{bid.bidNtceNm}</div>
                      <div className="title-number">{bid.bidNtceNo}</div>
                    </div>
                  </td>
                  <td className="col-region">
                    <div className="region-content">
                      <div className="region">{bid.rgnNm}</div>
                      <div className="agency">{bid.dminsttNm}</div>
                    </div>
                  </td>
                  <td className="col-amount">
                    <div className="amount-content">
                      <div className="base-amount">{bid.bssamt ? formatAmount(bid.bssamt) : '미공개'}</div>
                      <div className="estimated-amount">{formatAmount(bid.estmtPrce)}</div>
                    </div>
                  </td>
                  <td className="col-dates">
                    <div className="dates-content">
                      <div className="input-date">{formatDate(bid.bidNtceDt)}</div>
                      <div className="bid-date">{formatDate(bid.opengDt || '')}</div>
                    </div>
                  </td>
                  <td className="col-deadline">
                    <div className="deadline-content">
                      <div className="application-deadline">{formatDate(bid.bidBeginDt || '')}</div>
                      <div className="bid-deadline">{formatDate(bid.bidClseDt)}</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

BidList.displayName = 'BidList';

export default BidList;
