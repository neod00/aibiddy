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
    dateRange: 'today', // 기본값: 당일
    dateCriteria: 'opening', // 기본값: 개찰일
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
      case 'today':
        startDate = today;
        break;
      case '1week':
        startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '1month':
        startDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case '3months':
        startDate = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      case '6months':
        startDate = new Date(today.getTime() - (180 * 24 * 60 * 60 * 1000));
        break;
      case '1year':
        startDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));
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
      dateRange: 'today',
      dateCriteria: 'opening',
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
            <label>기간</label>
            
            {/* 날짜 기준 선택 */}
            <div className="date-criteria-section">
              <div className="date-criteria-label">
                <label>검색 기준</label>
                <span className="date-criteria-description">
                  조달청 API에서 지원하는 2가지 검색 기준
                </span>
              </div>
              <div className="date-criteria-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="dateCriteria"
                    value="input"
                    checked={formData.dateCriteria === 'input'}
                    onChange={handleInputChange}
                  />
                  <span>공고게시일시</span>
                  <small>입찰공고가 게시된 날짜</small>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="dateCriteria"
                    value="opening"
                    checked={formData.dateCriteria === 'opening'}
                    onChange={handleInputChange}
                  />
                  <span>개찰일시</span>
                  <small>입찰이 개찰되는 날짜</small>
                </label>
              </div>
            </div>

            {/* 빠른 선택 버튼 */}
            <div className="date-range-buttons">
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === 'today' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('today')}
              >
                당일
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '1week' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('1week')}
              >
                1주일
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '1month' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('1month')}
              >
                1개월
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '3months' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('3months')}
              >
                3개월
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '6months' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('6months')}
              >
                6개월
              </button>
              <button
                type="button"
                className={`date-range-btn ${formData.dateRange === '1year' ? 'active' : ''}`}
                onClick={() => handleDateRangeChange('1year')}
              >
                1년
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
