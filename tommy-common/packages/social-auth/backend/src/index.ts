import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createOAuthConfig, OAuthConfig } from './config/oauth.config';
import { createJwtUtils } from './config/jwt.utils';
import { createAuthRoutes } from './routes/auth.routes';
import { createAuthMiddleware } from './middleware/authenticate';

// Re-export types
export type { OAuthConfig, OAuthProviderConfig, JwtConfig, EmailOTPConfig, EmailServiceConfig } from './config/oauth.config';
export type { JwtPayload } from './config/jwt.utils';
export type { EmailOptions } from './services/email.service';
export type { OTPRecord } from './services/otp.service';

export interface OAuthServerConfig extends OAuthConfig {
  port?: number;
  frontendUrl?: string;
  corsOrigin?: string | string[];
}

/**
 * Express 앱에 OAuth 인증 기능을 추가합니다.
 * @param app - Express 앱 인스턴스
 * @param config - 설정 옵션 (필수)
 */
export function setupOAuth(app: Express, config: OAuthServerConfig) {
  const frontendUrl = config.frontendUrl || 'http://localhost:5173';

  // OAuth 설정 생성
  const oauthConfig = createOAuthConfig(config);

  // JWT utils 생성
  const jwtUtils = createJwtUtils(oauthConfig.jwt.secret, oauthConfig.jwt.expiresIn);

  // Middleware 생성
  const authenticate = createAuthMiddleware(jwtUtils.verifyToken);

  // Routes 생성
  const authRoutes = createAuthRoutes(oauthConfig, jwtUtils.generateToken, authenticate, frontendUrl);

  // CORS 설정
  app.use(cors({
    origin: config?.corsOrigin || frontendUrl,
    credentials: true
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // OAuth 라우트 등록
  app.use('/api/auth', authRoutes);

  // 헬스체크
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'OAuth Server is running' });
  });

  return { oauthConfig, jwtUtils, authenticate };
}

/**
 * 독립 실행형 OAuth 서버를 시작합니다.
 * @param config - 서버 설정 (필수)
 */
export function startOAuthServer(config: OAuthServerConfig) {
  const app = express();
  const PORT = config.port || 3000;

  const { oauthConfig } = setupOAuth(app, config);

  // 404 핸들러
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // 에러 핸들러
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // 서버 시작
  app.listen(PORT, () => {
    console.log(`\n🚀 OAuth Server running on port ${PORT}`);
    console.log(`📍 Frontend URL: ${config.frontendUrl || 'http://localhost:5173'}`);
    console.log(`\n🔐 OAuth Status:`);
    console.log(`   Google: ${oauthConfig.google ? '✅' : '❌'}`);
    console.log(`   Kakao: ${oauthConfig.kakao ? '✅' : '❌'}`);
    console.log(`   Apple: ${oauthConfig.apple ? '✅' : '❌'}`);
    console.log(`   Email OTP: ${oauthConfig.email ? '✅' : '❌'}`);
    console.log(`\n✨ Ready to handle OAuth requests!\n`);
  });

  return app;
}
