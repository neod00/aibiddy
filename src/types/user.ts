// 사용자 관련 타입 정의

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  accountType: 'free' | 'premium';
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export interface GoogleSheetsUser {
  id: string;
  email: string;
  passwordHash: string;
  accountType: string;
  createdAt: string;
  lastLoginAt?: string;
}
