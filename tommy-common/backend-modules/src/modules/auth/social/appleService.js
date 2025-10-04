const jwt = require('jsonwebtoken');
const { logger } = require('../../../core/logger');
const { BadRequestError, UnauthorizedError } = require('../../../core/errors');

/**
 * Apple Sign In Service
 * Apple 소셜 로그인 처리
 */

/**
 * Apple ID Token 검증 (MVP 버전 - 디코드만 수행)
 * @param {string} idToken - Apple ID Token
 * @returns {Object} 디코드된 토큰 페이로드
 */
const verifyIdToken = (idToken) => {
  try {
    // MVP: 서명 검증 없이 디코드만 수행
    // 프로덕션에서는 Apple의 공개 키로 서명을 검증해야 함
    const decoded = jwt.decode(idToken);

    if (!decoded) {
      throw new UnauthorizedError('Invalid Apple ID token');
    }

    // 필수 필드 확인
    if (!decoded.sub) {
      throw new BadRequestError('Apple ID token missing required fields');
    }

    return decoded;
  } catch (error) {
    logger.error(`Failed to verify Apple ID token: ${error.message}`);
    throw error;
  }
};

/**
 * Apple ID Token에서 사용자 정보 추출
 * @param {string} idToken - Apple ID Token
 * @returns {Promise<Object>} 사용자 정보 { id, email }
 */
const getUserInfo = async (idToken) => {
  try {
    const decoded = verifyIdToken(idToken);

    return {
      id: decoded.sub, // Apple user ID (unique identifier)
      email: decoded.email || null, // 이메일이 없을 수 있음 (Private Relay)
    };
  } catch (error) {
    logger.error(`Failed to get Apple user info: ${error.message}`);
    throw error;
  }
};

/**
 * Apple Sign In 완료 및 로그인/회원가입 처리
 * @param {string} idToken - Apple ID Token
 * @param {Object} user - 선택적 사용자 정보 (첫 로그인 시)
 * @param {Object} meta - 메타 정보 { ipAddress, userAgent }
 * @returns {Promise<Object>} { user, tokens }
 */
const verifyAndLogin = async (idToken, user = null, meta = {}) => {
  try {
    // 1. ID Token에서 사용자 정보 추출
    const appleUser = await getUserInfo(idToken);

    // 2. 첫 로그인 시 전달된 사용자 정보 처리
    let userName = 'Apple User';
    if (user && user.name) {
      const { firstName, lastName } = user.name;
      userName = [firstName, lastName].filter(Boolean).join(' ') || 'Apple User';
    }

    // 3. 이메일이 없는 경우 처리
    // Apple은 Private Relay를 사용할 수 있어 이메일이 없을 수 있음
    let userEmail = appleUser.email;
    if (!userEmail) {
      // 이메일이 없는 경우 Apple ID를 기반으로 가상 이메일 생성
      userEmail = `${appleUser.id}@appleid.private`;
    }

    // 4. 소셜 로그인 처리
    const authService = require('../services/authService');
    const result = await authService.findOrCreateSocialUser(
      'apple',
      appleUser.id,
      {
        email: userEmail,
        name: userName,
      },
      meta
    );

    logger.info(`Apple Sign In successful for user: ${userEmail}`);
    return result;
  } catch (error) {
    logger.error(`Apple Sign In failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  verifyIdToken,
  getUserInfo,
  verifyAndLogin,
};
