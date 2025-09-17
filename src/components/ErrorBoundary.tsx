import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { errorReporter } from '../utils/errorReporting';
import './ErrorBoundary.css';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2>문제가 발생했습니다</h2>
        <p>예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        
        <div className="error-details">
          <details>
            <summary>에러 상세 정보</summary>
            <pre>{error.message}</pre>
            {process.env.NODE_ENV === 'development' && (
              <pre>{error.stack}</pre>
            )}
          </details>
        </div>
        
        <div className="error-actions">
          <button 
            className="btn btn-primary" 
            onClick={resetErrorBoundary}
          >
            다시 시도
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.reload()}
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: any) => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback = ErrorFallback,
  onError 
}) => {
  const handleError = (error: Error, errorInfo: any) => {
    // 에러 리포팅
    errorReporter.reportReactError(error, errorInfo, 'ErrorBoundary');
    
    // 커스텀 에러 핸들러 호출
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // 에러 리셋 시 추가 로직
        console.log('Error boundary reset');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
