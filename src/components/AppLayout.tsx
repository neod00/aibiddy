import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';
import './AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>🏛️ AI낙찰이</h1>
              <p>나라장터 입찰공고를 쉽고 빠르게 찾아보세요</p>
            </div>
            <div className="header-right">
              <ThemeToggle />
              {user && (
                <button 
                  className="upgrade-btn"
                  onClick={handleUpgrade}
                >
                  🚀 업그레이드
                </button>
              )}
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
          {children}
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
};

export default AppLayout;
