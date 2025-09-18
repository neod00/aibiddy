import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/user';
import authService from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 토큰에서 사용자 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const userFromToken = authService.getUserFromToken(token);
      if (userFromToken) {
        setUser(userFromToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login({ email, password });
      
      if (result.success && result.token && result.user) {
        localStorage.setItem('authToken', result.token);
        setUser(result.user);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // 이메일 유효성 검사
      if (!authService.isValidEmail(email)) {
        setError('올바른 이메일 형식이 아닙니다.');
        return false;
      }

      // 비밀번호 강도 검사
      const passwordValidation = authService.isValidPassword(password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        return false;
      }

      const result = await authService.register({
        email,
        password,
        confirmPassword: password,
      });
      
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
