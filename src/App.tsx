import React, { useState, useEffect } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import BidList from './components/BidList';
import Pagination from './components/Pagination';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConditionProvider } from './contexts/ConditionContext';
import ConditionList from './components/ConditionList';
import NotificationTest from './components/NotificationTest';
import { SearchFormData, BidItem, BidSearchParams } from './types/bid';
import bidService from './services/bidService';

function AppContent() {
  const { user } = useAuth();
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'conditions' | 'test'>('search');
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    keyword: '',
    type: '',
    minAmount: '',
    maxAmount: '',
    agency: '',
    region: '',
  });

  const handleSearch = async (formData: SearchFormData) => {
    setSearchParams(formData);
    setCurrentPage(1);
    await fetchBids(formData, 1);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchBids(searchParams, page);
  };

  const fetchBids = async (formData: SearchFormData, page: number) => {
    try {
      setLoading(true);
      setError(null);

      const params: BidSearchParams = {
        keyword: formData.keyword || undefined,
        type: formData.type as any || undefined,
        minAmount: formData.minAmount ? parseInt(formData.minAmount) : undefined,
        maxAmount: formData.maxAmount ? parseInt(formData.maxAmount) : undefined,
        agency: formData.agency || undefined,
        region: formData.region || undefined,
        pageNo: page,
        numOfRows: 10,
      };

      const response = await bidService.getBidList(params);
      
      if (response.response.header.resultCode === '00') {
        const items = response.response.body.items.item || [];
        setBids(Array.isArray(items) ? items : [items]);
        
        const totalCount = response.response.body.totalCount || 0;
        setTotalPages(Math.ceil(totalCount / 10));
      } else {
        throw new Error(response.response.header.resultMsg || 'API 호출에 실패했습니다.');
      }
    } catch (err) {
      console.error('입찰공고 조회 오류:', err);
      setError(err instanceof Error ? err.message : '입찰공고를 불러오는데 실패했습니다.');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBidClick = (bid: BidItem) => {
    // TODO: 입찰공고 상세 모달 또는 페이지로 이동
    console.log('입찰공고 클릭:', bid);
    alert(`입찰공고 상세: ${bid.bidNtceNm}`);
  };

  // 초기 로드 시 기본 검색
  useEffect(() => {
    fetchBids(searchParams, 1);
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>🏛️ AI낙찰이</h1>
              <p>나라장터 입찰공고를 쉽고 빠르게 찾아보세요</p>
            </div>
            <div className="header-right">
              {user ? (
                <UserMenu />
              ) : (
                <button 
                  className="login-btn"
                  onClick={() => setShowAuthModal(true)}
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {user && (
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveTab('search')}
              >
                🔍 입찰공고 검색
              </button>
              <button
                className={`tab-button ${activeTab === 'conditions' ? 'active' : ''}`}
                onClick={() => setActiveTab('conditions')}
              >
                🔔 알림 조건 관리
              </button>
              <button
                className={`tab-button ${activeTab === 'test' ? 'active' : ''}`}
                onClick={() => setActiveTab('test')}
              >
                🧪 알림 테스트
              </button>
            </div>
          )}

          {activeTab === 'search' && (
            <>
              <SearchForm onSearch={handleSearch} loading={loading} />
              
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

              <BidList 
                bids={bids} 
                loading={loading} 
                onBidClick={handleBidClick}
              />

              {bids.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </>
          )}

          {activeTab === 'conditions' && user && (
            <ConditionList />
          )}

          {activeTab === 'test' && user && (
            <NotificationTest />
          )}

          {!user && (
            <div className="login-prompt">
              <div className="login-prompt-content">
                <h3>로그인이 필요합니다</h3>
                <p>알림 조건을 관리하려면 먼저 로그인해주세요.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAuthModal(true)}
                >
                  로그인하기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 AI낙찰이. 나라장터 데이터를 활용한 입찰공고 검색 서비스</p>
        </div>
      </footer>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ConditionProvider>
        <AppContent />
      </ConditionProvider>
    </AuthProvider>
  );
}

export default App;