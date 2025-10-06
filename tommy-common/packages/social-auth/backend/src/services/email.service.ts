import {
  EmailService as BaseEmailService,
  EmailOptions as BaseEmailOptions,
  ResendAdapter,
  NodemailerAdapter,
  CustomAdapter
} from '@miracle380301/email-service';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailServiceOptions {
  provider: 'resend' | 'nodemailer' | 'custom';
  config: {
    // Resend
    resendApiKey?: string;
    // Nodemailer
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    // Custom
    sendFunction?: (options: EmailOptions) => Promise<void>;
  };
  defaultFrom: string;
}

export class EmailService {
  private emailService: BaseEmailService;

  constructor(options: EmailServiceOptions) {
    let adapter: any;

    switch (options.provider) {
      case 'resend':
        if (!options.config.resendApiKey) {
          throw new Error('Resend API key is required');
        }
        adapter = new ResendAdapter({
          apiKey: options.config.resendApiKey,
          defaultFrom: options.defaultFrom,
          checkLimits: true
        });
        break;

      case 'nodemailer':
        if (!options.config.smtpHost || !options.config.smtpUser || !options.config.smtpPass) {
          throw new Error('SMTP configuration is required');
        }
        adapter = new NodemailerAdapter({
          host: options.config.smtpHost,
          port: options.config.smtpPort || 587,
          auth: {
            user: options.config.smtpUser,
            pass: options.config.smtpPass
          },
          defaultFrom: options.defaultFrom,
          checkLimits: true
        });
        break;

      case 'custom':
        if (!options.config.sendFunction) {
          throw new Error('Custom sendFunction is required');
        }
        adapter = new CustomAdapter(async (emailOptions: BaseEmailOptions) => {
          await options.config.sendFunction!({
            to: emailOptions.to,
            subject: emailOptions.subject,
            html: emailOptions.html,
            text: emailOptions.text
          });
        }, options.defaultFrom);
        break;

      default:
        throw new Error(`Unsupported email provider: ${options.provider}`);
    }

    this.emailService = new BaseEmailService({ adapter });
  }

  /**
   * 이메일 전송
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    await this.emailService.send(options);
  }

  /**
   * OTP 이메일 전송
   */
  async sendOTPEmail(email: string, code: string): Promise<void> {
    await this.emailService.sendOTP(email, code);
  }
}
