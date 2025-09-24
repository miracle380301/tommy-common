import { AuthAdapter, OAuthProvider } from './auth.interface';
import { createOAuth2Adapter } from './oauth2.adapter';

class AuthService {
  private adapter: AuthAdapter;

  constructor(adapter: AuthAdapter) {
    this.adapter = adapter;
  }

  signInWithProvider = (provider: OAuthProvider, redirectTo?: string) =>
    this.adapter.signInWithProvider(provider, redirectTo);
  signOut = () => this.adapter.signOut();
  getUser = () => this.adapter.getUser();
  getSession = () => this.adapter.getSession();

  // 이메일 인증 메서드
  signUpWithEmail = (email: string, password: string, metadata?: any) => {
    if (!this.adapter.signUpWithEmail) {
      throw new Error('Email signup is not implemented');
    }
    return this.adapter.signUpWithEmail(email, password, metadata);
  };

  signInWithEmail = (email: string, password: string) => {
    if (!this.adapter.signInWithEmail) {
      throw new Error('Email signin is not implemented');
    }
    return this.adapter.signInWithEmail(email, password);
  };

  // 토큰으로 세션 설정 (앱 딥링크 등에서 사용)
  setSession = (accessToken: string, refreshToken: string) => {
    if (this.adapter.setSession) {
      return this.adapter.setSession(accessToken, refreshToken);
    }
    throw new Error('setSession is not implemented');
  };

  // OAuth 콜백 처리 헬퍼
  async handleOAuthCallback() {
    // hash fragment에서 토큰 확인 (앱 딥링크)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // 앱에서 전달한 토큰으로 세션 설정
      return await this.setSession(accessToken, refreshToken);
    } else {
      // 웹에서 일반적인 OAuth 콜백 처리
      return await this.getSession();
    }
  }
}

export const createAuthService = (supabaseUrl: string, supabaseAnonKey: string) => {
  const adapter = createOAuth2Adapter(supabaseUrl, supabaseAnonKey);
  return new AuthService(adapter);
};

export { AuthService };