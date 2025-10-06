import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate Access Token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate Refresh Token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getRefreshTokenExpiration(): number {
  const expiresIn = JWT_REFRESH_EXPIRES_IN;
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // default 7 days
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
