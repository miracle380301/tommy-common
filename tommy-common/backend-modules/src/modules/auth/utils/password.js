const bcrypt = require('bcrypt');
const { logger } = require('../../../core/logger');

/**
 * 비밀번호 암호화 및 검증 유틸리티
 */

// Salt rounds (기본값: 10)
const SALT_ROUNDS = 10;

/**
 * 비밀번호 해시화
 * @param {string} password - 평문 비밀번호
 * @returns {Promise<string>} 해시된 비밀번호
 */
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    logger.debug('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    logger.error(`Failed to hash password: ${error.message}`);
    throw error;
  }
};

/**
 * 비밀번호 검증
 * @param {string} password - 평문 비밀번호
 * @param {string} hashedPassword - 해시된 비밀번호
 * @returns {Promise<boolean>} 일치 여부
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    logger.debug(`Password comparison result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    logger.error(`Failed to compare password: ${error.message}`);
    throw error;
  }
};

/**
 * 비밀번호 강도 검사
 * @param {string} password - 검사할 비밀번호
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  // 최소 길이 검사 (8자 이상)
  if (password.length < 8) {
    errors.push('최소 8자 이상이어야 합니다');
  }

  // 대문자 포함 검사
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자 1개 이상 포함해야 합니다');
  }

  // 소문자 포함 검사
  if (!/[a-z]/.test(password)) {
    errors.push('소문자 1개 이상 포함해야 합니다');
  }

  // 숫자 포함 검사
  if (!/[0-9]/.test(password)) {
    errors.push('숫자 1개 이상 포함해야 합니다');
  }

  // 특수문자 포함 검사 (선택적)
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push('특수문자 1개 이상 포함해야 합니다');
  // }

  const isValid = errors.length === 0;

  if (!isValid) {
    logger.debug(`Password validation failed: ${errors.join(', ')}`);
  }

  return {
    valid: isValid,
    errors,
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};
