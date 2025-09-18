// 에러 리포팅 유틸리티
import React from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
}

class ErrorReporter {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // JavaScript 에러 캐치
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });

    // Promise rejection 에러 캐치
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
      });
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  reportError(errorInfo: Partial<ErrorInfo>): void {
    const fullErrorInfo: ErrorInfo = {
      message: errorInfo.message || 'Unknown error',
      stack: errorInfo.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
      timestamp: errorInfo.timestamp || new Date().toISOString(),
      userAgent: errorInfo.userAgent || navigator.userAgent,
      url: errorInfo.url || window.location.href,
      userId: errorInfo.userId || this.userId,
      sessionId: errorInfo.sessionId || this.sessionId,
    };

    // 콘솔에 에러 로그
    console.error('Error Reported:', fullErrorInfo);

    // Netlify Functions로 에러 전송
    this.sendToServer(fullErrorInfo);

    // Google Analytics로 에러 추적
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: fullErrorInfo.message,
        fatal: false,
        custom_map: {
          error_stack: fullErrorInfo.stack,
          error_component: fullErrorInfo.componentStack,
          error_boundary: fullErrorInfo.errorBoundary,
        },
      });
    }
  }

  private async sendToServer(errorInfo: ErrorInfo): Promise<void> {
    try {
      await fetch('/.netlify/functions/error-reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  // React Error Boundary용 에러 리포팅
  reportReactError(error: Error, errorInfo: any, errorBoundary?: string): void {
    this.reportError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary,
    });
  }

  // API 에러 리포팅
  reportApiError(endpoint: string, status: number, message: string): void {
    this.reportError({
      message: `API Error: ${endpoint} - ${status} - ${message}`,
      stack: new Error().stack,
    });
  }

  // 사용자 액션 에러 리포팅
  reportUserActionError(action: string, error: Error): void {
    this.reportError({
      message: `User Action Error: ${action} - ${error.message}`,
      stack: error.stack,
    });
  }
}

// 싱글톤 인스턴스
export const errorReporter = new ErrorReporter();

// React Error Boundary 컴포넌트
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorReporter.reportReactError(error, errorInfo, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement('div', { className: 'error-boundary' },
        React.createElement('h2', null, '문제가 발생했습니다'),
        React.createElement('p', null, '페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'),
        React.createElement('button', { onClick: () => window.location.reload() }, '새로고침')
      );
    }

    return this.props.children;
  }
}

// 에러 리포팅 훅
export const useErrorReporting = () => {
  const reportError = React.useCallback((error: Error, context?: string) => {
    errorReporter.reportError({
      message: error.message,
      stack: error.stack,
      errorBoundary: context,
    });
  }, []);

  const reportApiError = React.useCallback((endpoint: string, status: number, message: string) => {
    errorReporter.reportApiError(endpoint, status, message);
  }, []);

  const reportUserActionError = React.useCallback((action: string, error: Error) => {
    errorReporter.reportUserActionError(action, error);
  }, []);

  return {
    reportError,
    reportApiError,
    reportUserActionError,
  };
};

