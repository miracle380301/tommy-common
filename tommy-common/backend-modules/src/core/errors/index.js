const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} = require('./AppError');

const {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  handleUncaughtException,
  handleUnhandledRejection,
} = require('./errorHandler');

module.exports = {
  // Error classes
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,

  // Error handlers
  notFoundHandler,
  errorHandler,
  asyncHandler,
  handleUncaughtException,
  handleUnhandledRejection,
};
