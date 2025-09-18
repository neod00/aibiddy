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
      // Google Sheets API 초기화
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
      await this.ensureInitialized();
      await this.ensureSheetExists('Users');

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const values = [
        [
          userId,
          user.email,
          user.name || '',
          user.phone || '',
          user.company || '',
          now,
          now,
          'TRUE'
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:H',
        valueInputOption: 'RAW',
        requestBody: { values },
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
      await this.ensureInitialized();
      await this.ensureSheetExists('Users');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:H',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null; // 헤더만 있는 경우

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[1] === email) {
          return {
            id: row[0],
            email: row[1],
            name: row[2] || '',
            phone: row[3] || '',
            company: row[4] || '',
            createdAt: row[5] || '',
            updatedAt: row[6] || '',
            isActive: row[7] === 'TRUE',
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
      await this.ensureInitialized();
      await this.ensureSheetExists('Users');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:H',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) throw new Error('사용자를 찾을 수 없습니다.');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] === userId) {
          const updatedRow = [
            row[0], // ID
            updates.email || row[1], // Email
            updates.name || row[2], // Name
            updates.phone || row[3], // Phone
            updates.company || row[4], // Company
            row[5], // CreatedAt
            new Date().toISOString(), // UpdatedAt
            updates.isActive !== undefined ? (updates.isActive ? 'TRUE' : 'FALSE') : row[7], // IsActive
          ];

          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `Users!A${i + 1}:H${i + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [updatedRow] },
          });

          return;
        }
      }

      throw new Error('사용자를 찾을 수 없습니다.');
    } catch (error) {
      console.error('사용자 업데이트 중 오류 발생:', error);
      throw new Error('사용자 정보를 업데이트하는데 실패했습니다.');
    }
  }

  // 조건 저장
  async addCondition(condition: Omit<SearchCondition, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('Conditions');

      const conditionId = `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const values = [
        [
          conditionId,
          condition.userId,
          condition.keyword,
          condition.type,
          condition.minAmount || '',
          condition.maxAmount || '',
          condition.agency,
          condition.region,
          condition.notificationInterval,
          condition.isActive ? 'TRUE' : 'FALSE',
          now,
          condition.lastTriggeredAt || ''
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Conditions!A:L',
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      return conditionId;
    } catch (error) {
      console.error('조건 저장 중 오류 발생:', error);
      throw new Error('조건을 저장하는데 실패했습니다.');
    }
  }

  // 사용자 조건 조회
  async getUserConditions(userId: string): Promise<SearchCondition[]> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('Conditions');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Conditions!A:L',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return []; // 헤더만 있는 경우

      const conditions: SearchCondition[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[1] === userId) {
          conditions.push({
            id: row[0],
            userId: row[1],
            keyword: row[2],
            type: row[3] as any,
            minAmount: row[4] ? parseFloat(row[4]) : null,
            maxAmount: row[5] ? parseFloat(row[5]) : null,
            agency: row[6],
            region: row[7],
            notificationInterval: row[8] as any,
            isActive: row[9] === 'TRUE',
            createdAt: row[10],
            lastTriggeredAt: row[11] || undefined,
          });
        }
      }

      return conditions;
    } catch (error) {
      console.error('조건 조회 중 오류 발생:', error);
      throw new Error('조건을 조회하는데 실패했습니다.');
    }
  }

  // 조건 업데이트
  async updateCondition(conditionId: string, updates: Partial<SearchCondition>): Promise<void> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('Conditions');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Conditions!A:L',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) throw new Error('조건을 찾을 수 없습니다.');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] === conditionId) {
          const updatedRow = [
            row[0], // ID
            row[1], // UserId
            updates.keyword || row[2], // Keyword
            updates.type || row[3], // Type
            updates.minAmount || row[4], // MinAmount
            updates.maxAmount || row[5], // MaxAmount
            updates.agency || row[6], // Agency
            updates.region || row[7], // Region
            updates.notificationInterval || row[8], // NotificationInterval
            updates.isActive !== undefined ? (updates.isActive ? 'TRUE' : 'FALSE') : row[9], // IsActive
            row[10], // CreatedAt
            updates.lastTriggeredAt || row[11], // LastTriggeredAt
          ];

          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `Conditions!A${i + 1}:L${i + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [updatedRow] },
          });

          return;
        }
      }

      throw new Error('조건을 찾을 수 없습니다.');
    } catch (error) {
      console.error('조건 업데이트 중 오류 발생:', error);
      throw new Error('조건을 업데이트하는데 실패했습니다.');
    }
  }

  // 조건 삭제
  async deleteCondition(conditionId: string): Promise<void> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('Conditions');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Conditions!A:L',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) throw new Error('조건을 찾을 수 없습니다.');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] === conditionId) {
          // 행 삭제
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
              requests: [{
                deleteDimension: {
                  range: {
                    sheetId: 0, // Conditions 시트
                    dimension: 'ROWS',
                    startIndex: i,
                    endIndex: i + 1,
                  },
                },
              }],
            },
          });

          return;
        }
      }

      throw new Error('조건을 찾을 수 없습니다.');
    } catch (error) {
      console.error('조건 삭제 중 오류 발생:', error);
      throw new Error('조건을 삭제하는데 실패했습니다.');
    }
  }

  // 사용자 설정 저장
  async saveUserSettings(userId: string, settings: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('UserSettings');

      const settingsId = `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const values = [
        [
          settingsId,
          userId,
          settings.emailNotifications ? 'TRUE' : 'FALSE',
          settings.smsNotifications ? 'TRUE' : 'FALSE',
          settings.pushNotifications ? 'TRUE' : 'FALSE',
          settings.notificationFrequency,
          settings.language,
          settings.theme,
          now,
          now
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'UserSettings!A:J',
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      return settingsId;
    } catch (error) {
      console.error('사용자 설정 저장 중 오류 발생:', error);
      throw new Error('사용자 설정을 저장하는데 실패했습니다.');
    }
  }

  // 사용자 설정 조회
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('UserSettings');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'UserSettings!A:J',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null; // 헤더만 있는 경우

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[1] === userId) {
          return {
            id: row[0],
            userId: row[1],
            emailNotifications: row[2] === 'TRUE',
            smsNotifications: row[3] === 'TRUE',
            pushNotifications: row[4] === 'TRUE',
            notificationFrequency: row[5] as any,
            language: row[6] as any,
            theme: row[7] as any,
            createdAt: row[8],
            updatedAt: row[9],
          };
        }
      }

      return null;
    } catch (error) {
      console.error('사용자 설정 조회 중 오류 발생:', error);
      throw new Error('사용자 설정을 조회하는데 실패했습니다.');
    }
  }

  // 알림 설정 저장
  async saveNotificationSettings(userId: string, settings: Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('NotificationSettings');

      const settingsId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const values = [
        [
          settingsId,
          userId,
          settings.email ? 'TRUE' : 'FALSE',
          settings.sms ? 'TRUE' : 'FALSE',
          settings.push ? 'TRUE' : 'FALSE',
          settings.frequency,
          settings.quietHours.enabled ? 'TRUE' : 'FALSE',
          settings.quietHours.start,
          settings.quietHours.end,
          now,
          now
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'NotificationSettings!A:K',
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      return settingsId;
    } catch (error) {
      console.error('알림 설정 저장 중 오류 발생:', error);
      throw new Error('알림 설정을 저장하는데 실패했습니다.');
    }
  }

  // 알림 설정 조회
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('NotificationSettings');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'NotificationSettings!A:K',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null; // 헤더만 있는 경우

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[1] === userId) {
          return {
            id: row[0],
            userId: row[1],
            email: row[2] === 'TRUE',
            sms: row[3] === 'TRUE',
            push: row[4] === 'TRUE',
            frequency: row[5] as any,
            quietHours: {
              enabled: row[6] === 'TRUE',
              start: row[7],
              end: row[8],
            },
            createdAt: row[9],
            updatedAt: row[10],
          };
        }
      }

      return null;
    } catch (error) {
      console.error('알림 설정 조회 중 오류 발생:', error);
      throw new Error('알림 설정을 조회하는데 실패했습니다.');
    }
  }

  // 모든 사용자 조회 (관리자용)
  async getAllUsers(): Promise<User[]> {
    try {
      await this.ensureInitialized();
      await this.ensureSheetExists('Users');

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:H',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return []; // 헤더만 있는 경우

      const users: User[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        users.push({
          id: row[0],
          email: row[1],
          name: row[2] || '',
          phone: row[3] || '',
          company: row[4] || '',
          createdAt: row[5] || '',
          updatedAt: row[6] || '',
          isActive: row[7] === 'TRUE',
        });
      }

      return users;
    } catch (error) {
      console.error('사용자 목록 조회 중 오류 발생:', error);
      throw new Error('사용자 목록을 조회하는데 실패했습니다.');
    }
  }
}

export default new GoogleSheetsService();