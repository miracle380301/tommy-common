Day 7: 소셜 로그인 (2) - Apple Sign In & Magic Link
📋 목표
Apple Sign In과 Magic Link (이메일 인증 로그인) 구현
📁 디렉토리 구조
src/modules/auth/
├── social/
│   ├── providers/
│   │   ├── AppleProvider.js     # 신규
│   │   └── EmailProvider.js     # 신규 (Magic Link)
│   └── services/
│       └── socialAuthService.js  # 업데이트
└── email/
    ├── templates/
    │   └── magicLink.html       # 이메일 템플릿
    └── emailService.js          # 이메일 발송
🎯 구현 모듈
7.1 Apple Sign In Provider
파일 위치: src/modules/auth/social/providers/AppleProvider.js
환경 변수:
APPLE_CLIENT_ID=com.yourcompany.app
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY_PATH=./apple-private-key.p8
APPLE_REDIRECT_URI=https://yourapp.com/auth/apple/callback
특징:

Apple Sign In은 다른 OAuth와 달리 JWT를 사용
Private Key로 Client Secret을 직접 생성해야 함
ID Token에 사용자 정보가 포함됨

구현:

generateClientSecret()

javascript   generateClientSecret() {
     const now = Math.floor(Date.now() / 1000);
     
     const payload = {
       iss: this.teamId,
       iat: now,
       exp: now + 3600 * 24 * 180,  // 6개월
       aud: 'https://appleid.apple.com',
       sub: this.clientId
     };
     
     const privateKey = fs.readFileSync(this.privateKeyPath);
     
     return jwt.sign(payload, privateKey, {
       algorithm: 'ES256',
       header: {
         alg: 'ES256',
         kid: this.keyId
       }
     });
   }

getAuthUrl(state)

javascript   getAuthUrl(state) {
     const params = new URLSearchParams({
       client_id: this.clientId,
       redirect_uri: this.redirectUri,
       response_type: 'code id_token',
       response_mode: 'form_post',  // Apple은 POST 사용
       scope: 'name email',
       state: state
     });
     
     return `https://appleid.apple.com/auth/authorize?${params}`;
   }

getAccessToken(code)

javascript   async getAccessToken(code) {
     const clientSecret = this.generateClientSecret();
     
     const params = new URLSearchParams({
       client_id: this.clientId,
       client_secret: clientSecret,
       code,
       grant_type: 'authorization_code',
       redirect_uri: this.redirectUri
     });
     
     const response = await axios.post(
       'https://appleid.apple.com/auth/token',
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
       idToken: response.data.id_token,
       expiresIn: response.data.expires_in
     };
   }

getUserInfo(idToken)

javascript   async getUserInfo(idToken) {
     // Apple은 ID Token에 사용자 정보가 포함됨
     const decoded = jwt.decode(idToken);
     
     return {
       sub: decoded.sub,  // Apple User ID
       email: decoded.email,
       email_verified: decoded.email_verified
     };
   }

normalizeUserInfo(rawUserInfo, userData = null)

javascript   normalizeUserInfo(rawUserInfo, userData = null) {
     // userData는 첫 로그인 시에만 제공됨 (이름 정보)
     let name = 'Apple User';
     
     if (userData && userData.name) {
       const { firstName, lastName } = userData.name;
       name = `${firstName || ''} ${lastName || ''}`.trim();
     }
     
     return {
       providerId: rawUserInfo.sub,
       provider: 'apple',
       email: rawUserInfo.email,
       name,
       profileImage: null,  // Apple은 프로필 이미지 미제공
       raw: rawUserInfo
     };
   }
Apple Sign In 주의사항:

사용자 정보(이름)는 첫 로그인 시에만 제공됨
이후 로그인에서는 ID Token에 sub와 email만 포함
따라서 첫 로그인 시 이름을 꼭 저장해야 함

Callback 처리 (POST):
javascript// Apple은 POST로 callback 호출
async appleCallback(req, res, next) {
  try {
    const { code, state, user } = req.body;  // POST body에서 추출
    
    // user는 JSON 문자열 (첫 로그인 시만)
    const userData = user ? JSON.parse(user) : null;
    
    const result = await socialAuthService.handleAppleCallback(
      code,
      state,
      userData
    );
    
    // ... 토큰 발급 및 리다이렉트
  } catch (error) {
    next(error);
  }
}
7.2 Email Provider (Magic Link)
파일 위치: src/modules/auth/social/providers/EmailProvider.js
목적: 비밀번호 없이 이메일 링크로 로그인
환경 변수:
MAGIC_LINK_SECRET=your-magic-link-secret
MAGIC_LINK_EXPIRES_IN=15m
FRONTEND_URL=http://localhost:3000
동작 방식:

사용자가 이메일 입력
서버가 토큰 생성 후 이메일 발송
사용자가 이메일 링크 클릭
서버가 토큰 검증 후 로그인 처리

구현:

generateMagicToken(email)

javascript   generateMagicToken(email) {
     const payload = {
       email,
       type: 'magic-link',
       iat: Date.now()
     };
     
     return jwt.sign(payload, this.magicLinkSecret, {
       expiresIn: this.magicLinkExpiresIn  // 15분
     });
   }

verifyMagicToken(token)

javascript   verifyMagicToken(token) {
     try {
       const decoded = jwt.verify(token, this.magicLinkSecret);
       
       if (decoded.type !== 'magic-link') {
         throw new Error('Invalid token type');
       }
       
       return decoded;
     } catch (error) {
       if (error.name === 'TokenExpiredError') {
         throw new AppError('Magic link expired', 401);
       }
       throw new AppError('Invalid magic link', 401);
     }
   }

sendMagicLink(email)

javascript   async sendMagicLink(email) {
     // 토큰 생성
     const token = this.generateMagicToken(email);
     
     // Magic Link URL 생성
     const magicLink = `${this.frontendUrl}/auth/verify?token=${token}`;
     
     // 이메일 발송
     await emailService.sendMagicLink(email, magicLink);
     
     return { success: true };
   }

verifyAndLogin(token)

javascript   async verifyAndLogin(token) {
     // 토큰 검증
     const decoded = this.verifyMagicToken(token);
     const { email } = decoded;
     
     // 사용자 조회 또는 생성
     let user = await userRepo.findOne({ email });
     
     if (!user) {
       // 신규 사용자 생성
       user = await userRepo.create({
         email,
         name: email.split('@')[0],  // 이메일 앞부분을 이름으로
         isEmailVerified: true,
         role: 'user',
         lastLoginAt: new Date()
       });
     } else {
       // 기존 사용자 - lastLoginAt 업데이트
       await userRepo.update(user.id, { lastLoginAt: new Date() });
     }
     
     // JWT 토큰 생성
     const tokens = await authService.generateTokenPair(
       user.id,
       user.email,
       user.role
     );
     
     return { user, tokens };
   }
7.3 이메일 서비스
파일 위치: src/modules/auth/email/emailService.js
환경 변수:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
구현:

Nodemailer 설정

javascript   const nodemailer = require('nodemailer');
   
   const transporter = nodemailer.createTransport({
     host: config.SMTP_HOST,
     port: config.SMTP_PORT,
     secure: false,  // true for 465, false for other ports
     auth: {
       user: config.SMTP_USER,
       pass: config.SMTP_PASSWORD
     }
   });

sendMagicLink(to, magicLink)

javascript   async sendMagicLink(to, magicLink) {
     const html = this.getMagicLinkTemplate(magicLink);
     
     await transporter.sendMail({
       from: config.EMAIL_FROM,
       to,
       subject: 'Your Magic Link to Sign In',
       html
     });
     
     logger.info(`Magic link sent to ${to}`);
   }

getMagicLinkTemplate(magicLink)

javascript   getMagicLinkTemplate(magicLink) {
     return `
       <!DOCTYPE html>
       <html>
       <head>
         <meta charset="UTF-8">
         <style>
           body { font-family: Arial, sans-serif; }
           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
           .button {
             display: inline-block;
             padding: 12px 24px;
             background-color: #007bff;
             color: white;
             text-decoration: none;
             border-radius: 4px;
             margin: 20px 0;
           }
         </style>
       </head>
       <body>
         <div class="container">
           <h2>Sign In to Your Account</h2>
           <p>Click the button below to sign in. This link will expire in 15 minutes.</p>
           <a href="${magicLink}" class="button">Sign In</a>
           <p>Or copy and paste this link into your browser:</p>
           <p><a href="${magicLink}">${magicLink}</a></p>
           <p>If you didn't request this, please ignore this email.</p>
         </div>
       </body>
       </html>
     `;
   }
7.4 Controller 추가 엔드포인트
파일 위치: src/modules/auth/social/controllers/socialAuthController.js (업데이트)
1. POST /auth/apple/callback
javascriptasync appleCallback(req, res, next) {
  try {
    const { code, state, user } = req.body;
    
    if (!code || !state) {
      throw new AppError('Missing code or state', 400);
    }
    
    // user는 첫 로그인 시만 제공됨 (JSON 문자열)
    const userData = user ? JSON.parse(user) : null;
    
    const result = await socialAuthService.handleAppleCallback(
      code,
      state,
      userData
    );
    
    // 토큰을 포함하여 프론트엔드로 리다이렉트
    const redirectUrl = new URL(config.FRONTEND_URL);
    redirectUrl.searchParams.append('accessToken', result.tokens.accessToken);
    redirectUrl.searchParams.append('refreshToken', result.tokens.refreshToken);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    const errorUrl = new URL(`${config.FRONTEND_URL}/auth/error`);
    errorUrl.searchParams.append('message', error.message);
    res.redirect(errorUrl.toString());
  }
}
2. POST /auth/magic-link/send
javascriptasync sendMagicLink(req, res, next) {
  try {
    const { email } = req.body;
    
    // 이메일 검증
    const schema = Joi.object({
      email: Joi.string().email().required()
    });
    
    await schema.validateAsync({ email });
    
    // Magic Link 발송
    const emailProvider = new EmailProvider(config);
    await emailProvider.sendMagicLink(email);
    
    successResponse(
      res,
      null,
      'Magic link sent to your email. Please check your inbox.'
    );
  } catch (error) {
    next(error);
  }
}
3. GET /auth/magic-link/verify
javascriptasync verifyMagicLink(req, res, next) {
  try {
    const { token } = req.query;
    
    if (!token) {
      throw new AppError('Token is required', 400);
    }
    
    // Magic Link 검증 및 로그인
    const emailProvider = new EmailProvider(config);
    const result = await emailProvider.verifyAndLogin(token);
    
    // 토큰을 포함하여 프론트엔드로 리다이렉트
    const redirectUrl = new URL(config.FRONTEND_URL);
    redirectUrl.searchParams.append('accessToken', result.tokens.accessToken);
    redirectUrl.searchParams.append('refreshToken', result.tokens.refreshToken);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    const errorUrl = new URL(`${config.FRONTEND_URL}/auth/error`);
    errorUrl.searchParams.append('message', error.message);
    res.redirect(errorUrl.toString());
  }
}
7.5 Social Auth Service 업데이트
파일 위치: src/modules/auth/social/services/socialAuthService.js (업데이트)
Apple Callback 처리 추가:
javascriptasync handleAppleCallback(code, state, userData) {
  // State 검증
  await this.verifyState(state);
  
  // Apple Provider
  const appleProvider = this.getProvider('apple');
  
  // Access Token 및 ID Token 획득
  const { idToken } = await appleProvider.getAccessToken(code);
  
  // 사용자 정보 추출
  const rawUserInfo = await appleProvider.getUserInfo(idToken);
  const userInfo = appleProvider.normalizeUserInfo(rawUserInfo, userData);
  
  // 사용자 조회 또는 생성
  const user = await this.findOrCreateUser(userInfo);
  
  // JWT 토큰 생성
  const tokens = await authService.generateTokenPair(
    user.id,
    user.email,
    user.role
  );
  
  return { user, tokens };
}
Provider 목록 확장:
javascriptgetProvider(providerName) {
  switch (providerName) {
    case 'google':
      return new GoogleProvider(config);
    case 'kakao':
      return new KakaoProvider(config);
    case 'apple':
      return new AppleProvider(config);
    case 'email':
      return new EmailProvider(config);
    default:
      throw new AppError(`Unknown provider: ${providerName}`, 400);
  }
}
📦 패키지 의존성
json"dependencies": {
  "nodemailer": "^6.9.7",
  "jsonwebtoken": "^9.0.2"  # (이미 추가됨)
}
📝 사용 예제
파일 위치: examples/day7-complete-social-auth.js
javascriptconst express = require('express');
const { socialAuthController, authenticate } = require('../src/modules/auth');

const app = express();
app.use(express.json());

// Google & Kakao (GET)
app.get('/auth/:provider', socialAuthController.login);
app.get('/auth/:provider/callback', socialAuthController.callback);

// Apple (POST - form_post)
app.post('/auth/apple/callback', socialAuthController.appleCallback);

// Magic Link
app.post('/auth/magic-link/send', socialAuthController.sendMagicLink);
app.get('/auth/magic-link/verify', socialAuthController.verifyMagicLink);

// 소셜 계정 관리 (인증 필요)
app.post('/auth/link/:provider', authenticate, socialAuthController.link);
app.delete('/auth/unlink/:provider', authenticate, socialAuthController.unlink);

app.listen(3000);

// 사용 흐름 (Magic Link):
// 1. POST /auth/magic-link/send { "email": "user@example.com" }
// 2. 사용자 이메일로 Magic Link 발송
// 3. 사용자가 링크 클릭 (GET /auth/magic-link/verify?token=...)
// 4. 서버가 토큰 검증 후 로그인 처리
// 5. 프론트엔드로 리다이렉트 (토큰 포함)
✅ 완료 기준

 Apple Sign In 정상 동작 (POST callback)
 첫 로그인 시 사용자 이름 저장
 Magic Link 이메일 발송 성공
 Magic Link 클릭 시 로그인 처리
 Magic Link 만료 처리 (15분)
 이메일 템플릿 정상 렌더링
 4개 소셜 로그인 모두 통합 테스트 완료