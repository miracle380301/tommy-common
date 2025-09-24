"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomOAuthAdapter = void 0;
const createCustomOAuthAdapter = (config) => {
    let currentSession = null;
    return {
        async signInWithProvider(provider, redirectTo) {
            // Custom OAuth flow - redirect to auth server
            const params = new URLSearchParams({
                client_id: config.clientId,
                redirect_uri: redirectTo || config.redirectUri,
                response_type: 'code',
                scope: config.scope || '',
            });
            const authUrl = `${config.authUrl}?${params.toString()}`;
            // Return URL for redirect (browser will handle)
            if (typeof window !== 'undefined') {
                window.location.href = authUrl;
            }
            return { url: authUrl };
        },
        async signOut() {
            currentSession = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        },
        async getUser() {
            if (!currentSession) {
                const token = typeof window !== 'undefined' ?
                    localStorage.getItem('access_token') : null;
                if (token) {
                    // Decode JWT or fetch user info from your server
                    return { id: 'user_id', email: 'user@example.com' };
                }
            }
            return currentSession?.user || null;
        },
        async getSession() {
            if (typeof window !== 'undefined') {
                const accessToken = localStorage.getItem('access_token');
                const refreshToken = localStorage.getItem('refresh_token');
                if (accessToken) {
                    currentSession = {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        user: await this.getUser(),
                    };
                }
            }
            return currentSession;
        },
        async setSession(accessToken, refreshToken) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
            }
            currentSession = {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: await this.getUser(),
            };
            return currentSession;
        },
    };
};
exports.createCustomOAuthAdapter = createCustomOAuthAdapter;
