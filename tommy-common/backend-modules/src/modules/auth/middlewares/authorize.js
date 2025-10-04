const { UnauthorizedError, ForbiddenError, NotFoundError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

/**
 * 권한 미들웨어
 * 특정 역할이나 권한을 가진 사용자만 접근 허용
 */

/**
 * 역할 기반 접근 제어
 * @param {...string} roles - 허용할 역할 목록 (예: 'admin', 'user')
 * @returns {Function} Express 미들웨어
 * @example
 * app.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      // authenticate 미들웨어가 먼저 실행되어야 함
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // 역할 확인
      if (!roles.includes(req.user.role)) {
        logger.warn(
          `User ${req.user.userId} attempted to access restricted resource (required: ${roles.join(', ')}, has: ${req.user.role})`
        );
        throw new ForbiddenError('Insufficient permissions');
      }

      logger.debug(`User ${req.user.userId} authorized with role: ${req.user.role}`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 권한 기반 접근 제어
 * User 모델에 permissions 배열이 있어야 함
 * @param {...string} permissions - 필요한 권한 목록 (예: 'post:create', 'post:edit')
 * @returns {Function} Express 미들웨어
 * @example
 * app.post('/posts', authenticate, requirePermission('post:create'), createPost);
 */
const requirePermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      // authenticate 미들웨어가 먼저 실행되어야 함
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // DB에서 사용자 권한 조회
      const authService = require('../services/authService');
      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // 권한 배열이 없으면 접근 거부
      if (!user.permissions || !Array.isArray(user.permissions)) {
        logger.warn(`User ${req.user.userId} has no permissions defined`);
        throw new ForbiddenError('Insufficient permissions');
      }

      // 필요한 권한이 모두 있는지 확인
      const hasPermission = permissions.every((p) => user.permissions.includes(p));

      if (!hasPermission) {
        logger.warn(
          `User ${req.user.userId} attempted to access resource without required permissions (required: ${permissions.join(', ')})`
        );
        throw new ForbiddenError('Insufficient permissions');
      }

      logger.debug(`User ${req.user.userId} authorized with permissions: ${permissions.join(', ')}`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 리소스 소유자 확인
 * 리소스의 소유자이거나 관리자만 접근 허용
 * @param {Function} resourceGetter - 리소스를 조회하는 함수 (req를 인자로 받음)
 * @returns {Function} Express 미들웨어
 * @example
 * app.put('/posts/:id',
 *   authenticate,
 *   resourceOwner(async (req) => {
 *     return await postRepo.findById(req.params.id);
 *   }),
 *   updatePost
 * );
 */
const resourceOwner = (resourceGetter) => {
  return async (req, res, next) => {
    try {
      // authenticate 미들웨어가 먼저 실행되어야 함
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // 리소스 조회
      const resource = await resourceGetter(req);

      if (!resource) {
        throw new NotFoundError('Resource not found');
      }

      // 소유자 확인 (MongoDB의 경우 ObjectId.toString() 필요)
      const resourceUserId = resource.userId
        ? resource.userId.toString()
        : resource.user_id
          ? resource.user_id.toString()
          : null;

      if (!resourceUserId) {
        logger.error('Resource does not have userId or user_id field');
        throw new ForbiddenError('Cannot determine resource ownership');
      }

      const isOwner = resourceUserId === req.user.userId.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        logger.warn(
          `User ${req.user.userId} attempted to access resource owned by ${resourceUserId}`
        );
        throw new ForbiddenError('You can only modify your own resources');
      }

      // req에 리소스 추가 (중복 조회 방지)
      req.resource = resource;

      logger.debug(`User ${req.user.userId} authorized as ${isAdmin ? 'admin' : 'owner'}`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireRole,
  requirePermission,
  resourceOwner,
};
