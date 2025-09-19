import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleClose = () => {
    setMode(initialMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          ×
        </button>
        
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={handleSwitchMode} onClose={handleClose} />
        ) : (
          <RegisterForm onSwitchToLogin={handleSwitchMode} onClose={handleClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
