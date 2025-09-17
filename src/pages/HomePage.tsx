import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SearchForm from '../components/SearchForm';
import BidList from '../components/BidList';
import Pagination from '../components/Pagination';
import { SearchFormData, BidItem, BidSearchParams } from '../types/bid';
import bidService from '../services/bidService';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    keyword: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    agency: '',
    region: '',
  });

  const handleSearch = (formData: SearchFormData) => {
    setSearchParams(formData);
    setCurrentPage(1);
    fetchBids(formData, 1);
  };

  const fetchBids = async (params: SearchFormData, page: number) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: BidSearchParams = {
        keyword: params.keyword || undefined,
        type: params.type || undefined,
        minAmount: params.minAmount ? parseInt(params.minAmount) : undefined,
        maxAmount: params.maxAmount ? parseInt(params.maxAmount) : undefined,
        agency: params.agency || undefined,
        region: params.region || undefined,
        pageNo: page,
        numOfRows: 10,
      };

      const result = await bidService.getBidPblancListInfoThng(searchParams);
      setBids(result.bids);
      setTotalPages(Math.ceil(result.totalCount / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : '입찰공고를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBids(searchParams, page);
  };

  const handleBidClick = (bid: BidItem) => {
    navigate(`/bid/${bid.bidNtceNo}`);
  };

  // 초기 로드 시 기본 검색
  useEffect(() => {
    fetchBids(searchParams, 1);
  }, []);

  return (
    <div className="home-page">
      <div className="search-section">
        <SearchForm onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button 
              onClick={() => fetchBids(searchParams, currentPage)}
              className="retry-btn"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="results-section">
        <BidList 
          bids={bids} 
          loading={loading} 
          onBidClick={handleBidClick}
        />
      </div>

      {bids.length > 0 && (
        <div className="pagination-section">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
