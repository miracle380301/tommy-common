export interface EmailLimitConfig {
  daily: number;
  monthly: number;
  provider: string;
}

export interface UsageStats {
  today: number;
  dailyLimit: number;
  dailyRemaining: number;
  thisMonth: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  resetAt: {
    daily: string;
    monthly: string;
  };
}

export class RateLimiter {
  private dailyCount: number = 0;
  private monthlyCount: number = 0;
  private lastResetDate: string;
  private lastResetMonth: string;
  private config: EmailLimitConfig;

  constructor(config: EmailLimitConfig) {
    this.config = config;
    const now = new Date();
    this.lastResetDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    this.lastResetMonth = now.toISOString().slice(0, 7); // YYYY-MM
  }

  /**
   * 일일 한도 체크
   */
  checkDailyLimit(): boolean {
    this.resetIfNeeded();
    return this.dailyCount < this.config.daily;
  }

  /**
   * 월간 한도 체크
   */
  checkMonthlyLimit(): boolean {
    this.resetIfNeeded();
    return this.monthlyCount < this.config.monthly;
  }

  /**
   * 전송 가능 여부 체크 (일일 & 월간)
   */
  canSend(): boolean {
    return this.checkDailyLimit() && this.checkMonthlyLimit();
  }

  /**
   * 전송 카운트 증가
   */
  increment(): void {
    this.resetIfNeeded();
    this.dailyCount++;
    this.monthlyCount++;
  }

  /**
   * 사용량 조회
   */
  getUsage(): UsageStats {
    this.resetIfNeeded();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    return {
      today: this.dailyCount,
      dailyLimit: this.config.daily,
      dailyRemaining: this.config.daily - this.dailyCount,
      thisMonth: this.monthlyCount,
      monthlyLimit: this.config.monthly,
      monthlyRemaining: this.config.monthly - this.monthlyCount,
      resetAt: {
        daily: tomorrow.toISOString(),
        monthly: nextMonth.toISOString()
      }
    };
  }

  /**
   * 한도 초과 여부 체크 및 에러 정보 반환
   */
  checkLimitExceeded(): { exceeded: boolean; error?: string; resetAt?: string } {
    this.resetIfNeeded();

    if (this.dailyCount >= this.config.daily) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      return {
        exceeded: true,
        error: `Daily limit exceeded (${this.config.daily} emails/day)`,
        resetAt: tomorrow.toISOString()
      };
    }

    if (this.monthlyCount >= this.config.monthly) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      return {
        exceeded: true,
        error: `Monthly limit exceeded (${this.config.monthly} emails/month)`,
        resetAt: nextMonth.toISOString()
      };
    }

    return { exceeded: false };
  }

  /**
   * 필요 시 자동 리셋
   */
  private resetIfNeeded(): void {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentMonth = now.toISOString().slice(0, 7);

    // 일일 리셋
    if (currentDate !== this.lastResetDate) {
      this.dailyCount = 0;
      this.lastResetDate = currentDate;
    }

    // 월간 리셋
    if (currentMonth !== this.lastResetMonth) {
      this.monthlyCount = 0;
      this.lastResetMonth = currentMonth;
    }
  }
}

// Provider별 한도 설정
export const EMAIL_LIMITS = {
  resend: {
    daily: 100,
    monthly: 3000,
    provider: 'Resend Free Tier'
  },
  sendgrid: {
    daily: 100,
    monthly: 3000,
    provider: 'SendGrid Free Tier'
  },
  nodemailer: {
    daily: 500,
    monthly: 15000,
    provider: 'Gmail SMTP'
  },
  ses: {
    daily: 2000,
    monthly: 62000,
    provider: 'AWS SES (EC2 Free Tier)'
  },
  mailgun: {
    daily: 166,
    monthly: 5000,
    provider: 'Mailgun Free Tier'
  }
};
