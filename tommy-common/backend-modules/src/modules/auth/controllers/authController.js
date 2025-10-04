const Joi = require('joi');
const authService = require('../services/authService');
const { successResponse, createdResponse } = require('../../../core/response');
const { BadRequestError } = require('../../../core/errors');
const { asyncHandler } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

/**
 * Auth Controller
 * HTTP 요청/응답 처리
 */

/**
 * Validation Schemas (Joi)
 */
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

/**
 * 입력 검증 헬퍼
 * @param {Object} schema - Joi 스키마
 * @param {Object} data - 검증할 데이터
 * @throws {BadRequestError}
 */
const validateInput = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    throw new BadRequestError(`Validation error: ${errors.join(', ')}`);
  }

  return value;
};

/**
 * POST /auth/register
 * 회원가입
 */
const register = asyncHandler(async (req, res, next) => {
  // 입력 검증
  const validatedData = validateInput(registerSchema, req.body);

  // 회원가입 처리
  const user = await authService.register(validatedData);

  logger.info(`New user registered: ${user.email}`);

  return createdResponse(res, user, 'User registered successfully');
});

/**
 * POST /auth/login
 * 로그인
 */
const login = asyncHandler(async (req, res, next) => {
  // 입력 검증
  const validatedData = validateInput(loginSchema, req.body);

  // 메타 정보 수집
  const meta = {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };

  // 로그인 처리
  const result = await authService.login(
    validatedData.email,
    validatedData.password,
    meta
  );

  logger.info(`User logged in: ${validatedData.email}`);

  return successResponse(res, result, 'Login successful');
});

/**
 * POST /auth/logout
 * 로그아웃
 */
const logout = asyncHandler(async (req, res, next) => {
  // 입력 검증
  const validatedData = validateInput(logoutSchema, req.body);

  // 로그아웃 처리
  await authService.logout(validatedData.refreshToken);

  logger.info('User logged out');

  return successResponse(res, null, 'Logout successful');
});

/**
 * POST /auth/refresh
 * Access Token 갱신
 */
const refresh = asyncHandler(async (req, res, next) => {
  // 입력 검증
  const validatedData = validateInput(refreshSchema, req.body);

  // Token 갱신 처리
  const tokens = await authService.refreshAccessToken(validatedData.refreshToken);

  logger.info('Access token refreshed');

  return successResponse(res, tokens, 'Token refreshed');
});

/**
 * GET /auth/me
 * 현재 로그인한 사용자 정보 조회
 * @requires authenticate middleware
 */
const getMe = asyncHandler(async (req, res, next) => {
  // req.user는 authenticate 미들웨어에서 설정됨
  const user = await authService.getUserById(req.user.userId);

  return successResponse(res, user);
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  getMe,
};
