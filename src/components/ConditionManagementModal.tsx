import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCondition } from '../contexts/ConditionContext';
import googleSheetsService from '../services/googleSheetsService';
import './ConditionManagementModal.css';

interface ConditionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConditionManagementModal: React.FC<ConditionManagementModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { conditions, addCondition, updateCondition, deleteCondition, toggleCondition } = useCondition();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadConditions();
    }
  }, [isOpen, user]);

  const loadConditions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userConditions = await googleSheetsService.getUserConditions(user.id);
      // ConditionContext에 로드된 조건들을 설정하는 로직 필요
      setMessage(`${userConditions.length}개의 조건을 불러왔습니다.`);
    } catch (error) {
      console.error('조건 로드 중 오류:', error);
      setMessage('조건을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conditionId: string) => {
    if (!window.confirm('이 조건을 삭제하시겠습니까?')) return;

    try {
      await deleteCondition(conditionId);
      setMessage('조건이 삭제되었습니다.');
    } catch (error) {
      console.error('조건 삭제 중 오류:', error);
      setMessage('조건 삭제에 실패했습니다.');
    }
  };

  const handleToggle = async (conditionId: string) => {
    try {
      await toggleCondition(conditionId);
      setMessage('조건 상태가 변경되었습니다.');
    } catch (error) {
      console.error('조건 상태 변경 중 오류:', error);
      setMessage('조건 상태 변경에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content condition-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 내 조건 관리</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-description">
          <p>저장된 검색 조건을 관리하고 알림 설정을 조정할 수 있습니다.</p>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">조건을 불러오는 중...</div>
          ) : (
            <div className="conditions-list">
              {conditions.length === 0 ? (
                <div className="empty-state">
                  <p>저장된 조건이 없습니다.</p>
                  <p>검색 페이지에서 조건을 추가해보세요.</p>
                </div>
              ) : (
                <div className="conditions-grid">
                  {conditions.map((condition) => (
                    <div key={condition.id} className="condition-card">
                      <div className="condition-header">
                        <div className="condition-title">
                          <h4>{condition.keyword}</h4>
                          <div className={`status-badge ${condition.isActive ? 'active' : 'inactive'}`}>
                            {condition.isActive ? '활성' : '비활성'}
                          </div>
                        </div>
                        <div className="condition-actions">
                          <button
                            className={`toggle-button ${condition.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggle(condition.id)}
                            title={condition.isActive ? '비활성화' : '활성화'}
                          >
                            {condition.isActive ? '⏸️' : '▶️'}
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(condition.id)}
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="condition-details">
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-icon">🏷️</span>
                            <span className="label">유형</span>
                            <span className="value">{condition.type || '전체'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            <span className="label">금액</span>
                            <span className="value">
                              {condition.minAmount ? `${condition.minAmount.toLocaleString()}원` : '0원'} ~ 
                              {condition.maxAmount ? `${condition.maxAmount.toLocaleString()}원` : '제한없음'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-icon">🏢</span>
                            <span className="label">기관</span>
                            <span className="value">{condition.agency || '전체'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span className="label">지역</span>
                            <span className="value">{condition.region || '전체'}</span>
                          </div>
                        </div>
                        
                        <div className="detail-row">
                          <div className="detail-item">
                            <span className="detail-icon">⏰</span>
                            <span className="label">알림 주기</span>
                            <span className="value">
                              {condition.notificationInterval === '1hour' ? '1시간마다' :
                               condition.notificationInterval === '3hours' ? '3시간마다' :
                               condition.notificationInterval === '6hours' ? '6시간마다' :
                               condition.notificationInterval === 'daily' ? '일일' : '알 수 없음'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">📅</span>
                            <span className="label">생성일</span>
                            <span className="value">
                              {new Date(condition.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {message && (
                <div className={`message ${message.includes('실패') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="refresh-button" onClick={loadConditions}>
            새로고침
          </button>
          <button className="close-button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ConditionManagementModal;