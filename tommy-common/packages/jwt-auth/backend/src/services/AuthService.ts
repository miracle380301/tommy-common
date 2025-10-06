import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { User, RefreshToken, AuthResponse } from '../types';
import {
  hashPassword,
  comparePassword,
  generateToken,
  hashToken,
  validatePasswordStrength,
} from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiration,
} from '../utils/jwt';
import { transformUser } from '../models';

export class AuthService {
  private db = getDatabase();

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    // Check if email exists
    const existingUser = this.db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(data.email) as User | undefined;

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message || 'Weak password');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // 🔍 [DEV] Password Logging
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 REGISTER - Password Info');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('원본 비밀번호:', data.password);
    console.log('해시 비밀번호:', hashedPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO users (id, email, password, name, role, isEmailVerified, loginAttempts, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(userId, data.email, hashedPassword, data.name, 'user', 0, 0, now, now);

    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;

    // Generate tokens
    const jwtPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // 🔍 [DEV] JWT Token Logging
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 REGISTER - JWT Tokens Generated');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('사용자:', data.email);
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Access Token 유효기간: 15분');
    console.log('Refresh Token 유효기간: 7일');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Store refresh token
    await this.storeRefreshToken(user.id!, refreshToken);

    const { password: _, ...userWithoutPassword } = transformUser(user)!;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string, ipAddress?: string): Promise<AuthResponse> {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil) {
      const lockedUntil = new Date(user.lockedUntil);
      if (lockedUntil > new Date()) {
        const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
        throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
      } else {
        // Unlock account
        this.db
          .prepare('UPDATE users SET loginAttempts = 0, lockedUntil = NULL WHERE id = ?')
          .run(user.id);
        user.loginAttempts = 0;
        user.lockedUntil = null;
      }
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    // 🔍 [DEV] Password Verification Logging
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 LOGIN - Password Verification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('입력 비밀번호:', password);
    console.log('DB 해시 비밀번호:', user.password);
    console.log('검증 결과:', isValidPassword ? '✅ 일치' : '❌ 불일치');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!isValidPassword) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const lockoutMinutes = parseInt(process.env.LOGIN_LOCKOUT_TIME || '15');

      if (attempts >= maxAttempts) {
        const lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString();
        this.db
          .prepare('UPDATE users SET loginAttempts = ?, lockedUntil = ? WHERE id = ?')
          .run(attempts, lockedUntil, user.id);
        throw new Error(`Too many failed attempts. Account locked for ${lockoutMinutes} minutes`);
      } else {
        this.db.prepare('UPDATE users SET loginAttempts = ? WHERE id = ?').run(attempts, user.id);
        throw new Error('Invalid credentials');
      }
    }

    // Reset login attempts and update last login
    const now = new Date().toISOString();
    this.db
      .prepare('UPDATE users SET loginAttempts = 0, lockedUntil = NULL, lastLoginAt = ? WHERE id = ?')
      .run(now, user.id);

    // Generate tokens
    const jwtPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // 🔍 [DEV] JWT Token Logging
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 LOGIN - JWT Tokens Generated');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('사용자:', email);
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Access Token 유효기간: 15분');
    console.log('Refresh Token 유효기간: 7일');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Store refresh token
    await this.storeRefreshToken(user.id!, refreshToken, ipAddress);

    const { password: _, ...userWithoutPassword } = transformUser(user)!;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error('Invalid refresh token');
    }

    // Check if token exists and not revoked
    const hashedToken = hashToken(refreshToken);
    const storedToken = this.db
      .prepare('SELECT * FROM refresh_tokens WHERE token = ? AND isRevoked = 0')
      .get(hashedToken) as RefreshToken | undefined;

    if (!storedToken) {
      throw new Error('Refresh token not found or revoked');
    }

    // Check expiration
    if (new Date(storedToken.expiresAt) < new Date()) {
      throw new Error('Refresh token expired');
    }

    // Revoke old refresh token
    this.db.prepare('UPDATE refresh_tokens SET isRevoked = 1 WHERE id = ?').run(storedToken.id);

    // Generate new tokens (Refresh Token Rotation)
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // 🔍 [DEV] Token Refresh Logging
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 REFRESH - Token Rotation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('사용자:', payload.email);
    console.log('이전 Refresh Token:', refreshToken);
    console.log('새 Access Token:', newAccessToken);
    console.log('새 Refresh Token:', newRefreshToken);
    console.log('⚠️ 이전 Refresh Token 무효화됨');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Store new refresh token
    await this.storeRefreshToken(payload.userId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    const hashedToken = hashToken(refreshToken);
    this.db.prepare('UPDATE refresh_tokens SET isRevoked = 1 WHERE token = ?').run(hashedToken);
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(userId: string, token: string, ipAddress?: string): Promise<void> {
    const tokenId = uuidv4();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + getRefreshTokenExpiration()).toISOString();
    const createdAt = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO refresh_tokens (id, userId, token, expiresAt, isRevoked, ipAddress, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(tokenId, userId, hashedToken, expiresAt, 0, ipAddress || null, createdAt);
  }
}
