export interface User {
  id?: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | string | null;
  lastLoginAt?: Date | string | null;
  loginAttempts: number;
  lockedUntil?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface RefreshToken {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date | string;
  isRevoked: boolean;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt?: Date | string;
}

export interface EmailVerificationToken {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date | string;
  createdAt?: Date | string;
}

export interface PasswordResetToken {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date | string;
  isUsed: boolean;
  createdAt?: Date | string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}
