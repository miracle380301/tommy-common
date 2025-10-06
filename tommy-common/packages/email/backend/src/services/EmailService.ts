import { EmailAdapter } from '../adapters/EmailAdapter';
import { EmailOptions, EmailResult } from '../types';

export interface EmailServiceConfig {
  adapter: EmailAdapter;
  defaultFrom?: string;
}

export class EmailService {
  private adapter: EmailAdapter;
  private defaultFrom: string;

  constructor(config: EmailServiceConfig) {
    this.adapter = config.adapter;
    this.defaultFrom = config.defaultFrom || 'noreply@example.com';
  }

  /**
   * 이메일 전송
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    const emailOptions = {
      ...options,
      from: options.from || this.defaultFrom
    };

    return await this.adapter.send(emailOptions);
  }

  /**
   * OTP 이메일 전송 (템플릿)
   */
  async sendOTP(email: string, code: string): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #4CAF50;
              text-align: center;
              padding: 20px;
              background-color: white;
              border-radius: 5px;
              letter-spacing: 5px;
            }
            .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>이메일 인증</h1>
            </div>
            <div class="content">
              <h2>안녕하세요!</h2>
              <p>아래의 인증 코드를 입력하여 로그인을 완료해주세요.</p>
              <div class="otp-code">${code}</div>
              <p>이 코드는 5분 동안 유효합니다.</p>
              <p>본인이 요청하지 않았다면 이 이메일을 무시해주세요.</p>
            </div>
            <div class="footer">
              <p>이 이메일은 자동으로 발송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      이메일 인증

      인증 코드: ${code}

      이 코드는 5분 동안 유효합니다.
      본인이 요청하지 않았다면 이 이메일을 무시해주세요.
    `;

    return await this.send({
      to: email,
      subject: '이메일 인증 코드',
      html,
      text
    });
  }

  /**
   * Provider 정보 조회
   */
  getProviderInfo() {
    return this.adapter.getProviderInfo();
  }
}
