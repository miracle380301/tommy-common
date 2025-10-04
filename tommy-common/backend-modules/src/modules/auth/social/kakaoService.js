const axios = require('axios');
const { logger } = require('../../../core/logger');
const { BadRequestError, UnauthorizedError } = require('../../../core/errors');
const { config } = require('../../../config');

/**
 * Kakao OAuth Service
 * Kakao 소셜 로그인 처리
 */

/**
 * Kakao OAuth 인증 URL 생성
 * @param {string} redirectUri - 리다이렉트 URI
 * @returns {string} OAuth 인증 URL
 */
const getAuthUrl = (redirectUri) => {
  const clientId = process.env.KAKAO_CLIENT_ID;

  if (!clientId) {
    throw new Error('KAKAO_CLIENT_ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

/**
 * 인증 코드로 Access Token 발급
 * @param {string} code - 인증 코드
 * @param {string} redirectUri - 리다이렉트 URI
 * @returns {Promise<string>} Access Token
 */
const getTokens = async (code, redirectUri) => {
  try {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;

    if (!clientId) {
      throw new Error('KAKAO_CLIENT_ID is not configured');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    });

    // Client Secret이 있는 경우 추가
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }

    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    logger.error(`Failed to get Kakao tokens: ${error.message}`);
    if (error.response) {
      logger.error(`Kakao API error: ${JSON.stringify(error.response.data)}`);
    }
    throw new UnauthorizedError('Failed to authenticate with Kakao');
  }
};

/**
 * Access Token으로 사용자 정보 조회
 * @param {string} accessToken - Kakao Access Token
 * @returns {Promise<Object>} 사용자 정보 { id, email, name }
 */
const getUserInfo = async (accessToken) => {
  try {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, kakao_account } = response.data;

    // 이메일이 없는 경우 에러
    if (!kakao_account.email) {
      throw new BadRequestError('Email is required for Kakao login');
    }

    return {
      id: id.toString(),
      email: kakao_account.email,
      name: kakao_account.profile?.nickname || 'Kakao User',
    };
  } catch (error) {
    logger.error(`Failed to get Kakao user info: ${error.message}`);
    if (error.response) {
      logger.error(`Kakao API error: ${JSON.stringify(error.response.data)}`);
    }
    throw new UnauthorizedError('Failed to get user information from Kakao');
  }
};

/**
 * Kakao OAuth 인증 완료 및 로그인/회원가입 처리
 * @param {string} code - 인증 코드
 * @param {string} redirectUri - 리다이렉트 URI
 * @param {Object} meta - 메타 정보 { ipAddress, userAgent }
 * @returns {Promise<Object>} { user, tokens }
 */
const verifyAndLogin = async (code, redirectUri, meta = {}) => {
  try {
    // 1. 인증 코드로 Access Token 발급
    const accessToken = await getTokens(code, redirectUri);

    // 2. Access Token으로 사용자 정보 조회
    const kakaoUser = await getUserInfo(accessToken);

    // 3. 소셜 로그인 처리 (authService의 findOrCreateSocialUser 사용)
    const authService = require('../services/authService');
    const result = await authService.findOrCreateSocialUser(
      'kakao',
      kakaoUser.id,
      {
        email: kakaoUser.email,
        name: kakaoUser.name,
      },
      meta
    );

    logger.info(`Kakao login successful for user: ${kakaoUser.email}`);
    return result;
  } catch (error) {
    logger.error(`Kakao login failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getAuthUrl,
  getTokens,
  getUserInfo,
  verifyAndLogin,
};
