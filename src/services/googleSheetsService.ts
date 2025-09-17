import { google } from 'googleapis';
import { User, GoogleSheetsUser } from '../types/user';

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_ID || '';
    
    // Google Sheets API 초기화
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.REACT_APP_GOOGLE_SHEETS_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  // 사용자 데이터 저장
  async saveUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const values = [
        [
          userId,
          user.email,
          user.passwordHash,
          user.accountType,
          user.createdAt,
          user.lastLoginAt || '',
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:F',
        valueInputOption: 'RAW',
        resource: { values },
      });

      return userId;
    } catch (error) {
      console.error('사용자 저장 중 오류 발생:', error);
      throw new Error('사용자 정보를 저장하는데 실패했습니다.');
    }
  }

  // 이메일로 사용자 조회
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:F',
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) return null;

      // 헤더 제외하고 데이터 검색
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[1] === email) {
          return {
            id: row[0],
            email: row[1],
            passwordHash: row[2],
            accountType: row[3] as 'free' | 'premium',
            createdAt: row[4],
            lastLoginAt: row[5] || undefined,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('사용자 조회 중 오류 발생:', error);
      throw new Error('사용자 정보를 조회하는데 실패했습니다.');
    }
  }

  // 사용자 정보 업데이트
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:F',
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) return;

      // 사용자 찾기
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === userId) {
          rowIndex = i + 1; // Google Sheets는 1부터 시작
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 업데이트할 데이터 준비
      const updateData = [
        updates.id || rows[rowIndex - 1][0],
        updates.email || rows[rowIndex - 1][1],
        updates.passwordHash || rows[rowIndex - 1][2],
        updates.accountType || rows[rowIndex - 1][3],
        updates.createdAt || rows[rowIndex - 1][4],
        updates.lastLoginAt || rows[rowIndex - 1][5] || '',
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Users!A${rowIndex}:F${rowIndex}`,
        valueInputOption: 'RAW',
        resource: { values: [updateData] },
      });
    } catch (error) {
      console.error('사용자 업데이트 중 오류 발생:', error);
      throw new Error('사용자 정보를 업데이트하는데 실패했습니다.');
    }
  }

  // 모든 사용자 조회 (관리자용)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:F',
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) return [];

      return rows.slice(1).map((row: any[]) => ({
        id: row[0],
        email: row[1],
        passwordHash: row[2],
        accountType: row[3] as 'free' | 'premium',
        createdAt: row[4],
        lastLoginAt: row[5] || undefined,
      }));
    } catch (error) {
      console.error('사용자 목록 조회 중 오류 발생:', error);
      throw new Error('사용자 목록을 조회하는데 실패했습니다.');
    }
  }
}

export default new GoogleSheetsService();
