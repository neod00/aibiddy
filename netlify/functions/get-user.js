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

    const email = event.queryStringParameters?.email;
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '이메일이 필요합니다.' }),
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

    // 사용자 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:I',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }),
      };
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] === email) {
        const user = {
          id: row[0],
          email: row[1],
          passwordHash: row[2] || '',
          name: row[3] || '',
          phone: row[4] || '',
          company: row[5] || '',
          createdAt: row[6] || '',
          updatedAt: row[7] || '',
          isActive: row[8] === 'TRUE',
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            user 
          }),
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }),
    };

  } catch (error) {
    console.error('사용자 조회 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '사용자 조회 중 오류가 발생했습니다.',
        details: error.message 
      }),
    };
  }
};

