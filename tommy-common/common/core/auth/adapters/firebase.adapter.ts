import {
  initializeApp,
  FirebaseApp,
  getApps,
  getApp
} from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider as FirebaseOAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { AuthAdapter, OAuthProvider } from '../auth.interface';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export const createFirebaseAdapter = (config: FirebaseConfig): AuthAdapter => {
  // Firebase 초기화 (이미 초기화되어 있으면 재사용)
  const app: FirebaseApp = getApps().length === 0
    ? initializeApp(config)
    : getApp();

  const auth: Auth = getAuth(app);
  let currentUser: User | null = null;

  // 인증 상태 리스너
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
  });

  // Provider 맵핑
  const getProvider = (providerName: OAuthProvider) => {
    switch (providerName) {
      case 'google':
        return new GoogleAuthProvider();
      case 'github':
        return new GithubAuthProvider();
      case 'apple':
        const appleProvider = new FirebaseOAuthProvider('apple.com');
        appleProvider.addScope('email');
        appleProvider.addScope('name');
        return appleProvider;
      case 'facebook':
        return new FirebaseOAuthProvider('facebook.com');
      default:
        throw new Error(`Provider ${providerName} is not supported by Firebase`);
    }
  };

  return {
    async signInWithProvider(provider: OAuthProvider, redirectTo?: string) {
      try {
        // Strava나 custom은 Firebase가 지원하지 않음
        if (provider === 'strava' || provider === 'custom') {
          throw new Error(`${provider} is not supported by Firebase. Use a custom adapter instead.`);
        }

        const authProvider = getProvider(provider);

        // 모바일이나 리다이렉트가 필요한 경우
        if (redirectTo || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          await signInWithRedirect(auth, authProvider);
          return { provider, redirectTo };
        }

        // 팝업 로그인 (기본)
        const result = await signInWithPopup(auth, authProvider);
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
      } catch (error: any) {
        console.error('Firebase auth error:', error);
        throw error;
      }
    },

    async signOut() {
      await firebaseSignOut(auth);
      currentUser = null;
    },

    async getUser() {
      if (!currentUser) {
        // 현재 사용자 대기
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
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

    async setSession(accessToken: string, refreshToken: string) {
      // Firebase는 토큰 기반 세션 설정을 직접 지원하지 않음
      // Custom token을 사용하려면 서버에서 생성 필요
      console.warn('Firebase does not support direct token-based session. Use signInWithCustomToken for server-generated tokens.');

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: currentUser
      };
    },

    async signUpWithEmail(email: string, password: string, metadata?: any) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await credential.user.getIdToken();

        // 프로필 업데이트 (옵션)
        if (metadata?.name) {
          await import('firebase/auth').then(({ updateProfile }) =>
            updateProfile(credential.user, {
              displayName: metadata.name,
              photoURL: metadata.photoURL
            })
          );
        }

        return {
          user: credential.user,
          session: {
            access_token: token,
            user: credential.user
          }
        };
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('이미 사용 중인 이메일입니다.');
        }
        throw error;
      }
    },

    async signInWithEmail(email: string, password: string) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const token = await credential.user.getIdToken();

        return {
          user: credential.user,
          session: {
            access_token: token,
            user: credential.user
          }
        };
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          throw new Error('사용자를 찾을 수 없습니다.');
        }
        if (error.code === 'auth/wrong-password') {
          throw new Error('비밀번호가 올바르지 않습니다.');
        }
        throw error;
      }
    },

    async refreshSession(refreshToken: string) {
      // Firebase는 자동으로 토큰을 갱신
      const user = auth.currentUser;
      if (!user) return null;

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