import { AuthAdapter, OAuthProvider } from './auth.interface';
declare class AuthService {
    private adapter;
    constructor(adapter: AuthAdapter);
    signInWithProvider: (provider: OAuthProvider, redirectTo?: string) => Promise<any>;
    signOut: () => Promise<void>;
    getUser: () => Promise<any>;
    getSession: () => Promise<any>;
    signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<any>;
    signInWithEmail: (email: string, password: string) => Promise<any>;
    setSession: (accessToken: string, refreshToken: string) => Promise<any>;
    handleOAuthCallback(): Promise<any>;
}
export declare const createAuthService: (supabaseUrl: string, supabaseAnonKey: string) => AuthService;
export { AuthService };
