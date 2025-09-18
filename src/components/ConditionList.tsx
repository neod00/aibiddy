import React, { useState } from 'react';
import { useCondition } from '../contexts/ConditionContext';
import { SearchCondition } from '../types/condition';
import ConditionForm from './ConditionForm';
import './ConditionList.css';

const ConditionList: React.FC = () => {
  const { conditions, deleteCondition, toggleCondition, loading, error } = useCondition();
  const [showForm, setShowForm] = useState(false);
  const [editingCondition, setEditingCondition] = useState<SearchCondition | null>(null);

  const handleEdit = (condition: SearchCondition) => {
    setEditingCondition(condition);
    setShowForm(true);
  };

  const handleDelete = async (condition: SearchCondition) => {
    if (window.confirm(`"${condition.keyword}" 조건을 삭제하시겠습니까?`)) {
      await deleteCondition(condition.id);
    }
  };

  const handleToggle = async (condition: SearchCondition) => {
    await toggleCondition(condition.id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCondition(null);
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '제한없음';
    return `${amount.toLocaleString()}만원`;
  };

  const formatInterval = (interval: string) => {
    const intervals = {
      '1hour': '1시간마다',
      '3hours': '3시간마다',
      '6hours': '6시간마다',
      'daily': '하루 1회 (09:00)',
    };
    return intervals[interval as keyof typeof intervals] || interval;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (showForm) {
    return (
      <div className="condition-list-container">
        <ConditionForm 
          onClose={handleCloseForm}
          editingCondition={editingCondition}
        />
      </div>
    );
  }

  return (
    <div className="condition-list-container">
      <div className="condition-list-header">
        <div className="header-left">
          <h2>알림 조건 관리</h2>
          <p>등록된 조건: {conditions.length}개</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          + 새 조건 등록
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>조건을 불러오는 중...</p>
        </div>
      )}

      {!loading && conditions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>등록된 조건이 없습니다</h3>
          <p>새 조건을 등록하여 입찰공고 알림을 받아보세요.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            첫 번째 조건 등록하기
          </button>
        </div>
      )}

      {!loading && conditions.length > 0 && (
        <div className="condition-list">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className={`condition-item ${!condition.isActive ? 'inactive' : ''}`}
            >
              <div className="condition-header">
                <div className="condition-title">
                  <h3>{condition.keyword}</h3>
                  <span className={`condition-type ${condition.type ? 'active' : ''}`}>
                    {condition.type || '전체'}
                  </span>
                </div>
                <div className="condition-actions">
                  <button
                    className={`toggle-btn ${condition.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggle(condition)}
                    disabled={loading}
                    title={condition.isActive ? '비활성화' : '활성화'}
                  >
                    {condition.isActive ? '🔔' : '🔕'}
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(condition)}
                    disabled={loading}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(condition)}
                    disabled={loading}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="condition-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">금액:</span>
                    <span className="detail-value">
                      {formatAmount(condition.minAmount)} ~ {formatAmount(condition.maxAmount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">알림:</span>
                    <span className="detail-value">{formatInterval(condition.notificationInterval)}</span>
                  </div>
                </div>

                {(condition.agency || condition.region) && (
                  <div className="detail-row">
                    {condition.agency && (
                      <div className="detail-item">
                        <span className="detail-label">기관:</span>
                        <span className="detail-value">{condition.agency}</span>
                      </div>
                    )}
                    {condition.region && (
                      <div className="detail-item">
                        <span className="detail-label">지역:</span>
                        <span className="detail-value">{condition.region}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="condition-meta">
                  <span className="created-date">
                    등록일: {formatDate(condition.createdAt)}
                  </span>
                  {condition.lastTriggeredAt && (
                    <span className="last-triggered">
                      마지막 알림: {formatDate(condition.lastTriggeredAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConditionList;
