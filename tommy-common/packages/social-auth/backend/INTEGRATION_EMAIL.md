# Email OTP 인증 가이드

`@miracle380301/email-service` 패키지를 사용하여 social-auth에 Email OTP 인증을 구현하는 방법입니다.

## 1. 패키지 설치

```bash
npm install @miracle380301/email-service
```

## 2. 지원하는 Email Provider

- **Resend** - 무료 100/day, 3,000/month
- **Nodemailer (Gmail SMTP)** - 무료 500/day, 15,000/month
- **Custom** - 사용자 정의 함수

## 3. 환경변수 설정 (.env)

```bash
# Email OTP Configuration
EMAIL_OTP_ENABLED=true
EMAIL_OTP_LENGTH=6
EMAIL_OTP_EXPIRY=300

# Email Provider (resend / nodemailer / custom)
EMAIL_PROVIDER=nodemailer
EMAIL_DEFAULT_FROM=noreply@yourapp.com

# Option 1: Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Option 2: Nodemailer (Gmail SMTP) Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

## 4. server.ts 설정

환경변수에서 자동으로 Email 설정을 읽어옵니다:

```typescript
import dotenv from 'dotenv';
import { startOAuthServer } from './index';

dotenv.config();

startOAuthServer({
  port: 3000,
  frontendUrl: 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET!
  },
  email: process.env.EMAIL_OTP_ENABLED === 'true' ? {
    enabled: true,
    otpLength: Number(process.env.EMAIL_OTP_LENGTH) || 6,
    otpExpiry: Number(process.env.EMAIL_OTP_EXPIRY) || 300,
    emailService: {
      provider: process.env.EMAIL_PROVIDER as any,
      config: {
        resendApiKey: process.env.RESEND_API_KEY,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: Number(process.env.SMTP_PORT) || 587,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS
      },
      defaultFrom: process.env.EMAIL_DEFAULT_FROM!
    }
  } : undefined
});
```

## 5. API 엔드포인트

Email OTP 인증은 다음 API를 사용합니다:

### POST /api/auth/email/send-otp
OTP 코드를 이메일로 전송

```typescript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

### POST /api/auth/email/verify-otp
OTP 코드 검증 및 로그인

```typescript
// Request
{
  "email": "user@example.com",
  "code": "123456"
}

// Response
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user@example.com",
    "email": "user@example.com",
    "name": "user",
    "provider": "email"
  }
}
```

### POST /api/auth/email/resend-otp
OTP 코드 재전송

```typescript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "message": "OTP resent successfully",
  "expiresIn": 300
}
```

## 6. 테스트

```bash
# Backend 실행
npm run dev

# 다른 터미널에서 테스트
curl -X POST http://localhost:3000/api/auth/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 7. 장점

- ✅ **간편한 설정**: 환경변수만 설정하면 바로 사용
- ✅ **Provider 독립성**: Resend, Nodemailer 쉽게 전환
- ✅ **Rate Limiting**: 무료 한도 자동 체크
- ✅ **타입 안정성**: TypeScript 완벽 지원
- ✅ **OTP 템플릿**: 이메일 디자인 자동 생성
