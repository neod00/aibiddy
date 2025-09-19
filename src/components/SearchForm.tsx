import React, { useState, memo, useCallback } from 'react';
import { SearchFormData } from '../types/bid';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (formData: SearchFormData) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = memo(({ onSearch, loading }) => {
  // 오늘 날짜를 기본값으로 설정
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<SearchFormData>({
    keyword: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    agency: '',
    region: '',
    startDate: today, // 시작일은 오늘
    endDate: today,   // 종료일은 오늘
    dateRange: '1week', // 기본값: 최근 1주일
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // 빠른 선택 옵션 핸들러
  const handleDateRangeChange = useCallback((range: string) => {
    const today = new Date();
    let startDate: Date;
    
    switch (range) {
      case '1week':
        startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '1month':
        startDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case '3months':
        startDate = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      case 'all':
        startDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1년 전
        break;
      default:
        startDate = today;
    }
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      dateRange: range,
      startDate: formatDate(startDate),
      endDate: formatDate(today),
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  }, [onSearch, formData]);

  const handleReset = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      keyword: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      agency: '',
      region: '',
      startDate: today,
      endDate: today,
      dateRange: '1week',
    });
  }, []);

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="keyword">키워드</label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              value={formData.keyword}
              onChange={handleInputChange}
              placeholder="입찰공고명 검색"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type">종류</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">전체</option>
              <option value="물품">물품</option>
              <option value="용역">용역</option>
              <option value="공사">공사</option>
              <option value="외자">외자</option>
            </select>
          </div>
        </div>

        {/* 날짜 선택 섹션 */}
        <div className="form-row">
          <div className="form-group">
            <label>조회 기간</label>
            <div className="date-range-buttons">
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '1week' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('1week')}
              >
                최근 1주일
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '1month' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('1month')}
              >
                최근 1개월
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '3months' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('3months')}
              >
                최근 3개월
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === 'all' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('all')}
              >
                전체
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">시작일</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">종료일</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="form-input"
            />
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
              placeholder="0"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxAmount">최대금액 (만원)</label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={formData.maxAmount}
              onChange={handleInputChange}
              placeholder="999999"
              className="form-input"
            />
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
              placeholder="수요기관명 검색"
              className="form-input"
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
              placeholder="지역명 검색"
              className="form-input"
            />
          </div>
        </div>

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
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>
      </form>
    </div>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
