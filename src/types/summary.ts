// AI 요약 관련 타입 정의

export interface BidSummary {
  id: string;
  bidId: string;
  userId: string;
  summary: {
    coreRequirements: string;
    requiredDocuments: string;
    deadline: string;
    budget: string;
  };
  createdAt: string;
}

export interface SummaryRequest {
  bidId: string;
  bidTitle: string;
  bidContent: string;
}

export interface SummaryResponse {
  success: boolean;
  summary?: {
    coreRequirements: string;
    requiredDocuments: string;
    deadline: string;
    budget: string;
  };
  error?: string;
  usageCount?: number;
  remainingUsage?: number;
}

export interface UsageInfo {
  totalUsage: number;
  remainingUsage: number;
  accountType: 'free' | 'premium';
}

export interface SummaryContextType {
  usageInfo: UsageInfo | null;
  getSummary: (bidId: string, bidTitle: string, bidContent: string) => Promise<SummaryResponse>;
  loading: boolean;
  error: string | null;
}
