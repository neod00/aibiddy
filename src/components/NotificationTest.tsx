import React, { useState } from 'react';
import './NotificationTest.css';

const NotificationTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setResult({ success: false, message: '이메일 주소를 입력해주세요.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResult({ success: false, message: '올바른 이메일 형식이 아닙니다.' });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/.netlify/functions/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
        setEmail('');
      } else {
        setResult({ success: false, message: data.error || '테스트 이메일 발송에 실패했습니다.' });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-test-container">
      <div className="notification-test-header">
        <h2>🧪 알림 테스트</h2>
        <p>이메일 알림 시스템이 정상적으로 작동하는지 테스트해보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="notification-test-form">
        <div className="form-group">
          <label htmlFor="email">테스트 이메일 주소</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="test@example.com"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '발송 중...' : '테스트 이메일 발송'}
        </button>
      </form>

      {result && (
        <div className={`result-message ${result.success ? 'success' : 'error'}`}>
          <div className="result-icon">
            {result.success ? '✅' : '❌'}
          </div>
          <div className="result-content">
            <h3>{result.success ? '성공!' : '오류 발생'}</h3>
            <p>{result.message}</p>
          </div>
        </div>
      )}

      <div className="test-info">
        <h3>📋 테스트 내용</h3>
        <ul>
          <li>SendGrid API 연동 확인</li>
          <li>이메일 템플릿 렌더링 확인</li>
          <li>HTML 이메일 형식 확인</li>
          <li>모바일 반응형 디자인 확인</li>
        </ul>
        
        <div className="test-note">
          <strong>참고:</strong> 테스트 이메일은 실제 입찰공고 데이터가 아닌 샘플 데이터를 포함합니다.
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;
