import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'kakao' | 'apple' | 'email';
}

export function createJwtUtils(secret: string, expiresIn: string | number = '7d') {
  return {
    generateToken: (payload: JwtPayload): string => {
      return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
    },

    verifyToken: (token: string): JwtPayload | null => {
      try {
        return jwt.verify(token, secret) as JwtPayload;
      } catch (error) {
        return null;
      }
    }
  };
}
