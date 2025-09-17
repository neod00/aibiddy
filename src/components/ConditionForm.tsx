import React, { useState } from 'react';
import { useConditions } from '../contexts/ConditionContext';
import { ConditionFormData } from '../types/condition';
import './ConditionForm.css';

interface ConditionFormProps {
  onClose: () => void;
  editingCondition?: any; // SearchCondition 타입
}

const ConditionForm: React.FC<ConditionFormProps> = ({ onClose, editingCondition }) => {
  const { addCondition, updateCondition, loading, error } = useConditions();
  const [formData, setFormData] = useState<ConditionFormData>({
    keyword: editingCondition?.keyword || '',
    type: editingCondition?.type || '',
    minAmount: editingCondition?.minAmount?.toString() || '',
    maxAmount: editingCondition?.maxAmount?.toString() || '',
    agency: editingCondition?.agency || '',
    region: editingCondition?.region || '',
    notificationInterval: editingCondition?.notificationInterval || 'daily',
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 입력 시 해당 필드의 유효성 검사 오류 제거
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.keyword.trim()) {
      errors.keyword = '키워드를 입력해주세요.';
    }

    if (formData.minAmount && formData.maxAmount) {
      const minAmount = parseInt(formData.minAmount);
      const maxAmount = parseInt(formData.maxAmount);
      
      if (isNaN(minAmount) || minAmount < 0) {
        errors.minAmount = '최소금액은 0 이상의 숫자여야 합니다.';
      }
      
      if (isNaN(maxAmount) || maxAmount < 0) {
        errors.maxAmount = '최대금액은 0 이상의 숫자여야 합니다.';
      }
      
      if (!isNaN(minAmount) && !isNaN(maxAmount) && minAmount > maxAmount) {
        errors.maxAmount = '최대금액은 최소금액보다 커야 합니다.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const conditionData = {
      keyword: formData.keyword.trim(),
      type: formData.type as '물품' | '용역' | '공사' | '외자' | '',
      minAmount: formData.minAmount ? parseInt(formData.minAmount) : null,
      maxAmount: formData.maxAmount ? parseInt(formData.maxAmount) : null,
      agency: formData.agency.trim(),
      region: formData.region.trim(),
      notificationInterval: formData.notificationInterval as '1hour' | '3hours' | '6hours' | 'daily',
      isActive: true,
    };

    let success = false;
    if (editingCondition) {
      success = await updateCondition(editingCondition.id, conditionData);
    } else {
      success = await addCondition(conditionData);
    }

    if (success) {
      onClose();
    }
  };

  const handleReset = () => {
    setFormData({
      keyword: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      agency: '',
      region: '',
      notificationInterval: 'daily',
    });
    setValidationErrors({});
  };

  return (
    <div className="condition-form-container">
      <div className="condition-form-header">
        <h2>{editingCondition ? '조건 수정' : '새 조건 등록'}</h2>
        <p>입찰공고 알림을 받을 조건을 설정하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="condition-form">
        <div className="form-group">
          <label htmlFor="keyword">키워드 *</label>
          <input
            type="text"
            id="keyword"
            name="keyword"
            value={formData.keyword}
            onChange={handleInputChange}
            className={`form-input ${validationErrors.keyword ? 'error' : ''}`}
            placeholder="입찰공고명에 포함될 키워드"
            disabled={loading}
          />
          {validationErrors.keyword && (
            <span className="error-message">{validationErrors.keyword}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">종류</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select"
              disabled={loading}
            >
              <option value="">전체</option>
              <option value="물품">물품</option>
              <option value="용역">용역</option>
              <option value="공사">공사</option>
              <option value="외자">외자</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notificationInterval">알림 주기</label>
            <select
              id="notificationInterval"
              name="notificationInterval"
              value={formData.notificationInterval}
              onChange={handleInputChange}
              className="form-select"
              disabled={loading}
            >
              <option value="1hour">1시간마다</option>
              <option value="3hours">3시간마다</option>
              <option value="6hours">6시간마다</option>
              <option value="daily">하루 1회 (09:00)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minAmount">최소금액 (만원)</label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              value={formData.minAmount}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.minAmount ? 'error' : ''}`}
              placeholder="0"
              min="0"
              disabled={loading}
            />
            {validationErrors.minAmount && (
              <span className="error-message">{validationErrors.minAmount}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="maxAmount">최대금액 (만원)</label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={formData.maxAmount}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.maxAmount ? 'error' : ''}`}
              placeholder="999999"
              min="0"
              disabled={loading}
            />
            {validationErrors.maxAmount && (
              <span className="error-message">{validationErrors.maxAmount}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="agency">기관명</label>
            <input
              type="text"
              id="agency"
              name="agency"
              value={formData.agency}
              onChange={handleInputChange}
              className="form-input"
              placeholder="수요기관명"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="region">지역</label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="form-input"
              placeholder="지역명"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="form-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={loading}
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '처리 중...' : (editingCondition ? '수정' : '등록')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConditionForm;
