const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 처리
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const errorData = JSON.parse(event.body);
    
    // Google Sheets에 에러 로그 저장
    await logErrorToSheets(errorData);
    
    // Slack 알림 전송 (선택사항)
    await sendSlackNotification(errorData);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error reporting failed:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function logErrorToSheets(errorData) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ERROR_LOG_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
    
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle['ErrorLogs'];
    
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'ErrorLogs',
        headerValues: [
          'Timestamp',
          'Message',
          'Stack',
          'ComponentStack',
          'ErrorBoundary',
          'UserAgent',
          'URL',
          'UserId',
          'SessionId',
        ],
      });
    }
    
    await sheet.addRow({
      Timestamp: errorData.timestamp,
      Message: errorData.message,
      Stack: errorData.stack || '',
      ComponentStack: errorData.componentStack || '',
      ErrorBoundary: errorData.errorBoundary || '',
      UserAgent: errorData.userAgent,
      URL: errorData.url,
      UserId: errorData.userId || '',
      SessionId: errorData.sessionId,
    });
  } catch (error) {
    console.error('Failed to log error to Google Sheets:', error);
  }
}

async function sendSlackNotification(errorData) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    return;
  }
  
  try {
    const message = {
      text: `🚨 AI낙찰이 에러 발생`,
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: '에러 메시지',
              value: errorData.message,
              short: false,
            },
            {
              title: 'URL',
              value: errorData.url,
              short: true,
            },
            {
              title: '사용자 ID',
              value: errorData.userId || 'N/A',
              short: true,
            },
            {
              title: '세션 ID',
              value: errorData.sessionId,
              short: true,
            },
            {
              title: '시간',
              value: errorData.timestamp,
              short: true,
            },
          ],
        },
      ],
    };
    
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}
