const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');

// 환경변수 설정
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const NARA_API_KEY = process.env.NARA_API_KEY;
const NARA_API_URL = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService';

// SendGrid 설정
sgMail.setApiKey(SENDGRID_API_KEY);

// Google Sheets API 초기화
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(GOOGLE_SHEETS_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 나라장터 API 호출 함수
async function fetchBidList(searchParams) {
  const params = new URLSearchParams({
    serviceKey: NARA_API_KEY,
    pageNo: 1,
    numOfRows: 100,
    type: 'json',
    ...(searchParams.keyword && { bidNtceNm: searchParams.keyword }),
    ...(searchParams.type && { bidMethdNm: searchParams.type }),
    ...(searchParams.minAmount && { estmtPrceMin: String(searchParams.minAmount) }),
    ...(searchParams.maxAmount && { estmtPrceMax: String(searchParams.maxAmount) }),
    ...(searchParams.agency && { dminsttNm: searchParams.agency }),
    ...(searchParams.region && { rgnNm: searchParams.region }),
  });

  const response = await fetch(`${NARA_API_URL}/getBidPblancListInfoThng?${params.toString()}`);
  const data = await response.json();
  
  if (data.response.header.resultCode === '00') {
    const items = data.response.body.items.item || [];
    return Array.isArray(items) ? items : [items];
  }
  
  throw new Error(data.response.header.resultMsg || 'API 호출에 실패했습니다.');
}

// 사용자 조건 조회
async function getUserConditions() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Conditions!A:K',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      id: row[0],
      userId: row[1],
      keyword: row[2],
      type: row[3],
      minAmount: row[4] ? parseInt(row[4]) : null,
      maxAmount: row[5] ? parseInt(row[5]) : null,
      agency: row[6],
      region: row[7],
      notificationInterval: row[8],
      isActive: row[9] === 'TRUE',
      lastTriggeredAt: row[10] || null,
    })).filter(condition => condition.isActive);
  } catch (error) {
    console.error('조건 조회 오류:', error);
    return [];
  }
}

// 사용자 정보 조회
async function getUserInfo(userId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Users!A:F',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === userId) {
        return {
          id: rows[i][0],
          email: rows[i][1],
          accountType: rows[i][3],
        };
      }
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
}

// 알림 로그 저장
async function saveNotificationLog(conditionId, userId, bidCount) {
  try {
    const timestamp = new Date().toISOString();
    const values = [[conditionId, userId, bidCount, timestamp]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'NotificationLogs!A:D',
      valueInputOption: 'RAW',
      resource: { values },
    });
  } catch (error) {
    console.error('알림 로그 저장 오류:', error);
  }
}

// 조건 마지막 실행 시간 업데이트
async function updateConditionLastTriggered(conditionId) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Conditions!A:K',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return;

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === conditionId) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) return;

    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `Conditions!K${rowIndex}`,
      valueInputOption: 'RAW',
      resource: { values: [[timestamp]] },
    });
  } catch (error) {
    console.error('조건 실행 시간 업데이트 오류:', error);
  }
}

// 이메일 템플릿 생성
function createEmailTemplate(userEmail, condition, bids) {
  const subject = `🔔 AI낙찰이 - "${condition.keyword}" 조건에 맞는 입찰공고 ${bids.length}건 발견!`;
  
  const formatAmount = (amount) => {
    if (!amount) return '미정';
    return `${parseInt(amount).toLocaleString()}만원`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const bidListHtml = bids.map(bid => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f9fafb;">
      <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">${bid.bidNtceNm}</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div><strong>기관:</strong> ${bid.dminsttNm}</div>
        <div><strong>지역:</strong> ${bid.rgnNm}</div>
        <div><strong>예산:</strong> ${formatAmount(bid.estmtPrce)}</div>
        <div><strong>마감:</strong> ${formatDate(bid.bidClseDt)}</div>
      </div>
      <div style="margin-top: 8px;">
        <a href="${bid.bidNtceDtlUrl}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">상세보기 →</a>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI낙찰이 알림</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0 0 8px 0; font-size: 24px;">🏛️ AI낙찰이</h1>
        <p style="margin: 0; opacity: 0.9;">조건에 맞는 입찰공고를 찾았습니다!</p>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">📋 검색 조건</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div><strong>키워드:</strong> ${condition.keyword}</div>
          <div><strong>종류:</strong> ${condition.type || '전체'}</div>
          <div><strong>금액:</strong> ${condition.minAmount ? condition.minAmount.toLocaleString() : '0'}만원 ~ ${condition.maxAmount ? condition.maxAmount.toLocaleString() : '제한없음'}만원</div>
          <div><strong>알림주기:</strong> ${condition.notificationInterval}</div>
        </div>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
        <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">🔔 발견된 입찰공고 (${bids.length}건)</h2>
        ${bidListHtml}
      </div>

      <div style="text-align: center; margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
          더 많은 입찰공고를 찾고 싶다면 <a href="https://ai-nakchali.netlify.app" style="color: #3b82f6; text-decoration: none;">AI낙찰이</a>를 방문해보세요!
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          이 알림은 설정하신 조건에 따라 자동으로 발송되었습니다.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// 이메일 발송
async function sendNotificationEmail(userEmail, condition, bids) {
  if (bids.length === 0) return;

  try {
    const { subject, html } = createEmailTemplate(userEmail, condition, bids);
    
    const msg = {
      to: userEmail,
      from: process.env.FROM_EMAIL || 'noreply@ai-nakchali.com',
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`이메일 발송 완료: ${userEmail} (${bids.length}건)`);
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    throw error;
  }
}

// 메인 핸들러
exports.handler = async (event, context) => {
  try {
    console.log('알림 발송 시작...');
    
    // 사용자 조건 조회
    const conditions = await getUserConditions();
    console.log(`활성 조건 ${conditions.length}개 발견`);

    for (const condition of conditions) {
      try {
        // 사용자 정보 조회
        const user = await getUserInfo(condition.userId);
        if (!user) {
          console.log(`사용자 정보 없음: ${condition.userId}`);
          continue;
        }

        // 조건에 맞는 공고 검색
        const searchParams = {
          keyword: condition.keyword,
          type: condition.type,
          minAmount: condition.minAmount,
          maxAmount: condition.maxAmount,
          agency: condition.agency,
          region: condition.region,
        };

        const bids = await fetchBidList(searchParams);
        console.log(`조건 "${condition.keyword}" - ${bids.length}건 발견`);

        if (bids.length > 0) {
          // 이메일 발송
          await sendNotificationEmail(user.email, condition, bids);
          
          // 알림 로그 저장
          await saveNotificationLog(condition.id, condition.userId, bids.length);
          
          // 조건 마지막 실행 시간 업데이트
          await updateConditionLastTriggered(condition.id);
        }
      } catch (error) {
        console.error(`조건 ${condition.id} 처리 오류:`, error);
        continue;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '알림 발송 완료',
        processedConditions: conditions.length,
      }),
    };
  } catch (error) {
    console.error('알림 발송 오류:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: '알림 발송 중 오류가 발생했습니다.',
        details: error.message,
      }),
    };
  }
};
