require('dotenv').config();

/**
 * 환경 변수를 가져오고 기본값을 설정하는 헬퍼 함수
 */
const getEnv = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * 환경 변수를 숫자로 변환
 */
const getEnvAsNumber = (key, defaultValue = 0) => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

/**
 * 환경 변수를 boolean으로 변환
 */
const getEnvAsBoolean = (key, defaultValue = false) => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * 필수 환경 변수 검증
 */
const validateRequiredEnv = (keys) => {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// 애플리케이션 설정
const config = {
  // 서버 설정
  server: {
    env: getEnv('NODE_ENV', 'development'),
    port: getEnvAsNumber('PORT', 3000),
    host: getEnv('HOST', 'localhost'),
  },

  // 데이터베이스 설정
  database: {
    type: getEnv('DB_TYPE', 'mongodb'), // mongodb | postgresql | mysql
    uri: getEnv('DB_URI', ''),
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnvAsNumber('DB_PORT', 27017),
    name: getEnv('DB_NAME', 'myapp'),
    user: getEnv('DB_USER', ''),
    password: getEnv('DB_PASSWORD', ''),
  },

  // JWT 설정
  jwt: {
    secret: getEnv('JWT_SECRET', 'your-secret-key'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'your-refresh-secret'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  // 로깅 설정
  logging: {
    level: getEnv('LOG_LEVEL', 'info'), // error | warn | info | http | debug
    file: getEnvAsBoolean('LOG_FILE', true),
    console: getEnvAsBoolean('LOG_CONSOLE', true),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: getEnvAsNumber('RATE_LIMIT_WINDOW', 15 * 60 * 1000), // 15분
    max: getEnvAsNumber('RATE_LIMIT_MAX', 100), // 요청 제한
  },

  // CORS 설정
  cors: {
    origin: getEnv('CORS_ORIGIN', '*'),
    credentials: getEnvAsBoolean('CORS_CREDENTIALS', true),
  },

  // 파일 업로드 설정
  upload: {
    maxSize: getEnvAsNumber('UPLOAD_MAX_SIZE', 10 * 1024 * 1024), // 10MB
    allowedTypes: getEnv('UPLOAD_ALLOWED_TYPES', 'image/*,application/pdf').split(','),
  },

  // 이메일 설정
  email: {
    host: getEnv('EMAIL_HOST', ''),
    port: getEnvAsNumber('EMAIL_PORT', 587),
    secure: getEnvAsBoolean('EMAIL_SECURE', false),
    user: getEnv('EMAIL_USER', ''),
    password: getEnv('EMAIL_PASSWORD', ''),
    from: getEnv('EMAIL_FROM', 'noreply@example.com'),
  },

  // Redis 설정 (선택적)
  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: getEnvAsNumber('REDIS_PORT', 6379),
    password: getEnv('REDIS_PASSWORD', ''),
    db: getEnvAsNumber('REDIS_DB', 0),
  },
};

// Development 모드 확인
config.isDevelopment = config.server.env === 'development';
config.isProduction = config.server.env === 'production';

module.exports = {
  config,
  getEnv,
  getEnvAsNumber,
  getEnvAsBoolean,
  validateRequiredEnv,
};

