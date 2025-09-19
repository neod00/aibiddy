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
  // const { user } = useAuth();
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState<SearchFormData>(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      keyword: '',
      type: '',
      minAmount: '',
      maxAmount: '',
      agency: '',
      region: '',
      startDate: today,
      endDate: today,
      dateRange: '1week',
    };
  });

  // 관리자 모드 상태
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminConditions, setAdminConditions] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalConditions: 0,
    activeConditions: 0,
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
        type: (params.type as '물품' | '용역' | '공사' | '외자') || undefined,
        minAmount: params.minAmount ? parseInt(params.minAmount) : undefined,
        maxAmount: params.maxAmount ? parseInt(params.maxAmount) : undefined,
        agency: params.agency || undefined,
        region: params.region || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
        pageNo: page,
        numOfRows: 10,
      };

      const result = await bidService.getBidList(searchParams);
      
      // API 응답 구조를 안전하게 처리
      let bids = [];
      let totalCount = 0;
      
      if (result && result.response && result.response.body) {
        const body = result.response.body;
        bids = body.items || [];
        totalCount = body.totalCount || 0;
      } else if (result && (result as any).body) {
        // 다른 응답 구조일 경우
        const body = (result as any).body;
        bids = body.items || [];
        totalCount = body.totalCount || 0;
      } else if (Array.isArray(result)) {
        // 배열로 직접 반환되는 경우
        bids = result;
        totalCount = result.length;
      }
      
      console.log('API 응답:', result);
      console.log('추출된 입찰공고:', bids);
      console.log('총 개수:', totalCount);
      
      setBids(bids);
      setTotalPages(Math.ceil(totalCount / 10));
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
  }, [searchParams]);

  // 관리자 모드 확인 및 데이터 로드
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminMode = urlParams.get('admin') === 'true';
    setIsAdminMode(adminMode);

    if (adminMode) {
      loadAdminData();
    }
  }, []);

  // 관리자 데이터 로드
  const loadAdminData = () => {
    try {
      // 사용자 데이터 로드
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      setAdminUsers(users);

      // 조건 데이터 로드
      const conditions = JSON.parse(localStorage.getItem('ai_nakchali_conditions') || '[]');
      setAdminConditions(conditions);

      // 통계 계산
      const totalUsers = users.length;
      const freeUsers = users.filter((u: any) => u.accountType === 'free').length;
      const premiumUsers = users.filter((u: any) => u.accountType === 'premium').length;
      const totalConditions = conditions.length;
      const activeConditions = conditions.filter((c: any) => c.isActive).length;

      setAdminStats({
        totalUsers,
        freeUsers,
        premiumUsers,
        totalConditions,
        activeConditions,
      });
    } catch (error) {
      console.error('관리자 데이터 로드 오류:', error);
    }
  };

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

      {/* 관리자 패널 */}
      {isAdminMode && (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>🔧 관리자 패널</h2>
            <button onClick={loadAdminData} className="admin-refresh-btn">
              새로고침
            </button>
          </div>

          <div className="admin-stats">
            <div className="stat-card">
              <h3>사용자 통계</h3>
              <div className="stat-numbers">
                <span className="stat-number">{adminStats.totalUsers}</span>
                <span className="stat-label">총 사용자</span>
              </div>
              <div className="stat-breakdown">
                <span className="free">무료: {adminStats.freeUsers}</span>
                <span className="premium">프리미엄: {adminStats.premiumUsers}</span>
              </div>
            </div>

            <div className="stat-card">
              <h3>알림 조건 통계</h3>
              <div className="stat-numbers">
                <span className="stat-number">{adminStats.totalConditions}</span>
                <span className="stat-label">총 조건</span>
              </div>
              <div className="stat-breakdown">
                <span className="active">활성: {adminStats.activeConditions}</span>
                <span className="inactive">비활성: {adminStats.totalConditions - adminStats.activeConditions}</span>
              </div>
            </div>
          </div>

          <div className="admin-tables">
            <div className="admin-table-section">
              <h3>사용자 목록 ({adminUsers.length}명)</h3>
              {adminUsers.length === 0 ? (
                <p className="no-data">등록된 사용자가 없습니다.</p>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>이메일</th>
                        <th>계정 타입</th>
                        <th>가입일</th>
                        <th>마지막 로그인</th>
                        <th>조건 수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((user, index) => {
                        const userConditions = adminConditions.filter((c: any) => c.userId === user.id);
                        return (
                          <tr key={user.id || index}>
                            <td>{user.email}</td>
                            <td>
                              <span className={`account-type ${user.accountType}`}>
                                {user.accountType === 'free' ? '무료' : '프리미엄'}
                              </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleString('ko-KR')}</td>
                            <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ko-KR') : '없음'}</td>
                            <td>{userConditions.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-table-section">
              <h3>알림 조건 목록 ({adminConditions.length}개)</h3>
              {adminConditions.length === 0 ? (
                <p className="no-data">등록된 조건이 없습니다.</p>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>사용자</th>
                        <th>키워드</th>
                        <th>종류</th>
                        <th>금액 범위</th>
                        <th>지역</th>
                        <th>알림 주기</th>
                        <th>상태</th>
                        <th>생성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminConditions.map((condition, index) => {
                        const user = adminUsers.find((u: any) => u.id === condition.userId);
                        return (
                          <tr key={condition.id || index}>
                            <td>{user?.email || '알 수 없음'}</td>
                            <td>{condition.keyword}</td>
                            <td>{condition.type || '전체'}</td>
                            <td>
                              {condition.minAmount && condition.maxAmount
                                ? `${condition.minAmount}만원 ~ ${condition.maxAmount}만원`
                                : condition.minAmount
                                ? `${condition.minAmount}만원 이상`
                                : condition.maxAmount
                                ? `${condition.maxAmount}만원 이하`
                                : '제한없음'}
                            </td>
                            <td>{condition.region || '전국'}</td>
                            <td>{condition.notificationInterval}</td>
                            <td>
                              <span className={`status ${condition.isActive ? 'active' : 'inactive'}`}>
                                {condition.isActive ? '활성' : '비활성'}
                              </span>
                            </td>
                            <td>{new Date(condition.createdAt).toLocaleString('ko-KR')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
