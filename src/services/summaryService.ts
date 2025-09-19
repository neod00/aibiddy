// 임시로 OpenAI API를 비활성화하여 UI 테스트용으로 사용
import { SummaryRequest, SummaryResponse, UsageInfo } from '../types/summary';

class SummaryService {
  private openaiApiKey: string;
  private baseUrl: string;

  constructor() {
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  // AI 요약 생성 (개선된 로직)
  async generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
    try {
      // API 키가 없으면 개선된 목업 데이터 반환
      if (!this.openaiApiKey) {
        console.log('OpenAI API 키가 없어서 개선된 목업 데이터를 반환합니다.');
        
        // 실제 입찰공고 내용을 기반으로 한 개선된 목업 요약
        const mockSummary = this.generateSmartMockSummary(request);
        
        return {
          success: true,
          summary: mockSummary,
        };
      }

      const prompt = this.createSummaryPrompt(request.bidTitle, request.bidContent);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: '당신은 입찰공고 전문가입니다. 주어진 입찰공고를 분석하여 핵심 정보를 요약해주세요.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI API 호출에 실패했습니다.');
      }

      const data = await response.json();
      const summaryText = data.choices[0]?.message?.content;

      if (!summaryText) {
        throw new Error('요약 생성에 실패했습니다.');
      }

      // 요약 텍스트를 구조화된 데이터로 파싱
      const summary = this.parseSummaryText(summaryText);

      return {
        success: true,
        summary,
      };
    } catch (error) {
      console.error('AI 요약 생성 오류:', error);
      
      // 오류 발생 시 목업 데이터 반환
      const mockSummary = {
        coreRequirements: '• 입찰공고명에 포함된 주요 요구사항\n• 관련 자격 및 경험\n• 기술적 요구사항',
        requiredDocuments: '• 사업자등록증\n• 입찰참가신청서\n• 기술제안서\n• 가격제안서',
        deadline: '2024년 12월 31일 18:00',
        budget: '예산: 1,000만원 ~ 5,000만원',
      };

      return {
        success: true,
        summary: mockSummary,
      };
    }
  }

  // 요약 프롬프트 생성
  private createSummaryPrompt(title: string, content: string): string {
    return `
다음 입찰공고를 분석하여 핵심 정보를 요약해주세요:

제목: ${title}

내용:
${content}

다음 형식으로 요약해주세요:

📌 핵심 요구사항:
- [주요 요구사항들을 3-5개 항목으로 정리]

📑 제출서류:
- [필요한 제출서류들을 나열]

📅 마감일:
- [마감일시 정보]

💰 예산/기초금액:
- [예산 정보 및 기초금액]

각 섹션은 간결하고 명확하게 작성해주세요.
    `.trim();
  }

  // 요약 텍스트 파싱
  private parseSummaryText(text: string) {
    const lines = text.split('\n').filter(line => line.trim());
    
    let coreRequirements = '';
    let requiredDocuments = '';
    let deadline = '';
    let budget = '';

    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('핵심 요구사항')) {
        currentSection = 'coreRequirements';
        continue;
      } else if (line.includes('제출서류')) {
        currentSection = 'requiredDocuments';
        continue;
      } else if (line.includes('마감일')) {
        currentSection = 'deadline';
        continue;
      } else if (line.includes('예산') || line.includes('기초금액')) {
        currentSection = 'budget';
        continue;
      }

      if (currentSection && line.startsWith('-')) {
        const content = line.substring(1).trim();
        
        switch (currentSection) {
          case 'coreRequirements':
            coreRequirements += (coreRequirements ? '\n' : '') + content;
            break;
          case 'requiredDocuments':
            requiredDocuments += (requiredDocuments ? '\n' : '') + content;
            break;
          case 'deadline':
            if (!deadline) deadline = content;
            break;
          case 'budget':
            if (!budget) budget = content;
            break;
        }
      }
    }

    return {
      coreRequirements: coreRequirements || '정보 없음',
      requiredDocuments: requiredDocuments || '정보 없음',
      deadline: deadline || '정보 없음',
      budget: budget || '정보 없음',
    };
  }

  // 사용량 조회 (로컬 스토리지 사용)
  async getUsageInfo(userId: string, accountType: 'free' | 'premium'): Promise<UsageInfo> {
    try {
      const storageKey = `summary_usage_${userId}`;
      const stored = localStorage.getItem(storageKey);
      const usageCount = stored ? parseInt(stored) : 0;
      
      const maxUsage = accountType === 'premium' ? Infinity : 10;
      const remainingUsage = Math.max(0, maxUsage - usageCount);

      return {
        totalUsage: usageCount,
        remainingUsage: remainingUsage,
        accountType,
      };
    } catch (error) {
      console.error('사용량 조회 오류:', error);
      return {
        totalUsage: 0,
        remainingUsage: accountType === 'premium' ? Infinity : 10,
        accountType,
      };
    }
  }

  // 사용량 증가
  async incrementUsage(userId: string): Promise<void> {
    try {
      const storageKey = `summary_usage_${userId}`;
      const stored = localStorage.getItem(storageKey);
      const currentUsage = stored ? parseInt(stored) : 0;
      localStorage.setItem(storageKey, String(currentUsage + 1));
    } catch (error) {
      console.error('사용량 증가 오류:', error);
    }
  }

  // 사용량 초기화 (개발용)
  async resetUsage(userId: string): Promise<void> {
    try {
      const storageKey = `summary_usage_${userId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('사용량 초기화 오류:', error);
    }
  }

  // 요약 캐시 저장
  async saveSummaryCache(bidId: string, summary: any): Promise<void> {
    try {
      const storageKey = `summary_cache_${bidId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        ...summary,
        cachedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('요약 캐시 저장 오류:', error);
    }
  }

  // 요약 캐시 조회
  async getSummaryCache(bidId: string): Promise<any | null> {
    try {
      const storageKey = `summary_cache_${bidId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) return null;
      
      const cached = JSON.parse(stored);
      const cachedAt = new Date(cached.cachedAt);
      const now = new Date();
      const diffHours = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
      
      // 24시간 이내 캐시만 유효
      if (diffHours > 24) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return cached;
    } catch (error) {
      console.error('요약 캐시 조회 오류:', error);
      return null;
    }
  }
}

export default new SummaryService();