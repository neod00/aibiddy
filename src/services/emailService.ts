// Gmail 이메일 전송 서비스
import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private gmailUser: string;
  private gmailPassword: string;

  constructor() {
    this.gmailUser = process.env.REACT_APP_GMAIL_USER || '';
    this.gmailPassword = process.env.REACT_APP_GMAIL_APP_PASSWORD || '';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!this.gmailUser || !this.gmailPassword) {
      console.warn('Gmail 설정이 없습니다. 이메일 전송이 비활성화됩니다.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.gmailUser,
        pass: this.gmailPassword, // Gmail 앱 비밀번호
      },
    });

    // 연결 테스트
    if (this.transporter) {
      this.transporter.verify((error: any, success: any) => {
        if (error) {
          console.error('Gmail 연결 실패:', error);
        } else {
          console.log('Gmail 연결 성공:', success);
        }
      });
    }
  }

  // 이메일 전송
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string }> {
    if (!this.transporter) {
      return {
        success: false,
        message: 'Gmail 설정이 없습니다. 이메일 전송이 비활성화됩니다.',
      };
    }

    try {
      const mailOptions = {
        from: `"AI낙찰이" <${this.gmailUser}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''), // HTML 태그 제거
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('이메일 전송 성공:', result.messageId);
      
      return {
        success: true,
        message: '이메일이 성공적으로 전송되었습니다.',
      };
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      return {
        success: false,
        message: `이메일 전송에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      };
    }
  }

  // 입찰공고 알림 이메일 템플릿
  generateBidNotificationEmail(bidData: any, condition: any): EmailData {
    const { bidNtceNm, dminsttNm, bidClseDt, estmtPrce, rgnNm, bidNtceDtlUrl } = bidData;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>새로운 입찰공고 알림</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .bid-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .bid-title { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .bid-info { margin: 8px 0; }
          .bid-info strong { color: #667eea; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .condition-info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 새로운 입찰공고 알림</h1>
            <p>설정하신 조건에 맞는 입찰공고가 발견되었습니다!</p>
          </div>
          
          <div class="content">
            <div class="condition-info">
              <h3>📋 설정된 조건</h3>
              <p><strong>키워드:</strong> ${condition.keyword}</p>
              <p><strong>종류:</strong> ${condition.type || '전체'}</p>
              <p><strong>지역:</strong> ${condition.region || '전국'}</p>
            </div>

            <div class="bid-card">
              <div class="bid-title">${bidNtceNm}</div>
              <div class="bid-info"><strong>수요기관:</strong> ${dminsttNm}</div>
              <div class="bid-info"><strong>마감일시:</strong> ${new Date(bidClseDt).toLocaleString('ko-KR')}</div>
              <div class="bid-info"><strong>추정가격:</strong> ${estmtPrce ? `${parseInt(estmtPrce).toLocaleString()}만원` : '미정'}</div>
              <div class="bid-info"><strong>지역:</strong> ${rgnNm || '전국'}</div>
              
              <a href="${bidNtceDtlUrl}" class="btn" target="_blank">상세보기</a>
            </div>

            <div class="footer">
              <p>이 이메일은 AI낙찰이에서 자동으로 발송되었습니다.</p>
              <p>알림 설정을 변경하려면 <a href="https://ai-nakchali.com/settings">설정 페이지</a>를 방문하세요.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: condition.userEmail,
      subject: `🔔 [AI낙찰이] 새로운 입찰공고: ${bidNtceNm}`,
      html,
    };
  }

  // 테스트 이메일 전송
  async sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
    const testEmailData: EmailData = {
      to,
      subject: '🧪 [AI낙찰이] 테스트 이메일',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">AI낙찰이 테스트 이메일</h2>
          <p>안녕하세요! AI낙찰이 이메일 서비스가 정상적으로 작동하고 있습니다.</p>
          <p>이 이메일을 받으셨다면 알림 기능이 정상적으로 설정되었습니다.</p>
          <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>전송 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
            <p><strong>서비스:</strong> Gmail API</p>
          </div>
        </div>
      `,
    };

    return await this.sendEmail(testEmailData);
  }
}

export default new EmailService();
