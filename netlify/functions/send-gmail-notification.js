// Gmail을 사용한 입찰공고 알림 전송 함수
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
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
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { to, subject, html, text } = JSON.parse(event.body);

    // Gmail 설정
    const gmailUser = process.env.REACT_APP_GMAIL_USER;
    const gmailPassword = process.env.REACT_APP_GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Gmail 설정이 없습니다. 환경 변수를 확인해주세요.',
        }),
      };
    }

    // Gmail 전송자 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    // 이메일 전송
    const mailOptions = {
      from: `"AI낙찰이" <${gmailUser}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // HTML 태그 제거
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Gmail 이메일 전송 성공:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '이메일이 성공적으로 전송되었습니다.',
        messageId: result.messageId,
      }),
    };
  } catch (error) {
    console.error('Gmail 이메일 전송 실패:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
