import { AuthAdapter, OAuthProvider } from '../auth.interface';

interface RenderAuthConfig {
  renderServerUrl: string;  // Render 서버 URL (예: https://your-app.onrender.com)
  frontendUrl?: string;     // 프론트엔드 URL (콜백용)
}

export const createRenderAdapter = (config: RenderAuthConfig): AuthAdapter => {
  const baseUrl = config.renderServerUrl;
  let currentSession: any = null;

  const adapter = {
    async signInWithProvider(provider: OAuthProvider, redirectTo?: string) {
      // Render 서버의 OAuth 엔드포인트로 리다이렉트
      const authUrl = `${baseUrl}/auth/${provider}`;

      // redirectTo를 query param으로 전달 (Render 서버에서 처리)
      const params = new URLSearchParams();
      if (redirectTo) {
        params.append('redirect_to', redirectTo);
      }

      const fullUrl = params.toString() ? `${authUrl}?${params}` : authUrl;

      // 브라우저 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = fullUrl;
      }

      return { url: fullUrl, provider };
    },

    async signOut() {
      // Render 서버의 로그아웃 엔드포인트 호출 (옵션)
      try {
        await fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${currentSession?.access_token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }

      // 로컬 세션 클리어
      currentSession = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('athlete_id');
      }
    },

    async getUser() {
      const session = await adapter.getSession();
      if (!session) return null;

      // Render 서버에서 사용자 정보 가져오기
      try {
        const response = await fetch(`${baseUrl}/api/user`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) return null;

        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error('Get user error:', error);
        return null;
      }
    },

    async getSession() {
      // 로컬 스토리지에서 세션 복원
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const athleteId = localStorage.getItem('athlete_id');

        if (accessToken) {
          currentSession = {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
              id: athleteId,
            }
          };

          // 토큰 유효성 검증 (옵션)
          try {
            const response = await fetch(`${baseUrl}/api/verify`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });

            if (!response.ok) {
              // 토큰이 만료되었으면 갱신 시도
              if (refreshToken) {
                return await adapter.refreshSession(refreshToken);
              }
              currentSession = null;
            }
          } catch (error) {
            console.error('Session verification error:', error);
          }
        }
      }

      return currentSession;
    },

    async setSession(accessToken: string, refreshToken: string) {
      // URL params나 Render 서버로부터 받은 토큰 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // athlete_id 같은 추가 정보도 저장 가능
        const params = new URLSearchParams(window.location.search);
        const athleteId = params.get('athlete_id');
        if (athleteId) {
          localStorage.setItem('athlete_id', athleteId);
        }
      }

      currentSession = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: localStorage.getItem('athlete_id'),
        }
      };

      return currentSession;
    },

    // Render 서버 전용 메서드들
    async refreshSession(refreshToken: string) {
      try {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();

        // 새 토큰 저장
        if (data.access_token) {
          return await adapter.setSession(data.access_token, data.refresh_token || refreshToken);
        }
      } catch (error) {
        console.error('Refresh token error:', error);
        currentSession = null;
      }

      return null;
    },

    // Render 서버에서 활동 데이터 가져오기 (Strava 전용)
    async getActivities(page: number = 1) {
      const session = await adapter.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${baseUrl}/api/activities?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      return response.json();
    }
  };

  return adapter;
};