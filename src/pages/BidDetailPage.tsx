import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSummary } from '../contexts/SummaryContext';
import { useBid } from '../contexts/BidContext';
import { BidItem } from '../types/bid';
// import bidService from '../services/bidService';
import './BidDetailPage.css';

const BidDetailPage: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();
  const { getSummary, usageInfo } = useSummary();
  const { selectedBid, setSelectedBid } = useBid();
  
  const [bid, setBid] = useState<BidItem | null>(null);
  const [loadingBid, setLoadingBid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (bidId) {
      fetchBidDetail(bidId);
    }
  }, [bidId]);

  const fetchBidDetail = async (bidId: string) => {
    try {
      setLoadingBid(true);
      setError(null);

      // Context에서 선택된 입찰공고 데이터 사용
      if (selectedBid && selectedBid.bidNtceNo === bidId) {
        setBid(selectedBid);
      } else {
        // Context에 데이터가 없는 경우 샘플 데이터 사용 (fallback)
        const sampleBid: BidItem = {
          bidNtceNo: bidId,
          bidNtceNm: '소프트웨어 개발 용역',
          dminsttNm: '서울특별시청',
          bidNtceDt: '2024-12-01 09:00:00',
          bidClseDt: '2024-12-31 18:00:00',
          bidMethdNm: '일반경쟁입찰',
          cntrctMthNm: '단가계약',
          estmtPrce: '50000000',
          rgnNm: '서울',
          bidNtceDtlUrl: 'https://www.g2b.go.kr/',
        };
        setBid(sampleBid);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '입찰공고를 불러오는 데 실패했습니다.');
    } finally {
      setLoadingBid(false);
    }
  };

  const handleGetSummary = async () => {
    if (!bid) return;

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      const bidContent = `
        입찰공고명: ${bid.bidNtceNm}
        수요기관: ${bid.dminsttNm}
        입찰방법: ${bid.bidMethdNm}
        계약방법: ${bid.cntrctMthNm}
        추정가격: ${bid.estmtPrce}
        지역: ${bid.rgnNm}
        입찰공고일시: ${bid.bidNtceDt}
        입찰마감일시: ${bid.bidClseDt}
        
        [상세 내용]
        본 입찰공고는 ${bid.dminsttNm}에서 ${bid.bidNtceNm}에 대한 입찰을 실시합니다.
        입찰방법은 ${bid.bidMethdNm}이며, 계약방법은 ${bid.cntrctMthNm}입니다.
        추정가격은 ${bid.estmtPrce}이며, 입찰마감일시는 ${bid.bidClseDt}입니다.
        
        [제출서류]
        1. 입찰서
        2. 사업자등록증 사본
        3. 법인등기부등본
        4. 실적증명서
        5. 기술제안서
        
        [자격요건]
        - 관련 업종 경험 3년 이상
        - 기술인력 보유
        - 안정적 재무상태
        
        [기타사항]
        - 입찰보증금: 추정가격의 5%
        - 계약기간: 계약 체결일로부터 1년
        - 낙찰자 선정: 최저가 낙찰 원칙
      `;

      const result = await getSummary(bid.bidNtceNo, bid.bidNtceNm, bidContent);

      if (result.success && result.summary) {
        setSummary(result.summary);
      } else {
        setSummaryError(result.error || '요약 생성에 실패했습니다.');
      }
    } catch (err) {
      setSummaryError('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    if (!amount) return '미정';
    return `${parseInt(amount).toLocaleString()}만원`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '미정';
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingBid) {
    return (
      <div className="bid-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>입찰공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !bid) {
    return (
      <div className="bid-detail-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>입찰공고를 찾을 수 없습니다</h2>
          <p>{error || '요청하신 입찰공고가 존재하지 않습니다.'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-detail-page">
      <div className="detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← 뒤로가기
        </button>
        <h1>{bid.bidNtceNm}</h1>
      </div>

      <div className="detail-content">
        <div className="bid-info-card">
          <h2>📋 입찰공고 정보</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">수요기관</span>
              <span className="value">{bid.dminsttNm}</span>
            </div>
            <div className="info-item">
              <span className="label">지역</span>
              <span className="value">{bid.rgnNm}</span>
            </div>
            <div className="info-item">
              <span className="label">입찰방법</span>
              <span className="value">{bid.bidMethdNm}</span>
            </div>
            <div className="info-item">
              <span className="label">계약방법</span>
              <span className="value">{bid.cntrctMthNm}</span>
            </div>
            <div className="info-item">
              <span className="label">추정가격</span>
              <span className="value">{formatAmount(bid.estmtPrce)}</span>
            </div>
            <div className="info-item">
              <span className="label">입찰공고일시</span>
              <span className="value">{formatDate(bid.bidNtceDt)}</span>
            </div>
            <div className="info-item">
              <span className="label">입찰마감일시</span>
              <span className="value">{formatDate(bid.bidClseDt)}</span>
            </div>
          </div>
        </div>

        <div className="ai-summary-card">
          <div className="summary-header">
            <h2>🤖 AI 요약</h2>
            {usageInfo && (
              <div className="usage-info">
                <span className="usage-text">
                  사용량: {usageInfo.totalUsage}회
                  {usageInfo.accountType === 'free' && (
                    <span className="remaining"> (남은 횟수: {usageInfo.remainingUsage}회)</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {!summary && !summaryLoading && !summaryError && (
            <div className="summary-prompt">
              <p>AI가 입찰공고를 분석하여 핵심 정보를 요약해드립니다.</p>
              <button
                className="btn btn-primary"
                onClick={handleGetSummary}
                disabled={usageInfo?.remainingUsage === 0}
              >
                {usageInfo?.remainingUsage === 0 ? '사용 한도 초과' : 'AI 요약 생성'}
              </button>
            </div>
          )}

          {summaryLoading && (
            <div className="summary-loading">
              <div className="loading-spinner"></div>
              <p>AI가 입찰공고를 분석하고 있습니다...</p>
            </div>
          )}

          {summaryError && (
            <div className="summary-error">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h4>요약 생성 실패</h4>
                <p>{summaryError}</p>
                <button
                  className="btn btn-secondary"
                  onClick={handleGetSummary}
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {summary && (
            <div className="summary-content">
              <div className="summary-item">
                <h4>📌 핵심 요구사항</h4>
                <div className="summary-text">
                  {summary.coreRequirements.split('\n').map((line: string, index: number) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>

              <div className="summary-item">
                <h4>📑 제출서류</h4>
                <div className="summary-text">
                  {summary.requiredDocuments.split('\n').map((line: string, index: number) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>

              <div className="summary-item">
                <h4>📅 마감일</h4>
                <div className="summary-text">{summary.deadline}</div>
              </div>

              <div className="summary-item">
                <h4>💰 예산/기초금액</h4>
                <div className="summary-text">{summary.budget}</div>
              </div>
            </div>
          )}
        </div>

        {bid.bidNtceDtlUrl && (
          <div className="action-card">
            <h2>🔗 관련 링크</h2>
            <a
              href={bid.bidNtceDtlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary external-link"
            >
              원문 보기 (나라장터)
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidDetailPage;
