import { Resend } from 'resend';
import { EmailAdapter } from './EmailAdapter';
import { EmailOptions, EmailResult, ProviderInfo } from '../types';
import { RateLimiter, EMAIL_LIMITS } from '../services/RateLimiter';

export interface ResendConfig {
  apiKey: string;
  defaultFrom?: string;
  checkLimits?: boolean;
}

export class ResendAdapter extends EmailAdapter {
  private resend: Resend;
  private rateLimiter: RateLimiter;
  private checkLimits: boolean;

  constructor(config: ResendConfig) {
    super(config.defaultFrom);
    this.resend = new Resend(config.apiKey);
    this.rateLimiter = new RateLimiter(EMAIL_LIMITS.resend);
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
            provider: 'resend',
            error: `${limitCheck.error} (Reset at: ${limitCheck.resetAt})`
          };
        }
      }

      // 이메일 전송
      const result = await this.resend.emails.send({
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

      console.log('📬 Resend API response:', result);

      return {
        success: true,
        messageId: result.data?.id || 'unknown',
        provider: 'resend'
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'resend',
        error: error.message || 'Unknown error'
      };
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      name: 'Resend',
      type: 'resend'
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
