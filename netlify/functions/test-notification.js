// 테스트용 알림 발송 함수 (Gmail 사용)
// 개발 및 테스트 목적으로 수동으로 알림을 발송할 수 있습니다.

const nodemailer = require('nodemailer');

// Gmail 설정
const GMAIL_USER = process.env.REACT_APP_GMAIL_USER;
const GMAIL_PASSWORD = process.env.REACT_APP_GMAIL_APP_PASSWORD;

// Gmail 전송자 설정
let gmailTransporter = null;
if (GMAIL_USER && GMAIL_PASSWORD) {
  gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASSWORD,
    },
  });
}

// 테스트 이메일 템플릿
function createTestEmailTemplate() {
  const subject = '🧪 AI낙찰이 테스트 알림';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI낙찰이 테스트 알림</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0 0 8px 0; font-size: 24px;">🏛️ AI낙찰이</h1>
        <p style="margin: 0; opacity: 0.9;">테스트 알림입니다!</p>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">🧪 테스트 결과</h2>
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0; color: #0369a1; font-weight: 600;">✅ 이메일 발송 시스템이 정상적으로 작동합니다!</p>
        </div>
        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
          <li>SendGrid API 연동 확인</li>
          <li>이메일 템플릿 렌더링 확인</li>
          <li>HTML 이메일 형식 확인</li>
          <li>모바일 반응형 디자인 확인</li>
        </ul>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">📋 테스트 조건</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div><strong>키워드:</strong> 테스트</div>
          <div><strong>종류:</strong> 전체</div>
          <div><strong>금액:</strong> 0만원 ~ 제한없음</div>
          <div><strong>알림주기:</strong> 수동 테스트</div>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">🔔 발견된 입찰공고 (3건)</h2>
        
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f9fafb;">
          <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">[테스트] 소프트웨어 개발 용역</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div><strong>기관:</strong> 서울시청</div>
            <div><strong>지역:</strong> 서울</div>
            <div><strong>예산:</strong> 5,000만원</div>
            <div><strong>마감:</strong> 2024-12-31 18:00</div>
          </div>
          <div style="margin-top: 8px;">
            <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">상세보기 →</a>
          </div>
        </div>

        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f9fafb;">
          <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">[테스트] 웹사이트 구축 용역</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div><strong>기관:</strong> 부산시청</div>
            <div><strong>지역:</strong> 부산</div>
            <div><strong>예산:</strong> 3,000만원</div>
            <div><strong>마감:</strong> 2024-12-25 17:00</div>
          </div>
          <div style="margin-top: 8px;">
            <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">상세보기 →</a>
          </div>
        </div>

        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #f9fafb;">
          <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">[테스트] 모바일 앱 개발 용역</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div><strong>기관:</strong> 대구시청</div>
            <div><strong>지역:</strong> 대구</div>
            <div><strong>예산:</strong> 7,000만원</div>
            <div><strong>마감:</strong> 2024-12-28 16:00</div>
          </div>
          <div style="margin-top: 8px;">
            <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">상세보기 →</a>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
          더 많은 입찰공고를 찾고 싶다면 <a href="https://ai-nakchali.netlify.app" style="color: #3b82f6; text-decoration: none;">AI낙찰이</a>를 방문해보세요!
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          이 알림은 테스트 목적으로 발송되었습니다.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// 메인 핸들러
exports.handler = async (event, context) => {
  try {
    console.log('테스트 알림 발송 시작...');
    
    // 요청 본문에서 이메일 주소 추출
    const { email } = JSON.parse(event.body || '{}');
    
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: '이메일 주소가 필요합니다.',
        }),
      };
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: '올바른 이메일 형식이 아닙니다.',
        }),
      };
    }

    // 테스트 이메일 템플릿 생성
    const { subject, html } = createTestEmailTemplate();

    // Gmail 이메일 발송
    if (!gmailTransporter) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Gmail 설정이 없습니다. 환경 변수를 확인해주세요.',
        }),
      };
    }

    const mailOptions = {
      from: `"AI낙찰이" <${GMAIL_USER}>`,
      to: email,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''), // HTML 태그 제거
    };

    const result = await gmailTransporter.sendMail(mailOptions);
    console.log(`Gmail 테스트 이메일 발송 완료: ${email} - ${result.messageId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '테스트 이메일이 성공적으로 발송되었습니다.',
        email,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('테스트 이메일 발송 오류:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: '테스트 이메일 발송 중 오류가 발생했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
