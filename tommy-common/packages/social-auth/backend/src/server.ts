import dotenv from 'dotenv';
import path from 'path';
import { startOAuthServer } from './index';

// 환경변수 로드 (명시적 경로 지정)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 디버깅: 환경변수 직접 확인
console.log('🔍 Environment Variables Check:');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded ✅' : 'NOT LOADED ❌');
console.log('   KAKAO_CLIENT_ID:', process.env.KAKAO_CLIENT_ID ? 'Loaded ✅' : 'NOT LOADED ❌');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded ✅' : 'NOT LOADED ❌');
console.log('   EMAIL_OTP_ENABLED:', process.env.EMAIL_OTP_ENABLED ? 'Loaded ✅' : 'NOT LOADED ❌');
console.log('');

// OAuth 서버 시작 (환경변수를 읽어서 설정에 전달)
startOAuthServer({
  google: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  } : undefined,
  kakao: process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET ? {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    redirectUri: process.env.KAKAO_REDIRECT_URI
  } : undefined,
  apple: process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? {
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    redirectUri: process.env.APPLE_REDIRECT_URI
  } : undefined,
  email: process.env.EMAIL_OTP_ENABLED === 'true' ? {
    enabled: true,
    otpLength: process.env.EMAIL_OTP_LENGTH ? Number(process.env.EMAIL_OTP_LENGTH) : 6,
    otpExpiry: process.env.EMAIL_OTP_EXPIRY ? Number(process.env.EMAIL_OTP_EXPIRY) : 300,
    emailService: {
      provider: (process.env.EMAIL_PROVIDER as any) || 'nodemailer',
      config: {
        resendApiKey: process.env.RESEND_API_KEY,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS
      },
      defaultFrom: process.env.EMAIL_DEFAULT_FROM || 'noreply@yourapp.com'
    }
  } : undefined,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  frontendUrl: process.env.FRONTEND_URL
});
