const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // GET 요청만 처리
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const userId = event.queryStringParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '사용자 ID가 필요합니다.' }),
      };
    }

    const spreadsheetId = '1DXSWEyesl6Nz0N3HWMaPjvDB5X2V-e9AAUgB-eOrb0c';

    // Google Sheets API 인증
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'ai-biddy',
        private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SHEETS_CLIENT_EMAIL)}`,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 조건 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Conditions!A:L',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          conditions: [] 
        }),
      };
    }

    const conditions = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] === userId) {
        conditions.push({
          id: row[0],
          userId: row[1],
          keyword: row[2],
          type: row[3],
          minAmount: row[4] ? parseFloat(row[4]) : null,
          maxAmount: row[5] ? parseFloat(row[5]) : null,
          agency: row[6],
          region: row[7],
          notificationInterval: row[8],
          isActive: row[9] === 'TRUE',
          createdAt: row[10],
          lastTriggeredAt: row[11] || undefined,
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        conditions 
      }),
    };

  } catch (error) {
    console.error('조건 조회 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '조건 조회 중 오류가 발생했습니다.',
        details: error.message 
      }),
    };
  }
};


