// Config
const { createApp } = require('./config/express');
const { config, getEnv, getEnvAsNumber, getEnvAsBoolean, validateRequiredEnv } = require('./config');
const { setupSwagger } = require('./config/swagger');

// Logger
const { logger, httpLogger, logError, logRequest } = require('./core/logger');

// Errors
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
  handleUncaughtException,
  handleUnhandledRejection,
} = require('./core/errors');

// Response
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  noContentResponse,
} = require('./core/response');

// Database
const {
  connect,
  disconnect,
  createRepository,
  healthCheck,
  sync,
  getCurrentDbType,
  connection,
  MongooseAdapter,
  SequelizeAdapter,
  ConnectionManager,
  QueryBuilder,
} = require('./modules/database');

// Auth
const {
  authController,
  socialController,
  authService,
  kakaoService,
  appleService,
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  resourceOwner,
  jwtUtils,
  passwordUtils,
  tokenUtils,
  UserMongoose,
  RefreshTokenMongoose,
} = require('./modules/auth');

// Upload
const {
  multerConfig,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
  uploadSingle,
  uploadMultiple,
  imageService,
  uploadController,
} = require('./modules/upload');

// Queue
const {
  getRedisConfig,
  createRedisClient,
  testRedisConnection,
  emailQueue,
  imageQueue,
  queueService,
  queueController,
} = require('./modules/queue');

module.exports = {
  // Config
  createApp,
  setupSwagger,
  config,
  getEnv,
  getEnvAsNumber,
  getEnvAsBoolean,
  validateRequiredEnv,

  // Logger
  logger,
  httpLogger,
  logError,
  logRequest,

  // Errors
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
  handleUncaughtException,
  handleUnhandledRejection,

  // Response
  successResponse,
  paginatedResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  noContentResponse,

  // Database (새로운 API)
  connect,
  disconnect,
  createRepository,
  healthCheck,
  sync,
  getCurrentDbType,

  // Database (Legacy API - 하위 호환성)
  connection,

  // Database Adapters
  MongooseAdapter,
  SequelizeAdapter,

  // Database Utilities
  ConnectionManager,
  QueryBuilder,

  // Auth Controllers
  authController,
  socialController,

  // Auth Services
  authService,
  kakaoService,
  appleService,

  // Auth Middlewares
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  resourceOwner,

  // Auth Utils
  jwtUtils,
  passwordUtils,
  tokenUtils,

  // Auth Models
  UserMongoose,
  RefreshTokenMongoose,

  // Upload Config
  multerConfig,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,

  // Upload Middlewares
  uploadSingle,
  uploadMultiple,

  // Upload Services
  imageService,

  // Upload Controllers
  uploadController,

  // Queue Config
  getRedisConfig,
  createRedisClient,
  testRedisConnection,

  // Queue Modules
  emailQueue,
  imageQueue,

  // Queue Services
  queueService,

  // Queue Controllers
  queueController,
};
