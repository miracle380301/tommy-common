import { EmailOptions, EmailResult, ProviderInfo } from '../types';

export abstract class EmailAdapter {
  /**
   * 이메일 전송
   */
  abstract send(options: EmailOptions): Promise<EmailResult>;

  /**
   * Provider 정보 반환
   */
  abstract getProviderInfo(): ProviderInfo;

  /**
   * 기본 from 주소 설정
   */
  protected defaultFrom: string = 'noreply@example.com';

  constructor(defaultFrom?: string) {
    if (defaultFrom) {
      this.defaultFrom = defaultFrom;
    }
  }
}
