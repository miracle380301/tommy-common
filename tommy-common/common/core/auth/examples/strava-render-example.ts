// ===== 1. Render 서버 코드 (Python FastAPI 예시) =====
/*
# render_server.py
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
import requests
import os

app = FastAPI()

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
REDIRECT_URI = "https://your-render-app.onrender.com/callback"
FRONTEND_URL = "http://localhost:3000"

@app.get("/auth/strava")
def strava_login():
    """Strava OAuth 로그인 시작"""
    auth_url = f"https://www.strava.com/oauth/authorize"
    params = {
        "client_id": STRAVA_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": "activity:read",
        "approval_prompt": "auto"
    }
    redirect_url = f"{auth_url}?{urlencode(params)}"
    return RedirectResponse(redirect_url)

@app.get("/callback")
def strava_callback(code: str):
    """Strava OAuth 콜백 처리"""
    # 1. code를 access token으로 교환
    token_response = requests.post("https://www.strava.com/oauth/token", data={
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code"
    })

    token_data = token_response.json()
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    athlete_info = token_data.get("athlete")

    # 2. 프론트엔드로 리다이렉트 (토큰 전달)
    params = urlencode({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "athlete_id": athlete_info.get("id")
    })

    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?{params}")
*/

// ===== 2. 프론트엔드 코드 (Next.js) =====

// auth.config.ts
import { createCustomOAuthAdapter } from '../common/core/auth/adapters/custom-oauth.adapter';
import { AuthService } from '../common/core/auth/auth.service';

// Strava + Render 서버용 커스텀 어댑터
const stravaAdapter = createCustomOAuthAdapter({
  authUrl: 'https://your-render-app.onrender.com/auth/strava',
  tokenUrl: 'https://www.strava.com/oauth/token',
  clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
  clientSecret: '', // 서버에서 처리
  redirectUri: 'https://your-render-app.onrender.com/callback',
  scope: 'activity:read'
});

// AuthService 생성 (커스텀 어댑터 사용)
export const stravaAuth = new AuthService(stravaAdapter);

// ===== 3. 로그인 페이지 =====

// pages/login.tsx
import { stravaAuth } from '../auth.config';

export default function LoginPage() {
  const handleStravaLogin = async () => {
    // Render 서버의 Strava OAuth 엔드포인트로 리다이렉트
    await stravaAuth.signInWithProvider('strava');
  };

  return (
    <button onClick={handleStravaLogin}>
      Strava로 로그인
    </button>
  );
}

// ===== 4. 콜백 페이지 =====

// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { stravaAuth } from '../auth.config';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // URL 파라미터에서 토큰 추출
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // 세션 설정
        await stravaAuth.setSession(accessToken, refreshToken);

        // Strava API 호출 예시
        const athleteData = await fetchStravaAthlete(accessToken);

        // 홈으로 리다이렉트
        router.push('/dashboard');
      }
    };

    handleCallback();
  }, []);

  return <div>인증 처리 중...</div>;
}

// ===== 5. Strava API 사용 =====

async function fetchStravaAthlete(accessToken: string) {
  const response = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}

async function fetchStravaActivities(accessToken: string) {
  const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
}