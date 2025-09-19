import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthForm.css';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      // 로그인 성공 시 폼 초기화
      setFormData({ email: '', password: '' });
      // 모달 닫기
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2>로그인</h2>
        <p>AI낙찰이에 오신 것을 환영합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${validationErrors.email ? 'error' : ''}`}
            placeholder="이메일을 입력하세요"
            disabled={loading}
          />
          {validationErrors.email && (
            <span className="error-message">{validationErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`form-input ${validationErrors.password ? 'error' : ''}`}
            placeholder="비밀번호를 입력하세요"
            disabled={loading}
          />
          {validationErrors.password && (
            <span className="error-message">{validationErrors.password}</span>
          )}
        </div>

        {error && (
          <div className="form-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="auth-form-footer">
        <p>
          계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="link-button"
            disabled={loading}
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
