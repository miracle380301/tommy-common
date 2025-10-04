const { AppError } = require('./AppError');
const { logger } = require('../logger');
const { config } = require('../../config');

/**
 * 404 Not Found 핸들러
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Cannot find ${req.originalUrl}`, 404);
  next(error);
};

/**
 * 전역 에러 핸들러 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // 기본 상태 코드 설정
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // 에러 로깅
  if (error.statusCode >= 500 || !err.isOperational) {
    logger.error({
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      statusCode: error.statusCode,
    });
  } else {
    logger.warn({
      message: error.message,
      url: req.originalUrl,
      method: req.method,
      statusCode: error.statusCode,
    });
  }

  // MongoDB 에러 처리
  if (err.name === 'CastError') {
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.statusCode = 400;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate field value: ${field}`;
    error.statusCode = 409;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    error.message = 'Validation Error';
    error.statusCode = 422;
    error.errors = errors;
  }

  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // 응답 구성
  const response = {
    success: false,
    status: error.status,
    message: error.message || 'Something went wrong',
  };

  // Development 모드에서는 스택 트레이스 포함
  if (config.isDevelopment) {
    response.stack = error.stack;
    response.error = err;
  }

  // Validation 에러의 경우 세부 에러 포함
  if (error.errors) {
    response.errors = error.errors;
  }

  // Production 모드에서 프로그래밍 에러는 일반 메시지로 대체
  if (config.isProduction && !err.isOperational) {
    response.message = 'Something went wrong';
  }

  res.status(error.statusCode).json(response);
};

/**
 * Async 핸들러 래퍼 (try-catch 자동화)
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 프로세스 레벨 에러 핸들러
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
};

const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
      message: err.message,
      stack: err.stack,
    });
    server.close(() => {
      process.exit(1);
    });
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  handleUncaughtException,
  handleUnhandledRejection,
};
