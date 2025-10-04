const jwt = require('jsonwebtoken');
const { config } = require('../../../config');
const { logger } = require('../../../core/logger');

/**
 * JWT 토큰 생성 및 검증 유틸리티
 */

/**
 * Access Token 생성
 * @param {Object} payload - 토큰에 포함할 데이터 { userId, email, role }
 * @returns {string} JWT 토큰
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256',
    });

    logger.debug(`Access token generated for user: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error(`Failed to generate access token: ${error.message}`);
    throw error;
  }
};

/**
 * Refresh Token 생성
 * @param {Object} payload - 토큰에 포함할 데이터 { userId, email, role }
 * @returns {string} JWT Refresh Token
 */
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      algorithm: 'HS256',
    });

    logger.debug(`Refresh token generated for user: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error(`Failed to generate refresh token: ${error.message}`);
    throw error;
  }
};

/**
 * Access Token 검증
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 디코드된 payload 또는 null
 * @throws {Error} TokenExpiredError, JsonWebTokenError
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expired');
      throw error;
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token');
      throw error;
    }
    logger.error(`Token verification error: ${error.message}`);
    throw error;
  }
};

/**
 * Refresh Token 검증
 * @param {string} token - JWT Refresh Token
 * @returns {Object|null} 디코드된 payload 또는 null
 * @throws {Error} TokenExpiredError, JsonWebTokenError
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Refresh token expired');
      throw error;
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid refresh token');
      throw error;
    }
    logger.error(`Refresh token verification error: ${error.message}`);
    throw error;
  }
};

/**
 * 토큰 디코드 (검증 없이)
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 디코드된 payload 또는 null
 * @description 디버깅 및 로깅 용도로 사용
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error(`Failed to decode token: ${error.message}`);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
