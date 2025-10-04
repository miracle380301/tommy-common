const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

/**
 * Express 애플리케이션 생성 및 설정
 * @param {Object} options - 설정 옵션
 * @param {string} options.corsOrigin - CORS 허용 도메인 (기본값: '*')
 * @param {boolean} options.corsCredentials - CORS 자격증명 허용 (기본값: true)
 * @param {string} options.jsonLimit - JSON 바디 크기 제한 (기본값: '10mb')
 * @param {Object} options.csp - Content Security Policy 설정
 * @returns {express.Application}
 */
function createApp(options = {}) {
  const {
    corsOrigin = '*',
    corsCredentials = true,
    jsonLimit = '10mb',
    csp = {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  } = options;

  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: csp,
    })
  );

  // CORS 설정
  app.use(
    cors({
      origin: corsOrigin,
      credentials: corsCredentials,
    })
  );

  // Body parsing
  app.use(express.json({ limit: jsonLimit }));
  app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

  // Response compression
  app.use(compression());

  // Trust proxy (for deployment behind reverse proxy)
  app.set('trust proxy', 1);

  return app;
}

module.exports = { createApp };
