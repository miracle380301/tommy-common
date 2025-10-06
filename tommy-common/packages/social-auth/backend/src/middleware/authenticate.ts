import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../config/jwt.utils';

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function createAuthMiddleware(verifyToken: (token: string) => JwtPayload | null) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (!decoded) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
}
