import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserMenu.css';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="user-menu">
      <button className="user-menu-trigger" onClick={toggleMenu}>
        <div className="user-avatar">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <span className="user-email">{user.email}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          <div className="menu-overlay" onClick={closeMenu} />
          <div className="user-menu-dropdown">
            <div className="user-info">
              <div className="user-avatar-large">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-email">{user.email}</div>
                <div className={`user-account-type ${user.accountType}`}>
                  {user.accountType === 'free' ? '무료 계정' : '유료 계정'}
                </div>
              </div>
            </div>
            
            <div className="menu-divider" />
            
            <div className="menu-items">
              <button className="menu-item" onClick={closeMenu}>
                <span className="menu-icon">⚙️</span>
                설정
              </button>
              <button className="menu-item" onClick={closeMenu}>
                <span className="menu-icon">📊</span>
                내 조건 관리
              </button>
              <button className="menu-item" onClick={closeMenu}>
                <span className="menu-icon">📧</span>
                알림 설정
              </button>
            </div>
            
            <div className="menu-divider" />
            
            <button className="menu-item logout" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
