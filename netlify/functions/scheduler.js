// Netlify Functions 스케줄러
// 이 함수는 Netlify의 Scheduled Functions 기능을 사용하여 정기적으로 실행됩니다.

const { google } = require('googleapis');

// 환경변수 설정
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS;

// Google Sheets API 초기화
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(GOOGLE_SHEETS_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 알림 주기별 실행 시간 확인
function shouldRunNotification(interval, lastTriggeredAt) {
  if (!lastTriggeredAt) return true;

  const now = new Date();
  const lastTriggered = new Date(lastTriggeredAt);
  const diffMinutes = (now - lastTriggered) / (1000 * 60);

  switch (interval) {
    case '1hour':
      return diffMinutes >= 60;
    case '3hours':
      return diffMinutes >= 180;
    case '6hours':
      return diffMinutes >= 360;
    case 'daily':
      // 매일 09:00에 실행
      const isMorning = now.getHours() === 9;
      const isNewDay = now.getDate() !== lastTriggered.getDate();
      return isMorning && isNewDay;
    default:
      return false;
  }
}

// 실행해야 할 조건들 조회
async function getConditionsToRun() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Conditions!A:K',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    const now = new Date();
    const conditions = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const condition = {
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
      };

      // 활성화된 조건이고 실행 시간이 된 경우
      if (condition.isActive && shouldRunNotification(condition.notificationInterval, condition.lastTriggeredAt)) {
        conditions.push(condition);
      }
    }

    return conditions;
  } catch (error) {
    console.error('조건 조회 오류:', error);
    return [];
  }
}

// 알림 발송 함수 호출
async function triggerNotificationFunction() {
  try {
    const response = await fetch(`${process.env.URL}/.netlify/functions/send-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('알림 발송 결과:', result);
    return result;
  } catch (error) {
    console.error('알림 발송 함수 호출 오류:', error);
    throw error;
  }
}

// 메인 핸들러
exports.handler = async (event, context) => {
  try {
    console.log('스케줄러 실행 시작...');
    
    // 실행해야 할 조건들 조회
    const conditions = await getConditionsToRun();
    console.log(`실행할 조건 ${conditions.length}개 발견`);

    if (conditions.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: '실행할 조건이 없습니다.',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // 알림 발송 함수 호출
    const result = await triggerNotificationFunction();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '스케줄러 실행 완료',
        conditionsCount: conditions.length,
        notificationResult: result,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('스케줄러 실행 오류:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: '스케줄러 실행 중 오류가 발생했습니다.',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
