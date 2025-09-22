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

    const conditionData = JSON.parse(event.body);
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
      sheet.properties.title === 'Conditions'
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Conditions',
              },
            },
          }],
        },
      });

      // 헤더 행 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Conditions!A1:L1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'UserId', 'Keyword', 'Type', 'MinAmount', 'MaxAmount', 'Agency', 'Region', 'NotificationInterval', 'IsActive', 'CreatedAt', 'LastTriggeredAt']],
        },
      });
    }

    // 조건 데이터 저장
    const conditionId = `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const values = [
      [
        conditionId,
        conditionData.userId,
        conditionData.keyword,
        conditionData.type,
        conditionData.minAmount || '',
        conditionData.maxAmount || '',
        conditionData.agency,
        conditionData.region,
        conditionData.notificationInterval,
        conditionData.isActive ? 'TRUE' : 'FALSE',
        now,
        conditionData.lastTriggeredAt || ''
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Conditions!A:L',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        conditionId,
        message: '조건이 성공적으로 저장되었습니다.' 
      }),
    };

  } catch (error) {
    console.error('조건 저장 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '조건 저장 중 오류가 발생했습니다.',
        details: error.message 
      }),
    };
  }
};


