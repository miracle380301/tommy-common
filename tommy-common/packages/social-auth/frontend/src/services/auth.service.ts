import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'oauth_token';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'kakao' | 'apple' | 'email';
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  // 토큰 저장
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  // 토큰 가져오기
  getToken(): string | null {
    return this.token;
  }

  // 토큰 삭제
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  // 로그인 여부 확인
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // 사용자 프로필 조회
  async getUserProfile(): Promise<UserProfile> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      return response.data.user;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    if (this.token) {
      try {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          }
        );
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    this.clearToken();
  }

  // ==================== Email OTP ====================

  // OTP 전송
  async sendOTP(email: string): Promise<{ message: string; expiresIn: number }> {
    const response = await axios.post(`${API_URL}/api/auth/email/send-otp`, { email });
    return response.data;
  }

  // OTP 검증 및 로그인
  async verifyOTP(email: string, code: string): Promise<{ token: string; user: UserProfile }> {
    const response = await axios.post(`${API_URL}/api/auth/email/verify-otp`, { email, code });
    const { token, user } = response.data;

    // 토큰 저장
    this.setToken(token);

    return { token, user };
  }

  // OTP 재전송
  async resendOTP(email: string): Promise<{ message: string; expiresIn: number }> {
    const response = await axios.post(`${API_URL}/api/auth/email/resend-otp`, { email });
    return response.data;
  }
}

export const authService = new AuthService();
