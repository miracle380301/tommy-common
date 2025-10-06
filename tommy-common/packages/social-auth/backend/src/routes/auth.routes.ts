import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import { JwtPayload } from '../config/jwt.utils';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';

export function createAuthRoutes(
  oauthConfig: any,
  generateToken: (payload: JwtPayload) => string,
  authenticate: any,
  frontendUrl: string = 'http://localhost:5173'
): Router {
  const router = express.Router();

  // 메모리 세션 저장소 (개발용 - 프로덕션에서는 Redis 등 사용)
  const sessions = new Map<string, JwtPayload>();

  // ==================== Google OAuth ====================

  if (oauthConfig.google) {
    // Google 로그인 시작
    router.get('/google', (req: Request, res: Response) => {
      const { clientId, redirectUri, authUrl, scope } = oauthConfig.google;

      const authorizationUrl = `${authUrl}?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}`;

      res.redirect(authorizationUrl);
    });

    // Google 콜백
    router.get('/google/callback', async (req: Request, res: Response) => {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      try {
        const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } = oauthConfig.google;

    // 1. 액세스 토큰 교환
    const tokenResponse = await axios.post(tokenUrl, {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // 2. 사용자 정보 가져오기
    const userResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, email, name, picture } = userResponse.data;

    // 3. JWT 생성
    const payload: JwtPayload = {
      id,
      email,
      name,
      picture,
      provider: 'google'
    };

        const token = generateToken(payload);
        sessions.set(id, payload);

        // 4. 프론트엔드로 리다이렉트 (토큰 포함)
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
      }
    });
  }

  // ==================== Kakao OAuth ====================

  if (oauthConfig.kakao) {
    // Kakao 로그인 시작
    router.get('/kakao', (req: Request, res: Response) => {
      const { clientId, redirectUri, authUrl } = oauthConfig.kakao;

      const authorizationUrl = `${authUrl}?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code`;

      res.redirect(authorizationUrl);
    });

    // Kakao 콜백
    router.get('/kakao/callback', async (req: Request, res: Response) => {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      try {
        const { clientId, clientSecret, redirectUri, tokenUrl, userInfoUrl } = oauthConfig.kakao;

    // 1. 액세스 토큰 교환
    const tokenResponse = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code as string
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token } = tokenResponse.data;

    // 2. 사용자 정보 가져오기
    const userResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, kakao_account } = userResponse.data;
    const email = kakao_account?.email || '';
    const name = kakao_account?.profile?.nickname || 'Kakao User';
    const picture = kakao_account?.profile?.profile_image_url;

    // 3. JWT 생성
    const payload: JwtPayload = {
      id: String(id),
      email,
      name,
      picture,
      provider: 'kakao'
    };

        const token = generateToken(payload);
        sessions.set(String(id), payload);

        // 4. 프론트엔드로 리다이렉트 (토큰 포함)
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Kakao OAuth error:', error);
        res.status(500).json({ error: 'Kakao authentication failed' });
      }
    });
  }

// ==================== 사용자 정보 조회 ====================

// 내 정보 조회 (JWT 필요)
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// ==================== 로그아웃 ====================

  router.post('/logout', authenticate, (req: Request, res: Response) => {
    if (req.user) {
      sessions.delete(req.user.id);
    }
    res.json({ message: 'Logged out successfully' });
  });

  // ==================== Email OTP ====================

  if (oauthConfig.email && oauthConfig.email.enabled) {
    const otpService = new OTPService(
      oauthConfig.email.otpLength,
      oauthConfig.email.otpExpiry
    );
    const emailService = new EmailService(oauthConfig.email.emailService);

    // Rate limiting을 위한 메모리 저장소 (개발용)
    const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

    const checkRateLimit = (email: string): boolean => {
      const now = Date.now();
      const record = rateLimitStore.get(email);

      if (!record || now > record.resetAt) {
        rateLimitStore.set(email, { count: 1, resetAt: now + 60000 }); // 1분
        return true;
      }

      if (record.count >= 3) {
        return false; // 1분에 3번까지만 허용
      }

      record.count++;
      return true;
    };

    // OTP 전송
    router.post('/email/send-otp', async (req: Request, res: Response) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }

        // Rate limiting 체크
        if (!checkRateLimit(email)) {
          return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }

        // OTP 생성
        const code = otpService.generateOTP();

        // OTP 저장
        otpService.saveOTP(email, code);

        // 이메일 전송
        await emailService.sendOTPEmail(email, code);

        res.json({
          message: 'OTP sent successfully',
          expiresIn: oauthConfig.email.otpExpiry
        });
      } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
      }
    });

    // OTP 검증 및 로그인
    router.post('/email/verify-otp', async (req: Request, res: Response) => {
      try {
        const { email, code } = req.body;

        if (!email || !code) {
          return res.status(400).json({ error: 'Email and code are required' });
        }

        // OTP 검증
        const result = otpService.verifyOTP(email, code);

        if (!result.valid) {
          return res.status(401).json({ error: result.error });
        }

        // JWT 생성
        const payload: JwtPayload = {
          id: email,
          email,
          name: email.split('@')[0],
          provider: 'email'
        };

        const token = generateToken(payload);
        sessions.set(email, payload);

        res.json({
          message: 'Login successful',
          token,
          user: payload
        });
      } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
      }
    });

    // OTP 재전송
    router.post('/email/resend-otp', async (req: Request, res: Response) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        // Rate limiting 체크
        if (!checkRateLimit(email)) {
          return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }

        // 기존 OTP 삭제
        otpService.deleteOTP(email);

        // 새 OTP 생성
        const code = otpService.generateOTP();

        // OTP 저장
        otpService.saveOTP(email, code);

        // 이메일 전송
        await emailService.sendOTPEmail(email, code);

        res.json({
          message: 'OTP resent successfully',
          expiresIn: oauthConfig.email.otpExpiry
        });
      } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
      }
    });
  }

  return router;
}
