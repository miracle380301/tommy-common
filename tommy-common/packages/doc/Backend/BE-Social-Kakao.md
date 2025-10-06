Day 6: 소셜 로그인 (1) - Google & Kakao OAuth
📋 목표
Google OAuth 2.0과 Kakao OAuth 2.0을 통한 소셜 로그인 구현
📁 디렉토리 구조
src/modules/auth/
├── social/
│   ├── providers/
│   │   ├── GoogleProvider.js    # Google OAuth 로직
│   │   ├── KakaoProvider.js     # Kakao OAuth 로직
│   │   └── BaseProvider.js      # 공통 인터페이스
│   ├── controllers/
│   │   └── socialAuthController.js
│   ├── services/
│   │   └── socialAuthService.js
│   └── index.js
└── models/
    └── User.js  # (업데이트 - 소셜 ID 필드 추가됨)
🎯 구현 모듈
6.1 Base Provider (공통 인터페이스)
파일 위치: src/modules/auth/social/providers/BaseProvider.js
목적: 모든 OAuth Provider가 구현해야 하는 공통 인터페이스
필수 메서드:
javascriptclass BaseProvider {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  // 인증 URL 생성
  getAuthUrl(state) {
    throw new Error('getAuthUrl must be implemented');
  }

  // Authorization Code로 Access Token 교환
  async getAccessToken(code) {
    throw new Error('getAccessToken must be implemented');
  }

  // Access Token으로 사용자 정보 조회
  async getUserInfo(accessToken) {
    throw new Error('getUserInfo must be implemented');
  }

  // 공통 형식으로 변환
  normalizeUserInfo(rawUserInfo) {
    throw new Error('normalizeUserInfo must be implemented');
  }
}
normalizeUserInfo 반환 형식:
javascript{
  providerId: '1234567890',        // OAuth Provider의 고유 ID
  provider: 'google',              // 'google' | 'kakao' | 'apple'
  email: 'user@example.com',
  name: 'John Doe',
  profileImage: 'https://...',
  raw: { /* 원본 데이터 */ }
}
6.2 Google OAuth Provider
파일 위치: src/modules/auth/social/providers/GoogleProvider.js
환경 변수:
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
구현:

getAuthUrl(state)

javascript   getAuthUrl(state) {
     const params = new URLSearchParams({
       client_id: this.clientId,
       redirect_uri: this.redirectUri,
       response_type: 'code',
       scope: 'openid email profile',
       state: state,  // CSRF 방지
       access_type: 'offline',
       prompt: 'consent'
     });
     
     return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
   }

getAccessToken(code)

javascript   async getAccessToken(code) {
     const response = await axios.post(
       'https://oauth2.googleapis.com/token',
       {
         code,
         client_id: this.clientId,
         client_secret: this.clientSecret,
         redirect_uri: this.redirectUri,
         grant_type: 'authorization_code'
       }
     );
     
     return {
       accessToken: response.data.access_token,
       refreshToken: response.data.refresh_token,
       expiresIn: response.data.expires_in,
       idToken: response.data.id_token
     };
   }

getUserInfo(accessToken)

javascript   async getUserInfo(accessToken) {
     const response = await axios.get(
       'https://www.googleapis.com/oauth2/v2/userinfo',
       {
         headers: {
           Authorization: `Bearer ${accessToken}`
         }
       }
     );
     
     return response.data;
   }

normalizeUserInfo(rawUserInfo)

javascript   normalizeUserInfo(rawUserInfo) {
     return {
       providerId: rawUserInfo.id,
       provider: 'google',
       email: rawUserInfo.email,
       name: rawUserInfo.name,
       profileImage: rawUserInfo.picture,
       raw: rawUserInfo
     };
   }
Google API 응답 예시:
json{
  "id": "1234567890",
  "email": "user@gmail.com",
  "verified_email": true,
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "locale": "en"
}
6.3 Kakao OAuth Provider
파일 위치: src/modules/auth/social/providers/KakaoProvider.js
환경 변수:
KAKAO_CLIENT_ID=your-rest-api-key
KAKAO_CLIENT_SECRET=your-client-secret  # 선택적
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
구현:

getAuthUrl(state)

javascript   getAuthUrl(state) {
     const params = new URLSearchParams({
       client_id: this.clientId,
       redirect_uri: this.redirectUri,
       response_type: 'code',
       state: state
     });
     
     return `https://kauth.kakao.com/oauth/authorize?${params}`;
   }

getAccessToken(code)

javascript   async getAccessToken(code) {
     const params = new URLSearchParams({
       grant_type: 'authorization_code',
       client_id: this.clientId,
       redirect_uri: this.redirectUri,
       code
     });
     
     if (this.clientSecret) {
       params.append('client_secret', this.clientSecret);
     }
     
     const response = await axios.post(
       'https://kauth.kakao.com/oauth/token',
       params,
       {
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
         }
       }
     );
     
     return {
       accessToken: response.data.access_token,
       refreshToken: response.data.refresh_token,
       expiresIn: response.data.expires_in
     };
   }

getUserInfo(accessToken)

javascript   async getUserInfo(accessToken) {
     const response = await axios.get(
       'https://kapi.kakao.com/v2/user/me',
       {
         headers: {
           Authorization: `Bearer ${accessToken}`,
           'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
         }
       }
     );
     
     return response.data;
   }

normalizeUserInfo(rawUserInfo)

javascript   normalizeUserInfo(rawUserInfo) {
     const { id, kakao_account } = rawUserInfo;
     const { email, profile } = kakao_account;
     
     return {
       providerId: id.toString(),
       provider: 'kakao',
       email: email || null,
       name: profile?.nickname || 'Kakao User',
       profileImage: profile?.profile_image_url || null,
       raw: rawUserInfo
     };
   }
Kakao API 응답 예시:
json{
  "id": 1234567890,
  "connected_at": "2023-01-01T00:00:00Z",
  "kakao_account": {
    "profile_needs_agreement": false,
    "profile": {
      "nickname": "홍길동",
      "profile_image_url": "http://k.kakaocdn.net/...",
      "thumbnail_image_url": "http://k.kakaocdn.net/..."
    },
    "has_email": true,
    "email_needs_agreement": false,
    "is_email_valid": true,
    "is_email_verified": true,
    "email": "user@kakao.com"
  }
}
6.4 Social Auth Service
파일 위치: src/modules/auth/social/services/socialAuthService.js
목적: 소셜 로그인 비즈니스 로직
기능:

generateState()

CSRF 방지용 랜덤 문자열 생성
32자 랜덤 문자열
Redis나 세션에 저장 (5분 TTL)



javascript   const state = crypto.randomBytes(16).toString('hex');
   await redis.setex(`oauth:state:${state}`, 300, '1');
   return state;

verifyState(state)

state 검증
Redis에서 조회 후 삭제



javascript   const exists = await redis.get(`oauth:state:${state}`);
   if (!exists) {
     throw new AppError('Invalid state parameter', 400);
   }
   await redis.del(`oauth:state:${state}`);

handleOAuthCallback(provider, code, state)

OAuth Callback 처리
프로세스:



javascript   async handleOAuthCallback(provider, code, state) {
     // 1. State 검증
     await this.verifyState(state);
     
     // 2. Provider 선택
     const oauthProvider = this.getProvider(provider);
     
     // 3. Access Token 획득
     const { accessToken } = await oauthProvider.getAccessToken(code);
     
     // 4. 사용자 정보 조회
     const rawUserInfo = await oauthProvider.getUserInfo(accessToken);
     const userInfo = oauthProvider.normalizeUserInfo(rawUserInfo);
     
     // 5. 기존 사용자 확인 또는 생성
     const user = await this.findOrCreateUser(userInfo);
     
     // 6. JWT 토큰 생성
     const tokens = await authService.generateTokenPair(
       user.id,
       user.email,
       user.role
     );
     
     return { user, tokens };
   }

findOrCreateUser(userInfo)

javascript   async findOrCreateUser(userInfo) {
     const { providerId, provider, email, name, profileImage } = userInfo;
     
     // Provider ID로 먼저 조회
     const providerIdField = `${provider}Id`;  // googleId, kakaoId
     let user = await userRepo.findOne({ [providerIdField]: providerId });
     
     if (user) {
       // 기존 사용자 - lastLoginAt 업데이트
       await userRepo.update(user.id, { lastLoginAt: new Date() });
       return user;
     }
     
     // 이메일로 조회 (계정 통합)
     if (email) {
       user = await userRepo.findOne({ email });
       
       if (user) {
         // 이메일은 같지만 소셜 계정 미연결 - 연결
         await userRepo.update(user.id, {
           [providerIdField]: providerId,
           lastLoginAt: new Date()
         });
         return user;
       }
     }
     
     // 신규 사용자 생성
     user = await userRepo.create({
       email,
       name,
       [providerIdField]: providerId,
       profileImage,
       isEmailVerified: true,  // 소셜 로그인은 이메일 검증됨
       role: 'user',
       lastLoginAt: new Date()
     });
     
     return user;
   }

linkSocialAccount(userId, provider, code, state)

기존 계정에 소셜 계정 연결



javascript   async linkSocialAccount(userId, provider, code, state) {
     await this.verifyState(state);
     
     const oauthProvider = this.getProvider(provider);
     const { accessToken } = await oauthProvider.getAccessToken(code);
     const rawUserInfo = await oauthProvider.getUserInfo(accessToken);
     const userInfo = oauthProvider.normalizeUserInfo(rawUserInfo);
     
     // 이미 다른 계정에 연결되어 있는지 확인
     const providerIdField = `${provider}Id`;
     const existingUser = await userRepo.findOne({
       [providerIdField]: userInfo.providerId
     });
     
     if (existingUser && existingUser.id !== userId) {
       throw new AppError(
         'This social account is already linked to another user',
         409
       );
     }
     
     // 연결
     await userRepo.update(userId, {
       [providerIdField]: userInfo.providerId
     });
     
     return { success: true };
   }

unlinkSocialAccount(userId, provider)

소셜 계정 연결 해제



javascript   async unlinkSocialAccount(userId, provider) {
     const user = await userRepo.findById(userId);
     
     // 비밀번호가 없고 소셜 계정이 1개뿐이면 해제 불가
     if (!user.password) {
       const linkedAccounts = [
         user.googleId,
         user.kakaoId,
         user.appleId
       ].filter(Boolean).length;
       
       if (linkedAccounts === 1) {
         throw new AppError(
           'Cannot unlink the only authentication method',
           400
         );
       }
     }
     
     const providerIdField = `${provider}Id`;
     await userRepo.update(userId, {
       [providerIdField]: null
     });
     
     return { success: true };
   }
6.5 Social Auth Controller
파일 위치: src/modules/auth/social/controllers/socialAuthController.js
엔드포인트:
1. GET /auth/:provider (로그인 시작)
javascriptasync login(req, res, next) {
  try {
    const { provider } = req.params;
    
    // Provider 검증
    if (!['google', 'kakao'].includes(provider)) {
      throw new AppError('Invalid provider', 400);
    }
    
    // State 생성
    const state = await socialAuthService.generateState();
    
    // Provider 인스턴스
    const oauthProvider = socialAuthService.getProvider(provider);
    
    // 인증 URL 생성
    const authUrl = oauthProvider.getAuthUrl(state);
    
    // 리다이렉트
    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
}
2. GET /auth/:provider/callback (Callback)
javascriptasync callback(req, res, next) {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;
    
    // OAuth 에러 체크
    if (error) {
      throw new AppError(`OAuth error: ${error}`, 400);
    }
    
    if (!code || !state) {
      throw new AppError('Missing code or state', 400);
    }
    
    // OAuth 처리
    const result = await socialAuthService.handleOAuthCallback(
      provider,
      code,
      state
    );
    
    // 프론트엔드로 리다이렉트 (토큰 포함)
    const redirectUrl = new URL(config.FRONTEND_URL);
    redirectUrl.searchParams.append('accessToken', result.tokens.accessToken);
    redirectUrl.searchParams.append('refreshToken', result.tokens.refreshToken);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    // 에러 시 프론트엔드 에러 페이지로
    const errorUrl = new URL(`${config.FRONTEND_URL}/auth/error`);
    errorUrl.searchParams.append('message', error.message);
    res.redirect(errorUrl.toString());
  }
}
3. POST /auth/link/:provider (계정 연결)
javascriptasync link(req, res, next) {
  try {
    const { provider } = req.params;
    const { code, state } = req.body;
    const userId = req.user.userId;  // authenticate 미들웨어 필요
    
    await socialAuthService.linkSocialAccount(userId, provider, code, state);
    
    successResponse(res, null, 'Social account linked successfully');
  } catch (error) {
    next(error);
  }
}
4. DELETE /auth/unlink/:provider (연결 해제)
javascriptasync unlink(req, res, next) {
  try {
    const { provider } = req.params;
    const userId = req.user.userId;
    
    await socialAuthService.unlinkSocialAccount(userId, provider);
    
    successResponse(res, null, 'Social account unlinked successfully');
  } catch (error) {
    next(error);
  }
}
📦 패키지 의존성
json"dependencies": {
  "axios": "^1.6.0",
  "ioredis": "^5.3.2"  // State 저장용 (또는 세션)
}
📝 사용 예제
파일 위치: examples/day6-social-auth.js
javascriptconst express = require('express');
const { socialAuthController, authenticate } = require('../src/modules/auth');

const app = express();
app.use(express.json());

// 소셜 로그인 시작
app.get('/auth/:provider', socialAuthController.login);

// OAuth Callback
app.get('/auth/:provider/callback', socialAuthController.callback);

// 소셜 계정 연결 (인증 필요)
app.post('/auth/link/:provider', authenticate, socialAuthController.link);

// 소셜 계정 해제 (인증 필요)
app.delete('/auth/unlink/:provider', authenticate, socialAuthController.unlink);

app.listen(3000);

// 사용 흐름:
// 1. 프론트엔드에서 GET /auth/google 호출
// 2. Google 로그인 페이지로 리다이렉트
// 3. 사용자가 로그인/승인
// 4. Google이 GET /auth/google/callback?code=...&state=... 호출
// 5. 백엔드가 토큰 발급 후 프론트엔드로 리다이렉트
✅ 완료 기준

 Google OAuth 로그인 정상 동작
 Kakao OAuth 로그인 정상 동작
 State 파라미터로 CSRF 방지
 신규 사용자 자동 생성
 기존 이메일로 계정 통합
 소셜 계정 연결/해제 기능
 에러 처리 (OAuth 에러, State 불일치 등)