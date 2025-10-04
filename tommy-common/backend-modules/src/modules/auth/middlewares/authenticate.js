const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

/**
 * 인증 미들웨어
 * JWT 토큰을 검증하고 사용자 정보를 req에 추가
 */

/**
 * 필수 인증 미들웨어
 * Authorization 헤더에서 JWT 토큰을 검증하고 req.user에 사용자 정보 추가
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Authorization 헤더 확인
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    // 2. 토큰 추출
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // 3. 토큰 검증
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid token');
    }

    // 4. req.user에 정보 추가
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug(`User authenticated: ${decoded.userId}`);
    next();
  } catch (error) {
    // JWT 에러 처리
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }

    // 기타 에러
    next(error);
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 계속 진행
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 토큰이 없으면 그냥 계속 진행
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    // 토큰 검증 시도
    try {
      const decoded = verifyAccessToken(token);

      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
        logger.debug(`Optional auth - User authenticated: ${decoded.userId}`);
      }
    } catch (error) {
      // 토큰이 유효하지 않아도 에러를 던지지 않고 계속 진행
      logger.debug(`Optional auth - Invalid token, continuing without auth`);
    }

    next();
  } catch (error) {
    // 예외 발생 시에도 계속 진행
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
