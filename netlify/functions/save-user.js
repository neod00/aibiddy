const { google } = require('googleapis');

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

  try {
    // POST 요청만 처리
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const userData = JSON.parse(event.body);
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

    // 시트 존재 확인 및 생성
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheets = response.data.sheets || [];
    const sheetExists = existingSheets.some(sheet => 
      sheet.properties.title === 'Users'
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Users',
              },
            },
          }],
        },
      });

      // 헤더 행 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!A1:I1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Email', 'PasswordHash', 'Name', 'Phone', 'Company', 'CreatedAt', 'UpdatedAt', 'IsActive']],
        },
      });
    }

    // 사용자 데이터 저장
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const values = [
      [
        userId,
        userData.email,
        userData.passwordHash || '',
        userData.name || '',
        userData.phone || '',
        userData.company || '',
        now,
        now,
        'TRUE'
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:I',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        userId,
        message: '사용자가 성공적으로 저장되었습니다.' 
      }),
    };

  } catch (error) {
    console.error('사용자 저장 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '사용자 저장 중 오류가 발생했습니다.',
        details: error.message 
      }),
    };
  }
};

