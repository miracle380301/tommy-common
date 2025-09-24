export type OAuthProvider = "google" | "apple" | "kakao" | "strava" | "github" | "facebook" | "custom";

export interface AuthAdapter {
  // OAuth 메서드
  signInWithProvider(provider: OAuthProvider, redirectTo?: string): Promise<any>;

  // 이메일 인증 메서드 (선택적)
  signUpWithEmail?(email: string, password: string, metadata?: any): Promise<any>;
  signInWithEmail?(email: string, password: string): Promise<any>;

  // 세션 관리
  signOut(): Promise<void>;
  getUser(): Promise<any>;
  getSession(): Promise<any>;
  setSession?(accessToken: string, refreshToken: string): Promise<any>;

  // 추가 메서드들 (선택적)
  refreshSession?(refreshToken: string): Promise<any>;
  getActivities?(page?: number): Promise<any>;
}