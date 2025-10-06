import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { getDatabase } from '../config/database';
import { User } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password'>;
    }
  }
}

/**
 * Authentication middleware - requires valid access token
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Get user from database
    const db = getDatabase();
    const user = db
      .prepare('SELECT id, email, name, role, isEmailVerified, lastLoginAt, createdAt FROM users WHERE id = ?')
      .get(payload.userId) as User | undefined;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid token',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = undefined;
      return next();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const db = getDatabase();
    const user = db
      .prepare('SELECT id, email, name, role, isEmailVerified, lastLoginAt, createdAt FROM users WHERE id = ?')
      .get(payload.userId) as User | undefined;

    req.user = user;
    next();
  } catch (error) {
    req.user = undefined;
    next();
  }
}

/**
 * Role-based access control
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}
