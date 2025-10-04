const { ConnectionManager } = require('../../database');
const { logger } = require('../../../core/logger');
const RefreshTokenMongoose = require('../models/RefreshToken.mongoose');

/**
 * Refresh Token 관리 유틸리티
 * DB에 Refresh Token을 저장하고 관리
 */

/**
 * Refresh Token 모델 가져오기 (DB 타입에 따라)
 * @returns {Model} RefreshToken 모델
 */
const getRefreshTokenModel = () => {
  const dbType = ConnectionManager.getCurrentDbType();

  if (dbType === 'mongodb') {
    return RefreshTokenMongoose;
  } else if (dbType === 'postgresql' || dbType === 'mysql') {
    const sequelize = ConnectionManager.getConnection();
    const RefreshTokenSequelize = require('../models/RefreshToken.sequelize');
    return RefreshTokenSequelize(sequelize);
  }

  throw new Error(`Unsupported database type: ${dbType}`);
};

/**
 * Refresh Token 저장
 * @param {string|number} userId - 사용자 ID
 * @param {string} token - Refresh Token
 * @param {Date} expiresAt - 만료 시간
 * @param {Object} meta - 메타 정보 { ipAddress, userAgent }
 * @returns {Promise<Object>} 저장된 토큰 문서
 */
const saveRefreshToken = async (userId, token, expiresAt, meta = {}) => {
  try {
    const RefreshToken = getRefreshTokenModel();
    const dbType = ConnectionManager.getCurrentDbType();

    // 기존 토큰 삭제 (1 user = 1 token 정책)
    await deleteUserTokens(userId);

    // 새 토큰 저장
    const tokenData = {
      userId,
      token,
      expiresAt,
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    };

    let savedToken;
    if (dbType === 'mongodb') {
      savedToken = await RefreshToken.create(tokenData);
    } else {
      savedToken = await RefreshToken.create(tokenData);
    }

    logger.debug(`Refresh token saved for user: ${userId}`);
    return savedToken;
  } catch (error) {
    logger.error(`Failed to save refresh token: ${error.message}`);
    throw error;
  }
};

/**
 * Refresh Token 조회
 * @param {string} token - Refresh Token
 * @returns {Promise<Object|null>} 토큰 문서 또는 null
 */
const findRefreshToken = async (token) => {
  try {
    const RefreshToken = getRefreshTokenModel();
    const dbType = ConnectionManager.getCurrentDbType();

    let tokenDoc;
    if (dbType === 'mongodb') {
      tokenDoc = await RefreshToken.findOne({ token });
    } else {
      tokenDoc = await RefreshToken.findOne({ where: { token } });
    }

    if (!tokenDoc) {
      logger.debug('Refresh token not found');
      return null;
    }

    // 만료 체크
    if (tokenDoc.expiresAt < new Date()) {
      logger.debug('Refresh token expired');
      // 만료된 토큰 삭제
      await deleteRefreshToken(token);
      return null;
    }

    return tokenDoc;
  } catch (error) {
    logger.error(`Failed to find refresh token: ${error.message}`);
    throw error;
  }
};

/**
 * Refresh Token 삭제 (로그아웃)
 * @param {string} token - Refresh Token
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
const deleteRefreshToken = async (token) => {
  try {
    const RefreshToken = getRefreshTokenModel();
    const dbType = ConnectionManager.getCurrentDbType();

    let result;
    if (dbType === 'mongodb') {
      result = await RefreshToken.deleteOne({ token });
    } else {
      result = await RefreshToken.destroy({ where: { token } });
    }

    logger.debug(`Refresh token deleted: ${token.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logger.error(`Failed to delete refresh token: ${error.message}`);
    throw error;
  }
};

/**
 * 특정 사용자의 모든 Refresh Token 삭제
 * @param {string|number} userId - 사용자 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
const deleteUserTokens = async (userId) => {
  try {
    const RefreshToken = getRefreshTokenModel();
    const dbType = ConnectionManager.getCurrentDbType();

    let result;
    if (dbType === 'mongodb') {
      result = await RefreshToken.deleteMany({ userId });
    } else {
      result = await RefreshToken.destroy({ where: { userId } });
    }

    logger.debug(`All tokens deleted for user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to delete user tokens: ${error.message}`);
    throw error;
  }
};

/**
 * 만료된 Refresh Token 정리 (Cron Job용)
 * @returns {Promise<number>} 삭제된 토큰 수
 */
const cleanExpiredTokens = async () => {
  try {
    const RefreshToken = getRefreshTokenModel();
    const dbType = ConnectionManager.getCurrentDbType();
    const now = new Date();

    let result;
    if (dbType === 'mongodb') {
      result = await RefreshToken.deleteMany({
        expiresAt: { $lt: now },
      });
      logger.info(`Cleaned ${result.deletedCount} expired tokens`);
      return result.deletedCount;
    } else {
      const { Op } = require('sequelize');
      result = await RefreshToken.destroy({
        where: {
          expiresAt: {
            [Op.lt]: now,
          },
        },
      });
      logger.info(`Cleaned ${result} expired tokens`);
      return result;
    }
  } catch (error) {
    logger.error(`Failed to clean expired tokens: ${error.message}`);
    throw error;
  }
};

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserTokens,
  cleanExpiredTokens,
};
