import { google } from 'googleapis';
import { User } from '../types/user';
import { SearchCondition, GoogleSheetsCondition } from '../types/condition';

// 사용자 설정 타입 정의
export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  language: 'ko' | 'en';
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

// 알림 설정 타입 정의
export interface NotificationSettings {
  id: string;
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  createdAt: string;
  updatedAt: string;
}

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.spreadsheetId = '1DXSWEyesl6Nz0N3HWMaPjvDB5X2V-e9AAUgB-eOrb0c';
    this.initializeSheets();
  }

  private async initializeSheets() {
    try {
      // 브라우저 환경에서는 Netlify Functions를 통해 처리
      if (typeof window !== 'undefined') {
        this.isInitialized = true;
        console.log('브라우저 환경에서 Google Sheets API 사용 (Netlify Functions)');
        return;
      }

      // 서버 환경에서만 직접 API 초기화
      const auth = new google.auth.GoogleAuth({
        keyFile: './ai-biddy-a2691667fb7b.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.isInitialized = true;
      console.log('Google Sheets API 초기화 완료');
    } catch (error) {
      console.error('Google Sheets API 초기화 실패:', error);
      this.isInitialized = false;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeSheets();
    }
    if (!this.isInitialized) {
      throw new Error('Google Sheets API를 초기화할 수 없습니다.');
    }
  }

  // 시트 존재 확인 및 생성
  private async ensureSheetExists(sheetName: string) {
    try {
      await this.ensureInitialized();
      
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const existingSheets = response.data.sheets || [];
      const sheetExists = existingSheets.some((sheet: any) => 
        sheet.properties.title === sheetName
      );

      if (!sheetExists) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            }],
          },
        });

        // 헤더 행 추가
        await this.addHeaders(sheetName);
      }
    } catch (error) {
      console.error(`시트 ${sheetName} 생성/확인 중 오류:`, error);
      throw error;
    }
  }

  // 헤더 행 추가
  private async addHeaders(sheetName: string) {
    try {
      if (sheetName === 'Users') {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:H1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'Email', 'Name', 'Phone', 'Company', 'CreatedAt', 'UpdatedAt', 'IsActive']],
          },
        });
      } else if (sheetName === 'Conditions') {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:L1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'UserId', 'Keyword', 'Type', 'MinAmount', 'MaxAmount', 'Agency', 'Region', 'NotificationInterval', 'IsActive', 'CreatedAt', 'LastTriggeredAt']],
          },
        });
      } else if (sheetName === 'UserSettings') {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:I1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'UserId', 'EmailNotifications', 'SmsNotifications', 'PushNotifications', 'NotificationFrequency', 'Language', 'Theme', 'CreatedAt', 'UpdatedAt']],
          },
        });
      } else if (sheetName === 'NotificationSettings') {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${sheetName}!A1:J1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['ID', 'UserId', 'Email', 'Sms', 'Push', 'Frequency', 'QuietHoursEnabled', 'QuietHoursStart', 'QuietHoursEnd', 'CreatedAt', 'UpdatedAt']],
          },
        });
      }
    } catch (error) {
      console.error(`헤더 추가 중 오류 (${sheetName}):`, error);
    }
  }

  // 사용자 데이터 저장
  async saveUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      // Netlify Functions를 통해 Google Sheets에 저장
      const response = await fetch('/.netlify/functions/save-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('사용자 저장에 실패했습니다.');
      }

      const result = await response.json();
      return result.userId;
    } catch (error) {
      console.error('사용자 저장 중 오류 발생:', error);
      // Fallback: 로컬 스토리지 사용
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      const newUser = { id: userId, ...user };
      users.push(newUser);
      localStorage.setItem('ai_nakchali_users', JSON.stringify(users));
      return userId;
    }
  }

  // 이메일로 사용자 조회
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await fetch(`/.netlify/functions/get-user?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('사용자 조회에 실패했습니다.');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('사용자 조회 중 오류 발생:', error);
      // Fallback: 로컬 스토리지 사용
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      const user = users.find((u: User) => u.email === email);
      return user || null;
    }
  }

  // 사용자 정보 업데이트 (임시로 로컬 스토리지 사용)
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

  // 조건 저장
  async addCondition(condition: Omit<SearchCondition, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const response = await fetch('/.netlify/functions/save-condition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(condition),
      });

      if (!response.ok) {
        throw new Error('조건 저장에 실패했습니다.');
      }

      const result = await response.json();
      return result.conditionId;
    } catch (error) {
      console.error('조건 저장 중 오류 발생:', error);
      // Fallback: 로컬 스토리지 사용
      const conditionId = `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const newCondition: SearchCondition = {
        ...condition,
        id: conditionId,
        userId: condition.userId,
        createdAt: now,
      };
      const conditions = JSON.parse(localStorage.getItem('ai_nakchali_conditions') || '[]');
      conditions.push(newCondition);
      localStorage.setItem('ai_nakchali_conditions', JSON.stringify(conditions));
      return conditionId;
    }
  }

  // 사용자 조건 조회
  async getUserConditions(userId: string): Promise<SearchCondition[]> {
    try {
      const response = await fetch(`/.netlify/functions/get-conditions?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        throw new Error('조건 조회에 실패했습니다.');
      }

      const result = await response.json();
      return result.conditions;
    } catch (error) {
      console.error('조건 조회 중 오류 발생:', error);
      // Fallback: 로컬 스토리지 사용
      const conditions = JSON.parse(localStorage.getItem('ai_nakchali_conditions') || '[]');
      return conditions.filter((condition: SearchCondition) => condition.userId === userId);
    }
  }

  // 조건 업데이트 (로컬 스토리지 fallback)
  async updateCondition(conditionId: string, updates: Partial<SearchCondition>): Promise<void> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const conditions = JSON.parse(localStorage.getItem('ai_nakchali_conditions') || '[]');
      const conditionIndex = conditions.findIndex((c: SearchCondition) => c.id === conditionId);
      
      if (conditionIndex === -1) {
        throw new Error('조건을 찾을 수 없습니다.');
      }

      conditions[conditionIndex] = { ...conditions[conditionIndex], ...updates };
      localStorage.setItem('ai_nakchali_conditions', JSON.stringify(conditions));
    } catch (error) {
      console.error('조건 업데이트 중 오류 발생:', error);
      throw new Error('조건을 업데이트하는데 실패했습니다.');
    }
  }

  // 조건 삭제 (로컬 스토리지 fallback)
  async deleteCondition(conditionId: string): Promise<void> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const conditions = JSON.parse(localStorage.getItem('ai_nakchali_conditions') || '[]');
      const filteredConditions = conditions.filter((c: SearchCondition) => c.id !== conditionId);
      
      if (filteredConditions.length === conditions.length) {
        throw new Error('조건을 찾을 수 없습니다.');
      }

      localStorage.setItem('ai_nakchali_conditions', JSON.stringify(filteredConditions));
    } catch (error) {
      console.error('조건 삭제 중 오류 발생:', error);
      throw new Error('조건을 삭제하는데 실패했습니다.');
    }
  }

  // 사용자 설정 저장 (로컬 스토리지 fallback)
  async saveUserSettings(userId: string, settings: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const settingsId = `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const userSettings: UserSettings = {
        id: settingsId,
        userId,
        ...settings,
        createdAt: now,
        updatedAt: now,
      };

      localStorage.setItem(`ai_nakchali_user_settings_${userId}`, JSON.stringify(userSettings));
      return settingsId;
    } catch (error) {
      console.error('사용자 설정 저장 중 오류 발생:', error);
      throw new Error('사용자 설정을 저장하는데 실패했습니다.');
    }
  }

  // 사용자 설정 조회 (로컬 스토리지 fallback)
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const settings = localStorage.getItem(`ai_nakchali_user_settings_${userId}`);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('사용자 설정 조회 중 오류 발생:', error);
      throw new Error('사용자 설정을 조회하는데 실패했습니다.');
    }
  }

  // 알림 설정 저장 (로컬 스토리지 fallback)
  async saveNotificationSettings(userId: string, settings: Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const settingsId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const notificationSettings: NotificationSettings = {
        id: settingsId,
        userId,
        ...settings,
        createdAt: now,
        updatedAt: now,
      };

      localStorage.setItem(`ai_nakchali_notification_settings_${userId}`, JSON.stringify(notificationSettings));
      return settingsId;
    } catch (error) {
      console.error('알림 설정 저장 중 오류 발생:', error);
      throw new Error('알림 설정을 저장하는데 실패했습니다.');
    }
  }

  // 알림 설정 조회 (로컬 스토리지 fallback)
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const settings = localStorage.getItem(`ai_nakchali_notification_settings_${userId}`);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('알림 설정 조회 중 오류 발생:', error);
      throw new Error('알림 설정을 조회하는데 실패했습니다.');
    }
  }

  // 모든 사용자 조회 (관리자용) - 로컬 스토리지 fallback
  async getAllUsers(): Promise<User[]> {
    try {
      // TODO: Netlify Function 구현 필요
      // 현재는 로컬 스토리지 사용
      const users = JSON.parse(localStorage.getItem('ai_nakchali_users') || '[]');
      return users;
    } catch (error) {
      console.error('사용자 목록 조회 중 오류 발생:', error);
      throw new Error('사용자 목록을 조회하는데 실패했습니다.');
    }
  }
}

export default new GoogleSheetsService();