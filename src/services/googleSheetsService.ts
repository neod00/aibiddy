// 임시로 Google Sheets 서비스를 비활성화하여 UI 테스트용으로 사용
// import { google } from 'googleapis';
import { User } from '../types/user';

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_ID || '';
    
    // Google Sheets API 초기화 비활성화
    // const auth = new google.auth.GoogleAuth({
    //   keyFile: process.env.REACT_APP_GOOGLE_SHEETS_CREDENTIALS,
    //   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    // });

    // this.sheets = google.sheets({ version: 'v4', auth });
  }

  // 사용자 데이터 저장 (로컬 스토리지 사용)
  async saveUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 로컬 스토리지에 저장
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      const newUser = {
        id: userId,
        ...user,
      };
      users.push(newUser);
      localStorage.setItem('ai_nakchali_users', JSON.stringify(users));

      return userId;
    } catch (error) {
      console.error('사용자 저장 중 오류 발생:', error);
      throw new Error('사용자 정보를 저장하는데 실패했습니다.');
    }
  }

  // 이메일로 사용자 조회 (로컬 스토리지 사용)
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      const user = users.find((u: User) => u.email === email);
      return user || null;
    } catch (error) {
      console.error('사용자 조회 중 오류 발생:', error);
      throw new Error('사용자 정보를 조회하는데 실패했습니다.');
    }
  }

  // 사용자 정보 업데이트 (로컬 스토리지 사용)
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('ai_nakchali_users', JSON.stringify(users));
    } catch (error) {
      console.error('사용자 업데이트 중 오류 발생:', error);
      throw new Error('사용자 정보를 업데이트하는데 실패했습니다.');
    }
  }

  // 모든 사용자 조회 (관리자용)
  async getAllUsers(): Promise<User[]> {
    try {
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      return users;
    } catch (error) {
      console.error('사용자 목록 조회 중 오류 발생:', error);
      throw new Error('사용자 목록을 조회하는데 실패했습니다.');
    }
  }
}

export default new GoogleSheetsService();