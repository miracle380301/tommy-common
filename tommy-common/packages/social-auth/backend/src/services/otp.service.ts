export interface OTPRecord {
  code: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

export class OTPService {
  private otpStore: Map<string, OTPRecord>;
  private otpLength: number;
  private otpExpiry: number;

  constructor(otpLength: number = 6, otpExpiry: number = 300) {
    this.otpStore = new Map();
    this.otpLength = otpLength;
    this.otpExpiry = otpExpiry;
  }

  /**
   * OTP 코드 생성 (6자리 숫자)
   */
  generateOTP(): string {
    const min = Math.pow(10, this.otpLength - 1);
    const max = Math.pow(10, this.otpLength) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * OTP 저장
   */
  saveOTP(email: string, code: string): void {
    const now = Date.now();
    const expiresAt = now + this.otpExpiry * 1000;

    this.otpStore.set(email, {
      code,
      email,
      expiresAt,
      createdAt: now
    });
  }

  /**
   * OTP 검증
   */
  verifyOTP(email: string, code: string): { valid: boolean; error?: string } {
    const record = this.otpStore.get(email);

    if (!record) {
      return { valid: false, error: 'OTP not found' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      return { valid: false, error: 'OTP expired' };
    }

    if (record.code !== code) {
      return { valid: false, error: 'Invalid OTP code' };
    }

    // 검증 성공 시 OTP 삭제 (일회용)
    this.otpStore.delete(email);
    return { valid: true };
  }

  /**
   * OTP 존재 여부 확인
   */
  hasOTP(email: string): boolean {
    const record = this.otpStore.get(email);
    if (!record) return false;

    // 만료된 OTP는 삭제
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email);
      return false;
    }

    return true;
  }

  /**
   * OTP 삭제
   */
  deleteOTP(email: string): void {
    this.otpStore.delete(email);
  }

  /**
   * 만료된 OTP 정리 (선택적)
   */
  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [email, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }
}
