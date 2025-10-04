const { asyncHandler, BadRequestError } = require('../../../core/errors');
const { successResponse } = require('../../../core/response');
const { logger } = require('../../../core/logger');
const kakaoService = require('../social/kakaoService');
const appleService = require('../social/appleService');

/**
 * Social Auth Controller
 * 소셜 로그인 관련 컨트롤러
 */

/**
 * Kakao OAuth 인증 URL 반환
 * @route GET /auth/kakao
 */
const kakaoAuth = asyncHandler(async (req, res) => {
  const { redirectUri } = req.query;

  if (!redirectUri) {
    throw new BadRequestError('redirectUri is required');
  }

  const authUrl = kakaoService.getAuthUrl(redirectUri);

  successResponse(res, { authUrl }, 'Kakao auth URL generated');
});

/**
 * Kakao OAuth 콜백 처리 및 로그인
 * @route POST /auth/kakao/callback
 */
const kakaoCallback = asyncHandler(async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code || !redirectUri) {
    throw new BadRequestError('code and redirectUri are required');
  }

  // 메타 정보 수집
  const meta = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  };

  const result = await kakaoService.verifyAndLogin(code, redirectUri, meta);

  successResponse(res, result, 'Login successful');
});

/**
 * Apple Sign In 처리 및 로그인
 * @route POST /auth/apple
 */
const appleSignIn = asyncHandler(async (req, res) => {
  const { idToken, user } = req.body;

  if (!idToken) {
    throw new BadRequestError('idToken is required');
  }

  // 메타 정보 수집
  const meta = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  };

  const result = await appleService.verifyAndLogin(idToken, user, meta);

  successResponse(res, result, 'Login successful');
});

module.exports = {
  kakaoAuth,
  kakaoCallback,
  appleSignIn,
};
