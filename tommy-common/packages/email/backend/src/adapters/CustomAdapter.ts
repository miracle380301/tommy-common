import { EmailAdapter } from './EmailAdapter';
import { EmailOptions, EmailResult, ProviderInfo } from '../types';

export class CustomAdapter extends EmailAdapter {
  private sendFunction: (options: EmailOptions) => Promise<void>;

  constructor(sendFunction: (options: EmailOptions) => Promise<void>, defaultFrom?: string) {
    super(defaultFrom);
    this.sendFunction = sendFunction;
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const emailOptions = {
        ...options,
        from: options.from || this.defaultFrom
      };

      await this.sendFunction(emailOptions);

      return {
        success: true,
        messageId: `test_${Date.now()}`,
        provider: 'test'
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'test',
        error: error.message
      };
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      name: 'Test Mode',
      type: 'test'
    };
  }
}
