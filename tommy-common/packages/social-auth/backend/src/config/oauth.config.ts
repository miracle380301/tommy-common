export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn?: string | number;
}

export interface EmailServiceConfig {
  provider: 'resend' | 'nodemailer' | 'custom';
  config: {
    // Resend
    resendApiKey?: string;
    // Nodemailer (SMTP)
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    // Custom
    sendFunction?: (options: { to: string; subject: string; html: string; text?: string }) => Promise<void>;
  };
  defaultFrom: string;
}

export interface EmailOTPConfig {
  enabled: boolean;
  otpLength?: number;
  otpExpiry?: number;
  emailService: EmailServiceConfig;
}

export interface OAuthConfig {
  google?: OAuthProviderConfig;
  kakao?: OAuthProviderConfig;
  apple?: OAuthProviderConfig;
  email?: EmailOTPConfig;
  jwt: JwtConfig;
}

export function createOAuthConfig(config: OAuthConfig) {
  const defaultPort = 3000;

  return {
    google: config.google ? {
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      redirectUri: config.google.redirectUri || `http://localhost:${defaultPort}/api/auth/google/callback`,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: 'openid profile email'
    } : null,
    kakao: config.kakao ? {
      clientId: config.kakao.clientId,
      clientSecret: config.kakao.clientSecret,
      redirectUri: config.kakao.redirectUri || `http://localhost:${defaultPort}/api/auth/kakao/callback`,
      authUrl: 'https://kauth.kakao.com/oauth/authorize',
      tokenUrl: 'https://kauth.kakao.com/oauth/token',
      userInfoUrl: 'https://kapi.kakao.com/v2/user/me'
    } : null,
    apple: config.apple ? {
      clientId: config.apple.clientId,
      clientSecret: config.apple.clientSecret,
      redirectUri: config.apple.redirectUri || `http://localhost:${defaultPort}/api/auth/apple/callback`,
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      userInfoUrl: 'https://appleid.apple.com/auth/userinfo'
    } : null,
    email: config.email && config.email.enabled ? {
      enabled: true,
      otpLength: config.email.otpLength || 6,
      otpExpiry: config.email.otpExpiry || 300,
      emailService: config.email.emailService
    } : null,
    jwt: {
      secret: config.jwt.secret,
      expiresIn: config.jwt.expiresIn || '7d'
    }
  };
}
