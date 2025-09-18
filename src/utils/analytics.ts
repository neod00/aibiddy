// Google Analytics 4 설정
export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';

// Google Analytics 초기화
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Google Analytics 스크립트 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // gtag 함수 설정
    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: any[]) => {
      window.dataLayer.push(args);
    };
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// 페이지 뷰 추적
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// 이벤트 추적
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 사용자 행동 추적
export const trackUserAction = {
  // 검색 이벤트
  search: (keyword: string, filters: any) => {
    trackEvent('search', 'engagement', keyword);
    trackEvent('search_with_filters', 'engagement', JSON.stringify(filters));
  },

  // 입찰공고 클릭
  bidClick: (bidId: string, bidTitle: string) => {
    trackEvent('bid_click', 'engagement', bidId);
    trackEvent('bid_view', 'content', bidTitle);
  },

  // AI 요약 사용
  aiSummary: (bidId: string, accountType: 'free' | 'premium') => {
    trackEvent('ai_summary_used', 'feature', bidId);
    trackEvent('ai_summary_by_account', 'feature', accountType);
  },

  // 조건 등록
  conditionAdd: (conditionType: string) => {
    trackEvent('condition_added', 'feature', conditionType);
  },

  // 회원가입/로그인
  auth: (action: 'signup' | 'login', method: 'email') => {
    trackEvent(action, 'user', method);
  },

  // 프리미엄 업그레이드
  upgrade: (fromAccount: string, toAccount: string) => {
    trackEvent('upgrade', 'conversion', `${fromAccount}_to_${toAccount}`);
  },

  // 에러 추적
  error: (errorType: string, errorMessage: string) => {
    trackEvent('error', 'technical', errorType);
    console.error('Analytics Error:', errorType, errorMessage);
  },
};

// 성능 메트릭 추적
export const trackPerformance = {
  // 페이지 로드 시간
  pageLoad: (loadTime: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'load',
        value: Math.round(loadTime),
      });
    }
  },

  // API 응답 시간
  apiResponse: (endpoint: string, responseTime: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'api_response',
        value: Math.round(responseTime),
        event_category: endpoint,
      });
    }
  },

  // 사용자 상호작용 시간
  userInteraction: (action: string, duration: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'user_interaction',
        value: Math.round(duration),
        event_category: action,
      });
    }
  },
};

// 커스텀 메트릭
export const trackCustomMetric = (metricName: string, value: number, dimensions?: Record<string, string>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'custom_metric', {
      metric_name: metricName,
      value: value,
      ...dimensions,
    });
  }
};

// 전역 타입 선언
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
