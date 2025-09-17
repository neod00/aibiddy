import React, { useState } from 'react';
import { SearchFormData } from '../types/bid';
import './SearchForm.css';

interface SearchFormProps {
  onSearch: (formData: SearchFormData) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState<SearchFormData>({
    keyword: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    agency: '',
    region: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  const handleReset = () => {
    setFormData({
      keyword: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      agency: '',
      region: '',
    });
  };

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
};

export default SearchForm;
