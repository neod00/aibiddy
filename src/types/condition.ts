// 조건 관련 타입 정의

export interface SearchCondition {
  id: string;
  userId: string;
  keyword: string;
  type: '물품' | '용역' | '공사' | '외자' | '';
  minAmount: number | null;
  maxAmount: number | null;
  agency: string;
  region: string;
  notificationInterval: '1hour' | '3hours' | '6hours' | 'daily';
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface ConditionFormData {
  keyword: string;
  type: string;
  minAmount: string;
  maxAmount: string;
  agency: string;
  region: string;
  notificationInterval: string;
}

export interface GoogleSheetsCondition {
  id: string;
  userId: string;
  keyword: string;
  type: string;
  minAmount: number | null;
  maxAmount: number | null;
  agency: string;
  region: string;
  notificationInterval: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface ConditionContextType {
  conditions: SearchCondition[];
  addCondition: (condition: Omit<SearchCondition, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  updateCondition: (id: string, updates: Partial<SearchCondition>) => Promise<boolean>;
  deleteCondition: (id: string) => Promise<boolean>;
  toggleCondition: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}
