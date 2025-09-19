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

  // 실제 입찰공고 내용을 기반으로 한 스마트 목업 요약 생성
  private generateSmartMockSummary(request: SummaryRequest): any {
    const { bidTitle, bidContent } = request;
    
    // 입찰공고명에서 키워드 추출
    const titleKeywords = this.extractKeywords(bidTitle);
    
    // 입찰공고 내용에서 정보 추출
    const extractedInfo = this.extractBidInfo(bidContent);
    
    // 핵심 요구사항 생성
    const coreRequirements = this.generateCoreRequirements(titleKeywords, extractedInfo);
    
    // 제출서류 생성
    const requiredDocuments = this.generateRequiredDocuments(titleKeywords, extractedInfo);
    
    // 마감일 정보
    const deadline = extractedInfo.deadline || '정보 없음';
    
    // 예산 정보
    const budget = extractedInfo.budget || '정보 없음';
    
    return {
      coreRequirements,
      requiredDocuments,
      deadline,
      budget,
    };
  }

  // 키워드 추출
  private extractKeywords(title: string): string[] {
    const keywords = [];
    
    // 기술 관련 키워드
    if (title.includes('소프트웨어') || title.includes('시스템') || title.includes('개발')) {
      keywords.push('소프트웨어 개발');
    }
    if (title.includes('AI') || title.includes('인공지능') || title.includes('머신러닝')) {
      keywords.push('AI/인공지능');
    }
    if (title.includes('웹') || title.includes('홈페이지') || title.includes('사이트')) {
      keywords.push('웹 개발');
    }
    if (title.includes('모바일') || title.includes('앱') || title.includes('어플리케이션')) {
      keywords.push('모바일 개발');
    }
    if (title.includes('데이터') || title.includes('분석') || title.includes('DB')) {
      keywords.push('데이터 분석');
    }
    if (title.includes('보안') || title.includes('암호화') || title.includes('인증')) {
      keywords.push('보안');
    }
    if (title.includes('클라우드') || title.includes('AWS') || title.includes('Azure')) {
      keywords.push('클라우드');
    }
    
    // 용역 관련 키워드
    if (title.includes('컨설팅') || title.includes('자문')) {
      keywords.push('컨설팅');
    }
    if (title.includes('교육') || title.includes('훈련') || title.includes('강의')) {
      keywords.push('교육/훈련');
    }
    if (title.includes('유지보수') || title.includes('관리') || title.includes('운영')) {
      keywords.push('유지보수/운영');
    }
    
    return keywords.length > 0 ? keywords : ['일반 용역'];
  }

  // 입찰공고 내용에서 정보 추출
  private extractBidInfo(content: string): any {
    const info: any = {};
    
    // 마감일 추출
    const deadlineMatch = content.match(/입찰마감일시[:\s]*([^\n]+)/);
    if (deadlineMatch) {
      info.deadline = deadlineMatch[1].trim();
    }
    
    // 예산 추출
    const budgetMatch = content.match(/추정가격[:\s]*([^\n]+)/);
    if (budgetMatch) {
      const amount = budgetMatch[1].trim();
      if (amount && amount !== '미정') {
        info.budget = `${parseInt(amount).toLocaleString()}만원`;
      }
    }
    
    // 기관명 추출
    const agencyMatch = content.match(/수요기관[:\s]*([^\n]+)/);
    if (agencyMatch) {
      info.agency = agencyMatch[1].trim();
    }
    
    // 지역 추출
    const regionMatch = content.match(/지역[:\s]*([^\n]+)/);
    if (regionMatch) {
      info.region = regionMatch[1].trim();
    }
    
    return info;
  }

  // 핵심 요구사항 생성
  private generateCoreRequirements(keywords: string[], info: any): string {
    let requirements = '';
    
    // 기술적 요구사항
    if (keywords.includes('소프트웨어 개발')) {
      requirements += '• 관련 프로그래밍 언어 및 프레임워크 경험\n';
      requirements += '• 소프트웨어 개발 프로젝트 수행 경험\n';
    }
    if (keywords.includes('AI/인공지능')) {
      requirements += '• AI/머신러닝 기술 보유 및 적용 경험\n';
      requirements += '• 데이터 분석 및 모델링 역량\n';
    }
    if (keywords.includes('웹 개발')) {
      requirements += '• 웹 개발 기술 스택 보유 (HTML, CSS, JavaScript, React 등)\n';
      requirements += '• 반응형 웹 디자인 구현 경험\n';
    }
    if (keywords.includes('모바일 개발')) {
      requirements += '• 모바일 앱 개발 경험 (iOS/Android)\n';
      requirements += '• 크로스 플랫폼 개발 도구 활용 능력\n';
    }
    if (keywords.includes('데이터 분석')) {
      requirements += '• 데이터베이스 설계 및 관리 경험\n';
      requirements += '• 데이터 시각화 및 분석 도구 활용\n';
    }
    if (keywords.includes('보안')) {
      requirements += '• 정보보안 관련 자격증 보유\n';
      requirements += '• 보안 시스템 구축 및 운영 경험\n';
    }
    if (keywords.includes('클라우드')) {
      requirements += '• 클라우드 플랫폼 활용 경험 (AWS, Azure, GCP 등)\n';
      requirements += '• 클라우드 아키텍처 설계 능력\n';
    }
    
    // 일반 요구사항
    requirements += '• 관련 업종 3년 이상 사업 경험\n';
    requirements += '• 안정적 재무상태 및 신용도\n';
    requirements += '• 기술인력 보유 및 프로젝트 관리 역량\n';
    
    // 기관별 특수 요구사항
    if (info.agency && info.agency.includes('청')) {
      requirements += '• 공공기관 프로젝트 수행 경험\n';
      requirements += '• 정보시스템 감리 및 보안 점검 대응 능력\n';
    }
    
    return requirements || '• 관련 업종 경험 및 기술 역량\n• 안정적 재무상태\n• 프로젝트 수행 능력';
  }

  // 제출서류 생성
  private generateRequiredDocuments(keywords: string[], info: any): string {
    let documents = '';
    
    // 기본 제출서류
    documents += '• 사업자등록증 사본\n';
    documents += '• 법인등기부등본 (법인의 경우)\n';
    documents += '• 입찰참가신청서\n';
    documents += '• 기술제안서\n';
    documents += '• 가격제안서\n';
    
    // 기술 관련 서류
    if (keywords.some(k => ['소프트웨어 개발', 'AI/인공지능', '웹 개발', '모바일 개발'].includes(k))) {
      documents += '• 기술보유현황서\n';
      documents += '• 개발환경 및 도구 명세서\n';
      documents += '• 프로젝트 수행계획서\n';
    }
    
    // 보안 관련 서류
    if (keywords.includes('보안')) {
      documents += '• 정보보안 관리체계 인증서\n';
      documents += '• 개인정보보호 관리체계 인증서\n';
    }
    
    // 실적 관련 서류
    documents += '• 최근 3년간 관련 사업 실적증명서\n';
    documents += '• 기술인력 현황서\n';
    documents += '• 재무제표 (최근 2년)\n';
    
    // 기타 서류
    documents += '• 입찰보증금 납부서\n';
    documents += '• 기타 요구사항에 따른 증빙서류\n';
    
    return documents;
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