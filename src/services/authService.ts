import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import googleSheetsService from './googleSheetsService';
import { User, LoginFormData, RegisterFormData } from '../types/user';

class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.REACT_APP_JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.REACT_APP_JWT_EXPIRES_IN || '7d';
  }

  // 비밀번호 해시화
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // 비밀번호 검증
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // JWT 토큰 생성
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  // JWT 토큰 검증
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // 회원가입
  async register(formData: RegisterFormData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // 이메일 중복 확인
      const existingUser = await googleSheetsService.getUserByEmail(formData.email);
      if (existingUser) {
        return {
          success: false,
          message: '이미 가입된 이메일입니다.',
        };
      }

      // 비밀번호 확인
      if (formData.password !== formData.confirmPassword) {
        return {
          success: false,
          message: '비밀번호가 일치하지 않습니다.',
        };
      }

      // 비밀번호 해시화
      const passwordHash = await this.hashPassword(formData.password);

      // 사용자 데이터 생성
      const userData = {
        email: formData.email,
        passwordHash,
        accountType: 'free' as const,
        createdAt: new Date().toISOString(),
      };

      // Google Sheets에 저장
      const userId = await googleSheetsService.saveUser(userData);

      const user: User = {
        id: userId,
        ...userData,
      };

      return {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user,
      };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return {
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
      };
    }
  }

  // 로그인
  async login(formData: LoginFormData): Promise<{ success: boolean; message: string; token?: string; user?: User }> {
    try {
      // 사용자 조회
      const user = await googleSheetsService.getUserByEmail(formData.email);
      if (!user) {
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // 비밀번호 검증
      const isValidPassword = await this.verifyPassword(formData.password, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // 로그인 시간 업데이트
      await googleSheetsService.updateUser(user.id, {
        lastLoginAt: new Date().toISOString(),
      });

      // JWT 토큰 생성
      const token = this.generateToken(user);

      return {
        success: true,
        message: '로그인되었습니다.',
        token,
        user: {
          ...user,
          lastLoginAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      };
    }
  }

  // 토큰에서 사용자 정보 추출
  getUserFromToken(token: string): User | null {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      return {
        id: decoded.id,
        email: decoded.email,
        passwordHash: '', // 토큰에는 비밀번호 해시 포함하지 않음
        accountType: decoded.accountType,
        createdAt: '', // 토큰에는 생성일 포함하지 않음
        lastLoginAt: undefined,
      };
    } catch (error) {
      return null;
    }
  }

  // 이메일 유효성 검사
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 비밀번호 강도 검사
  isValidPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return {
        valid: false,
        message: '비밀번호는 8자 이상이어야 합니다.',
      };
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return {
        valid: false,
        message: '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.',
      };
    }

    return {
      valid: true,
      message: '유효한 비밀번호입니다.',
    };
  }
}

export default new AuthService();
