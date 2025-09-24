# OAuth2 인증 모듈

간단하고 재사용 가능한 OAuth2 인증 서비스입니다.

## 설치

```bash
npm install @supabase/supabase-js
```

## 환경변수 설정

`.env` 파일에 추가:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 사용법

### 1. 초기 설정

```typescript
import { createAuthService } from './auth.service';

const auth = createAuthService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 2. 로그인

```typescript
// Google 로그인
await auth.signInWithProvider("google");

// GitHub 로그인
await auth.signInWithProvider("github");

// Apple 로그인
await auth.signInWithProvider("apple");
```

### 3. 현재 사용자 가져오기

```typescript
const user = await auth.getUser();
console.log(user?.email);
```

### 4. 로그아웃

```typescript
await auth.signOut();
```

## 파일 구조

```
auth/
├── auth.interface.ts   # 인터페이스 정의
├── oauth2.adapter.ts   # Supabase OAuth2 구현
└── auth.service.ts     # 메인 서비스
```

## 다른 인증 서비스로 변경하기

Firebase나 Auth0 등으로 변경하려면 `oauth2.adapter.ts`만 수정하면 됩니다:

```typescript
// firebase.adapter.ts 예시
export const createFirebaseAdapter = (config): AuthAdapter => {
  // Firebase 구현
};
```

## Supabase 프로젝트 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. Authentication > Providers에서 원하는 OAuth 제공자 활성화
3. 각 제공자별 Client ID/Secret 설정
4. Redirect URLs 설정: `https://yourproject.supabase.co/auth/v1/callback`

## 지원하는 OAuth 제공자

### Supabase로 직접 지원
- Google
- Apple
- Kakao
- GitHub
- Facebook
- Twitter

### Render 서버 필요 (커스텀)
- Strava
- 기타 커스텀 OAuth provider

## Render 서버를 이용한 Strava 인증

### 1. Render 서버 설정 (Python FastAPI)

```python
# render_server.py
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
import requests
import os

app = FastAPI()

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
REDIRECT_URI = "https://your-app.onrender.com/callback"

@app.get("/auth/strava")
def strava_login():
    """Strava OAuth 시작"""
    params = {
        "client_id": STRAVA_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": "activity:read"
    }
    return RedirectResponse(f"https://www.strava.com/oauth/authorize?{urlencode(params)}")

@app.get("/callback")
def strava_callback(code: str):
    """OAuth 콜백 처리"""
    # Code를 Token으로 교환
    token_res = requests.post("https://www.strava.com/oauth/token", data={
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code"
    })

    token_data = token_res.json()

    # Frontend로 토큰 전달
    params = urlencode({
        "access_token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "athlete_id": token_data["athlete"]["id"]
    })

    return RedirectResponse(f"http://localhost:3000/auth/callback?{params}")
```

### 2. Frontend 설정

```typescript
// Render Adapter 사용
import { createRenderAdapter } from './adapters/render.adapter';
import { AuthService } from './auth.service';

const renderAdapter = createRenderAdapter({
  renderServerUrl: 'https://your-app.onrender.com',
  frontendUrl: 'http://localhost:3000'
});

const stravaAuth = new AuthService(renderAdapter);

// Strava 로그인
await stravaAuth.signInWithProvider('strava');
```

### 3. 콜백 처리

```typescript
// pages/auth/callback.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    await stravaAuth.setSession(accessToken, refreshToken);
    // 로그인 성공
    router.push('/dashboard');
  }
}, []);
```

### 4. Strava API 사용

```typescript
// 활동 데이터 가져오기
const activities = await renderAdapter.getActivities(1);

// 또는 직접 Strava API 호출
const response = await fetch('https://www.strava.com/api/v3/athlete', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

## 파일 구조

```
auth/
├── auth.interface.ts        # 인터페이스 정의
├── oauth2.adapter.ts        # Supabase OAuth2 구현
├── auth.service.ts          # 메인 서비스
└── adapters/
    ├── supabase.adapter.ts  # Supabase 전용
    ├── render.adapter.ts    # Render 서버 전용
    └── custom-oauth.adapter.ts  # 커스텀 OAuth
```

## 환경변수 설정

### Supabase 사용 시
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Firebase 사용 시
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Render + Strava 사용 시
```env
# Render 서버
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret

# Frontend
NEXT_PUBLIC_RENDER_SERVER_URL=https://your-app.onrender.com
```

## Firebase 인증 사용하기

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Authentication > Sign-in method에서 원하는 제공자 활성화
3. 웹 앱 추가 후 설정 정보 복사

### 2. Firebase Adapter 사용

```typescript
// Firebase Adapter 설정
import { createFirebaseAdapter } from './adapters/firebase.adapter';
import { AuthService } from './auth.service';

const firebaseAdapter = createFirebaseAdapter({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
});

const firebaseAuth = new AuthService(firebaseAdapter);

// Google 로그인
await firebaseAuth.signInWithProvider('google');

// 이메일 회원가입
await firebaseAuth.signUpWithEmail('user@example.com', 'password123', {
  name: '홍길동'
});

// 이메일 로그인
await firebaseAuth.signInWithEmail('user@example.com', 'password123');
```

### 3. Firebase 설치

```bash
npm install firebase
```

### 4. Firebase 특징

- **팝업 로그인**: 기본적으로 팝업 창에서 OAuth 진행
- **리다이렉트 지원**: 모바일이나 특정 상황에서 리다이렉트 방식 자동 선택
- **토큰 자동 갱신**: Firebase가 자동으로 토큰 관리
- **이메일 인증**: 이메일/비밀번호 회원가입 및 로그인 지원

## 어댑터 비교

| 기능 | Supabase | Firebase | Render |
|------|----------|----------|--------|
| OAuth | ✅ | ✅ | ✅ |
| 이메일 인증 | ✅ | ✅ | ❌ |
| 커스텀 Provider | ❌ | ❌ | ✅ |
| 설정 복잡도 | 쉬움 | 보통 | 어려움 |
| 비용 | 무료 시작 | 무료 시작 | 서버 비용 |

## 라이센스

MIT