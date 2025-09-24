export type OAuthProvider = "google" | "apple" | "kakao" | "strava" | "github" | "facebook" | "custom";
export interface AuthAdapter {
    signInWithProvider(provider: OAuthProvider, redirectTo?: string): Promise<any>;
    signUpWithEmail?(email: string, password: string, metadata?: any): Promise<any>;
    signInWithEmail?(email: string, password: string): Promise<any>;
    signOut(): Promise<void>;
    getUser(): Promise<any>;
    getSession(): Promise<any>;
    setSession?(accessToken: string, refreshToken: string): Promise<any>;
    refreshSession?(refreshToken: string): Promise<any>;
    getActivities?(page?: number): Promise<any>;
}
