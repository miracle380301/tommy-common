import { createTransport, Transporter } from 'nodemailer';
import { EmailAdapter } from './EmailAdapter';
import { EmailOptions, EmailResult, ProviderInfo } from '../types';
import { RateLimiter, EMAIL_LIMITS } from '../services/RateLimiter';

export interface NodemailerConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom?: string;
  checkLimits?: boolean;
}

export class NodemailerAdapter extends EmailAdapter {
  private transporter: Transporter;
  private rateLimiter: RateLimiter;
  private checkLimits: boolean;

  constructor(config: NodemailerConfig) {
    super(config.defaultFrom);

    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? false,
      auth: config.auth
    });

    this.rateLimiter = new RateLimiter(EMAIL_LIMITS.nodemailer);
    this.checkLimits = config.checkLimits ?? true;
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // 무료 한도 체크
      if (this.checkLimits) {
        const limitCheck = this.rateLimiter.checkLimitExceeded();
        if (limitCheck.exceeded) {
          return {
            success: false,
            provider: 'nodemailer',
            error: `${limitCheck.error} (Reset at: ${limitCheck.resetAt})`
          };
        }
      }

      // 이메일 전송
      const result = await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      // 전송 카운트 증가
      if (this.checkLimits) {
        this.rateLimiter.increment();
      }

      console.log('📬 Nodemailer response:', result);

      return {
        success: true,
        messageId: result.messageId || 'unknown',
        provider: 'nodemailer'
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'nodemailer',
        error: error.message || 'Unknown error'
      };
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      name: 'Nodemailer (SMTP)',
      type: 'nodemailer'
    };
  }

  /**
   * 현재 사용량 조회
   */
  getUsage() {
    return this.rateLimiter.getUsage();
  }

  /**
   * 전송 가능 여부 체크
   */
  canSend(): boolean {
    if (!this.checkLimits) return true;
    return this.rateLimiter.canSend();
  }
}
