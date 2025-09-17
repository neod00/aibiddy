import { SearchCondition, GoogleSheetsCondition } from '../types/condition';

class ConditionService {
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_ID || '';
  }

  // 조건 목록 조회
  async getConditions(userId: string): Promise<SearchCondition[]> {
    try {
      // 실제 구현에서는 Google Sheets API 호출
      // 현재는 로컬 스토리지 사용 (개발용)
      const stored = localStorage.getItem(`conditions_${userId}`);
      if (!stored) return [];

      const conditions: GoogleSheetsCondition[] = JSON.parse(stored);
      return conditions.map(this.mapGoogleSheetsToCondition);
    } catch (error) {
      console.error('조건 조회 중 오류 발생:', error);
      throw new Error('조건을 불러오는데 실패했습니다.');
    }
  }

  // 조건 추가
  async addCondition(condition: Omit<SearchCondition, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const conditionId = `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newCondition: SearchCondition = {
        ...condition,
        id: conditionId,
        userId: '', // 실제로는 현재 사용자 ID
        createdAt: new Date().toISOString(),
      };

      // 실제 구현에서는 Google Sheets API 호출
      // 현재는 로컬 스토리지 사용 (개발용)
      const existing = localStorage.getItem(`conditions_${newCondition.userId}`) || '[]';
      const conditions: GoogleSheetsCondition[] = JSON.parse(existing);
      
      conditions.push(this.mapConditionToGoogleSheets(newCondition));
      localStorage.setItem(`conditions_${newCondition.userId}`, JSON.stringify(conditions));

      return conditionId;
    } catch (error) {
      console.error('조건 추가 중 오류 발생:', error);
      throw new Error('조건을 추가하는데 실패했습니다.');
    }
  }

  // 조건 업데이트
  async updateCondition(conditionId: string, updates: Partial<SearchCondition>): Promise<void> {
    try {
      // 실제 구현에서는 Google Sheets API 호출
      // 현재는 로컬 스토리지 사용 (개발용)
      const userId = ''; // 실제로는 현재 사용자 ID
      const stored = localStorage.getItem(`conditions_${userId}`);
      if (!stored) throw new Error('조건을 찾을 수 없습니다.');

      const conditions: GoogleSheetsCondition[] = JSON.parse(stored);
      const index = conditions.findIndex(c => c.id === conditionId);
      
      if (index === -1) throw new Error('조건을 찾을 수 없습니다.');

      conditions[index] = {
        ...conditions[index],
        ...this.mapConditionToGoogleSheets(updates as SearchCondition),
      };

      localStorage.setItem(`conditions_${userId}`, JSON.stringify(conditions));
    } catch (error) {
      console.error('조건 업데이트 중 오류 발생:', error);
      throw new Error('조건을 업데이트하는데 실패했습니다.');
    }
  }

  // 조건 삭제
  async deleteCondition(conditionId: string): Promise<void> {
    try {
      // 실제 구현에서는 Google Sheets API 호출
      // 현재는 로컬 스토리지 사용 (개발용)
      const userId = ''; // 실제로는 현재 사용자 ID
      const stored = localStorage.getItem(`conditions_${userId}`);
      if (!stored) throw new Error('조건을 찾을 수 없습니다.');

      const conditions: GoogleSheetsCondition[] = JSON.parse(stored);
      const filtered = conditions.filter(c => c.id !== conditionId);

      localStorage.setItem(`conditions_${userId}`, JSON.stringify(filtered));
    } catch (error) {
      console.error('조건 삭제 중 오류 발생:', error);
      throw new Error('조건을 삭제하는데 실패했습니다.');
    }
  }

  // 조건 활성화/비활성화 토글
  async toggleCondition(conditionId: string): Promise<void> {
    try {
      const userId = ''; // 실제로는 현재 사용자 ID
      const stored = localStorage.getItem(`conditions_${userId}`);
      if (!stored) throw new Error('조건을 찾을 수 없습니다.');

      const conditions: GoogleSheetsCondition[] = JSON.parse(stored);
      const index = conditions.findIndex(c => c.id === conditionId);
      
      if (index === -1) throw new Error('조건을 찾을 수 없습니다.');

      conditions[index].isActive = !conditions[index].isActive;
      localStorage.setItem(`conditions_${userId}`, JSON.stringify(conditions));
    } catch (error) {
      console.error('조건 토글 중 오류 발생:', error);
      throw new Error('조건 상태를 변경하는데 실패했습니다.');
    }
  }

  // Google Sheets 형식을 SearchCondition으로 변환
  private mapGoogleSheetsToCondition(gsCondition: GoogleSheetsCondition): SearchCondition {
    return {
      id: gsCondition.id,
      userId: gsCondition.userId,
      keyword: gsCondition.keyword,
      type: gsCondition.type as '물품' | '용역' | '공사' | '외자' | '',
      minAmount: gsCondition.minAmount,
      maxAmount: gsCondition.maxAmount,
      agency: gsCondition.agency,
      region: gsCondition.region,
      notificationInterval: gsCondition.notificationInterval as '1hour' | '3hours' | '6hours' | 'daily',
      isActive: gsCondition.isActive,
      createdAt: gsCondition.createdAt,
      lastTriggeredAt: gsCondition.lastTriggeredAt,
    };
  }

  // SearchCondition을 Google Sheets 형식으로 변환
  private mapConditionToGoogleSheets(condition: SearchCondition): GoogleSheetsCondition {
    return {
      id: condition.id,
      userId: condition.userId,
      keyword: condition.keyword,
      type: condition.type,
      minAmount: condition.minAmount,
      maxAmount: condition.maxAmount,
      agency: condition.agency,
      region: condition.region,
      notificationInterval: condition.notificationInterval,
      isActive: condition.isActive,
      createdAt: condition.createdAt,
      lastTriggeredAt: condition.lastTriggeredAt,
    };
  }

  // 조건 유효성 검사
  validateCondition(condition: Partial<SearchCondition>): { valid: boolean; message: string } {
    if (!condition.keyword || condition.keyword.trim().length === 0) {
      return {
        valid: false,
        message: '키워드를 입력해주세요.',
      };
    }

    if (condition.minAmount && condition.maxAmount && condition.minAmount > condition.maxAmount) {
      return {
        valid: false,
        message: '최소금액이 최대금액보다 클 수 없습니다.',
      };
    }

    if (condition.minAmount && condition.minAmount < 0) {
      return {
        valid: false,
        message: '최소금액은 0 이상이어야 합니다.',
      };
    }

    if (condition.maxAmount && condition.maxAmount < 0) {
      return {
        valid: false,
        message: '최대금액은 0 이상이어야 합니다.',
      };
    }

    return {
      valid: true,
      message: '유효한 조건입니다.',
    };
  }
}

export default new ConditionService();
