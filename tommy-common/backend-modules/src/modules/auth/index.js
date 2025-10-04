// Controllers
const authController = require('./controllers/authController');
const socialController = require('./controllers/socialController');

// Services
const authService = require('./services/authService');
const { kakaoService, appleService } = require('./social');

// Middlewares
const {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  resourceOwner,
} = require('./middlewares');

// Utils
const jwtUtils = require('./utils/jwt');
const passwordUtils = require('./utils/password');
const tokenUtils = require('./utils/token');

// Models
const UserMongoose = require('./models/User.mongoose');
const RefreshTokenMongoose = require('./models/RefreshToken.mongoose');

module.exports = {
  // Controllers
  authController,
  socialController,

  // Services
  authService,
  kakaoService,
  appleService,

  // Middlewares
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  resourceOwner,

  // Utils
  jwtUtils,
  passwordUtils,
  tokenUtils,

  // Models (Mongoose)
  UserMongoose,
  RefreshTokenMongoose,
};
