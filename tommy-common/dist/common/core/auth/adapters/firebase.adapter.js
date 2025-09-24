"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseAdapter = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const createFirebaseAdapter = (config) => {
    // Firebase 초기화 (이미 초기화되어 있으면 재사용)
    const app = (0, app_1.getApps)().length === 0
        ? (0, app_1.initializeApp)(config)
        : (0, app_1.getApp)();
    const auth = (0, auth_1.getAuth)(app);
    let currentUser = null;
    // 인증 상태 리스너
    (0, auth_1.onAuthStateChanged)(auth, (user) => {
        currentUser = user;
    });
    // Provider 맵핑
    const getProvider = (providerName) => {
        switch (providerName) {
            case 'google':
                return new auth_1.GoogleAuthProvider();
            case 'github':
                return new auth_1.GithubAuthProvider();
            case 'apple':
                const appleProvider = new auth_1.OAuthProvider('apple.com');
                appleProvider.addScope('email');
                appleProvider.addScope('name');
                return appleProvider;
            case 'facebook':
                return new auth_1.OAuthProvider('facebook.com');
            default:
                throw new Error(`Provider ${providerName} is not supported by Firebase`);
        }
    };
    return {
        async signInWithProvider(provider, redirectTo) {
            try {
                // Strava나 custom은 Firebase가 지원하지 않음
                if (provider === 'strava' || provider === 'custom') {
                    throw new Error(`${provider} is not supported by Firebase. Use a custom adapter instead.`);
                }
                const authProvider = getProvider(provider);
                // 모바일이나 리다이렉트가 필요한 경우
                if (redirectTo || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    await (0, auth_1.signInWithRedirect)(auth, authProvider);
                    return { provider, redirectTo };
                }
                // 팝업 로그인 (기본)
                const result = await (0, auth_1.signInWithPopup)(auth, authProvider);
                const token = await result.user.getIdToken();
                return {
                    user: {
                        id: result.user.uid,
                        email: result.user.email,
                        name: result.user.displayName,
                        avatarUrl: result.user.photoURL,
                        provider: provider
                    },
                    session: {
                        access_token: token,
                        user: result.user
                    }
                };
            }
            catch (error) {
                console.error('Firebase auth error:', error);
                throw error;
            }
        },
        async signOut() {
            await (0, auth_1.signOut)(auth);
            currentUser = null;
        },
        async getUser() {
            if (!currentUser) {
                // 현재 사용자 대기
                return new Promise((resolve) => {
                    const unsubscribe = (0, auth_1.onAuthStateChanged)(auth, (user) => {
                        unsubscribe();
                        currentUser = user;
                        resolve(user ? {
                            id: user.uid,
                            email: user.email,
                            name: user.displayName,
                            avatarUrl: user.photoURL
                        } : null);
                    });
                });
            }
            return currentUser ? {
                id: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName,
                avatarUrl: currentUser.photoURL
            } : null;
        },
        async getSession() {
            const user = auth.currentUser;
            if (!user) {
                return null;
            }
            const token = await user.getIdToken();
            return {
                access_token: token,
                refresh_token: user.refreshToken,
                user: {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    avatarUrl: user.photoURL
                }
            };
        },
        async setSession(accessToken, refreshToken) {
            // Firebase는 토큰 기반 세션 설정을 직접 지원하지 않음
            // Custom token을 사용하려면 서버에서 생성 필요
            console.warn('Firebase does not support direct token-based session. Use signInWithCustomToken for server-generated tokens.');
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: currentUser
            };
        },
        async signUpWithEmail(email, password, metadata) {
            try {
                const credential = await (0, auth_1.createUserWithEmailAndPassword)(auth, email, password);
                const token = await credential.user.getIdToken();
                // 프로필 업데이트 (옵션)
                if (metadata?.name) {
                    await Promise.resolve().then(() => __importStar(require('firebase/auth'))).then(({ updateProfile }) => updateProfile(credential.user, {
                        displayName: metadata.name,
                        photoURL: metadata.photoURL
                    }));
                }
                return {
                    user: credential.user,
                    session: {
                        access_token: token,
                        user: credential.user
                    }
                };
            }
            catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    throw new Error('이미 사용 중인 이메일입니다.');
                }
                throw error;
            }
        },
        async signInWithEmail(email, password) {
            try {
                const credential = await (0, auth_1.signInWithEmailAndPassword)(auth, email, password);
                const token = await credential.user.getIdToken();
                return {
                    user: credential.user,
                    session: {
                        access_token: token,
                        user: credential.user
                    }
                };
            }
            catch (error) {
                if (error.code === 'auth/user-not-found') {
                    throw new Error('사용자를 찾을 수 없습니다.');
                }
                if (error.code === 'auth/wrong-password') {
                    throw new Error('비밀번호가 올바르지 않습니다.');
                }
                throw error;
            }
        },
        async refreshSession(refreshToken) {
            // Firebase는 자동으로 토큰을 갱신
            const user = auth.currentUser;
            if (!user)
                return null;
            const newToken = await user.getIdToken(true); // force refresh
            return {
                access_token: newToken,
                refresh_token: user.refreshToken,
                user: {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    avatarUrl: user.photoURL
                }
            };
        }
    };
};
exports.createFirebaseAdapter = createFirebaseAdapter;
