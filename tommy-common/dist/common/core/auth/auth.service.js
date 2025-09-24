"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.createAuthService = void 0;
const oauth2_adapter_1 = require("./oauth2.adapter");
class AuthService {
    constructor(adapter) {
        this.signInWithProvider = (provider, redirectTo) => this.adapter.signInWithProvider(provider, redirectTo);
        this.signOut = () => this.adapter.signOut();
        this.getUser = () => this.adapter.getUser();
        this.getSession = () => this.adapter.getSession();
        // 이메일 인증 메서드
        this.signUpWithEmail = (email, password, metadata) => {
            if (!this.adapter.signUpWithEmail) {
                throw new Error('Email signup is not implemented');
            }
            return this.adapter.signUpWithEmail(email, password, metadata);
        };
        this.signInWithEmail = (email, password) => {
            if (!this.adapter.signInWithEmail) {
                throw new Error('Email signin is not implemented');
            }
            return this.adapter.signInWithEmail(email, password);
        };
        // 토큰으로 세션 설정 (앱 딥링크 등에서 사용)
        this.setSession = (accessToken, refreshToken) => {
            if (this.adapter.setSession) {
                return this.adapter.setSession(accessToken, refreshToken);
            }
            throw new Error('setSession is not implemented');
        };
        this.adapter = adapter;
    }
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
        }
        else {
            // 웹에서 일반적인 OAuth 콜백 처리
            return await this.getSession();
        }
    }
}
exports.AuthService = AuthService;
const createAuthService = (supabaseUrl, supabaseAnonKey) => {
    const adapter = (0, oauth2_adapter_1.createOAuth2Adapter)(supabaseUrl, supabaseAnonKey);
    return new AuthService(adapter);
};
exports.createAuthService = createAuthService;
