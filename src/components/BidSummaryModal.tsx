import React, { useState, useEffect } from 'react';
import { useSummary } from '../contexts/SummaryContext';
import { BidItem } from '../types/bid';
import './BidSummaryModal.css';

interface BidSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: BidItem | null;
}

const BidSummaryModal: React.FC<BidSummaryModalProps> = ({ isOpen, onClose, bid }) => {
  const { getSummary, usageInfo, loading, error } = useSummary();
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bid) {
      setSummary(null);
      setSummaryError(null);
    }
  }, [isOpen, bid]);

  const handleGetSummary = async () => {
    if (!bid) return;

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      // 실제 구현에서는 bidContent를 API에서 가져와야 함
      // 현재는 샘플 데이터 사용
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

  if (!isOpen || !bid) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 입찰공고 상세</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="bid-info">
            <h3>{bid.bidNtceNm}</h3>
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
                <span className="value">{bid.estmtPrce ? `${parseInt(bid.estmtPrce).toLocaleString()}만원` : '미정'}</span>
              </div>
              <div className="detail-item">
                <span className="label">마감:</span>
                <span className="value">
                  {bid.bidClseDt ? new Date(bid.bidClseDt).toLocaleString('ko-KR') : '미정'}
                </span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-header">
              <h3>🤖 AI 요약</h3>
              {usageInfo && (
                <div className="usage-info">
                  <div className="usage-stats">
                    <div className="usage-item">
                      <span className="usage-label">사용량:</span>
                      <span className="usage-value">{usageInfo.totalUsage}회</span>
                    </div>
                    {usageInfo.accountType === 'free' && (
                      <div className="usage-item">
                        <span className="usage-label">잔여량:</span>
                        <span className={`usage-value ${usageInfo.remainingUsage <= 2 ? 'warning' : ''}`}>
                          {usageInfo.remainingUsage}회
                        </span>
                      </div>
                    )}
                    {usageInfo.accountType === 'premium' && (
                      <div className="usage-item">
                        <span className="usage-label">계정:</span>
                        <span className="usage-value premium">프리미엄</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!summary && !summaryLoading && !summaryError && (
              <div className="summary-prompt">
                <p>AI가 입찰공고를 분석하여 핵심 정보를 요약해드립니다.</p>
                <div className="summary-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleGetSummary}
                    disabled={usageInfo?.remainingUsage === 0}
                  >
                    {usageInfo?.remainingUsage === 0 ? '사용 한도 초과' : `AI 요약 생성 (${usageInfo?.remainingUsage || 0}회 남음)`}
                  </button>
                  {usageInfo?.remainingUsage === 0 && usageInfo?.accountType === 'free' && (
                    <p className="upgrade-prompt">
                      더 많은 요약을 원하시면 <strong>프리미엄 계정</strong>으로 업그레이드하세요!
                    </p>
                  )}
                </div>
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
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            닫기
          </button>
          {bid.bidNtceDtlUrl && (
            <a
              href={bid.bidNtceDtlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              원문 보기
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidSummaryModal;
