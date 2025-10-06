# @miracle380301/social-auth-backend

OAuth 2.0 소셜 로그인 백엔드 (Google, Kakao, Apple)

## 설치

```bash
npm install @miracle380301/social-auth-backend
```

## 사용법

### 1. 독립 실행형 서버

**server.js**
```javascript
require('dotenv').config();
const { startOAuthServer } = require('@miracle380301/social-auth-backend');

// 환경변수를 읽어서 설정에 전달
startOAuthServer({
  google: process.env.GOOGLE_CLIENT_ID ? {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI  // 선택
  } : undefined,
  kakao: process.env.KAKAO_CLIENT_ID ? {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    redirectUri: process.env.KAKAO_REDIRECT_URI  // 선택
  } : undefined,
  apple: undefined,  // 아직 미지원
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this',
    expiresIn: '7d'
  },
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin: process.env.FRONTEND_URL || 'http://localhost:5173'
});
```

### 2. 기존 Express 앱에 통합

```javascript
require('dotenv').config();
const express = require('express');
const { setupOAuth } = require('@miracle380301/social-auth-backend');

const app = express();

// OAuth 기능 추가 (반환값 활용 가능)
const { oauthConfig, jwtUtils, authenticate } = setupOAuth(app, {
  google: process.env.GOOGLE_CLIENT_ID ? {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  } : undefined,
  kakao: process.env.KAKAO_CLIENT_ID ? {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    redirectUri: process.env.KAKAO_REDIRECT_URI
  } : undefined,
  apple: undefined,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this',
    expiresIn: '7d'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigin: process.env.FRONTEND_URL || 'http://localhost:5173'
});

// 다른 라우트 추가 (authenticate 미들웨어 사용)
app.get('/', (req, res) => {
  res.send('My App');
});

app.get('/protected', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000);
```

## 환경변수 설정

**.env**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback  # 선택

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback  # 선택

# Apple OAuth (선택)
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
APPLE_REDIRECT_URI=http://localhost:3000/api/auth/apple/callback

# JWT (필수)
JWT_SECRET=your-super-secret-jwt-key

# 서버 설정 (선택)
PORT=3000
FRONTEND_URL=http://localhost:5173
```

> **중요:** 환경변수는 패키지가 직접 읽지 않습니다. 사용자 코드에서 읽어서 설정 객체로 전달해야 합니다.
> 이를 통해 환경변수 이름을 자유롭게 설정할 수 있고, 다른 패키지와 충돌하지 않습니다.

## API 엔드포인트

### OAuth 로그인
- `GET /api/auth/google` - Google 로그인 시작
- `GET /api/auth/kakao` - Kakao 로그인 시작
- `GET /api/auth/apple` - Apple 로그인 시작

### 콜백
- `GET /api/auth/google/callback` - Google 콜백
- `GET /api/auth/kakao/callback` - Kakao 콜백
- `GET /api/auth/apple/callback` - Apple 콜백

### 사용자 정보
- `GET /api/auth/me` - 현재 사용자 정보 (JWT 필요)
- `POST /api/auth/logout` - 로그아웃

### 헬스체크
- `GET /health` - 서버 상태 확인

## OAuth Providers 설정

### Google
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI 추가: `http://localhost:3000/api/auth/google/callback`

### Kakao
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 앱 생성
3. 플랫폼 설정에서 Web 플랫폼 추가
4. Redirect URI 설정: `http://localhost:3000/api/auth/kakao/callback`
5. 카카오 로그인 활성화

### Apple
1. [Apple Developer](https://developer.apple.com/) 접속
2. Services ID 생성
3. Sign in with Apple 설정
4. Return URLs 추가: `http://localhost:3000/api/auth/apple/callback`

## 고급 사용법

### 미들웨어 사용

```javascript
const { authenticate } = require('@miracle380301/social-auth-backend');

app.get('/protected', authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

### JWT 토큰 생성/검증

```javascript
const { generateToken, verifyToken } = require('@miracle380301/social-auth-backend');

const token = generateToken({
  id: 'user123',
  email: 'user@example.com'
});

const payload = verifyToken(token);
```

### OAuth 설정 커스터마이징

```javascript
const { oauthConfig } = require('@miracle380301/social-auth-backend');

// OAuth 설정 확인
console.log(oauthConfig.google.clientId);
console.log(oauthConfig.kakao.redirectUri);
```

## 프론트엔드 연동

### 1. 소셜 로그인 버튼

```javascript
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:3000/api/auth/google';
};

const handleKakaoLogin = () => {
  window.location.href = 'http://localhost:3000/api/auth/kakao';
};
```

### 2. 콜백 처리

```javascript
// /auth/callback 라우트에서
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (token) {
  localStorage.setItem('authToken', token);
  // 사용자 정보 조회
  fetch('http://localhost:3000/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => console.log(data.user));
}
```

### 3. @miracle380301/common 사용

```jsx
import { LoginForm } from '@miracle380301/common';

function App() {
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  return (
    <LoginForm
      showSocialLogin
      socialProviders={['google', 'kakao', 'apple']}
      onSocialLogin={handleSocialLogin}
    />
  );
}
```

## 라이센스

MIT
