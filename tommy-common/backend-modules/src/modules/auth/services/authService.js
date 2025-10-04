const { ConnectionManager } = require('../../database');
const { logger } = require('../../../core/logger');
const {
  ConflictError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require('../../../core/errors');
const { config } = require('../../../config');

const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} = require('../utils/token');

const UserMongoose = require('../models/User.mongoose');

/**
 * Auth Service
 * 인증 관련 비즈니스 로직
 */

/**
 * User 모델 가져오기 (DB 타입에 따라)
 * @returns {Model} User 모델
 */
const getUserModel = () => {
  const dbType = ConnectionManager.getCurrentDbType();

  if (dbType === 'mongodb') {
    return UserMongoose;
  } else if (dbType === 'postgresql' || dbType === 'mysql') {
    const sequelize = ConnectionManager.getConnection();
    const UserSequelize = require('../models/User.sequelize');
    return UserSequelize(sequelize);
  }

  throw new Error(`Unsupported database type: ${dbType}`);
};

/**
 * 사용자 회원가입
 * @param {Object} userData - 회원가입 데이터 { name, email, password }
 * @returns {Promise<Object>} 생성된 사용자 (password 제외)
 */
const register = async (userData) => {
  const { name, email, password } = userData;

  try {
    const User = getUserModel();
    const dbType = ConnectionManager.getCurrentDbType();

    // 이메일 중복 확인
    let isEmailTaken;
    if (dbType === 'mongodb') {
      isEmailTaken = await User.isEmailTaken(email);
    } else {
      isEmailTaken = await User.isEmailTaken(email);
    }

    if (isEmailTaken) {
      throw new ConflictError('Email already exists');
    }

    // 비밀번호 강도 검사
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(
        `Password requirements not met: ${passwordValidation.errors.join(', ')}`
      );
    }

    // 비밀번호 해시
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    let user;
    if (dbType === 'mongodb') {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      // toJSON()이 자동으로 password 제외
      user = user.toJSON();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      // toJSON()이 자동으로 password 제외
      user = user.toJSON();
    }

    logger.info(`User registered: ${email}`);
    return user;
  } catch (error) {
    logger.error(`Registration failed: ${error.message}`);
    throw error;
  }
};

/**
 * 사용자 로그인
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @param {Object} meta - 메타 정보 { ipAddress, userAgent }
 * @returns {Promise<Object>} { user, tokens }
 */
const login = async (email, password, meta = {}) => {
  try {
    const User = getUserModel();
    const dbType = ConnectionManager.getCurrentDbType();

    // 사용자 조회 (password 포함)
    let user;
    if (dbType === 'mongodb') {
      user = await User.findWithPassword({ email });
    } else {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 비밀번호 검증
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Token Pair 생성
    const tokens = await generateTokenPair(
      user.id || user._id.toString(),
      user.email,
      user.role,
      meta
    );

    // lastLoginAt 업데이트
    if (dbType === 'mongodb') {
      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    } else {
      await user.update({ lastLoginAt: new Date() });
    }

    // password 제거
    const userResponse = {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: new Date(),
    };

    logger.info(`User logged in: ${email}`);
    return {
      user: userResponse,
      tokens,
    };
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    throw error;
  }
};

/**
 * 사용자 로그아웃
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<boolean>} 로그아웃 성공 여부
 */
const logout = async (refreshToken) => {
  try {
    await deleteRefreshToken(refreshToken);
    logger.info('User logged out');
    return true;
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    throw error;
  }
};

/**
 * Access Token 갱신
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<Object>} { accessToken, refreshToken?, expiresIn }
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Refresh Token 검증
    const decoded = verifyRefreshToken(refreshToken);

    // DB에서 토큰 조회
    const tokenDoc = await findRefreshToken(refreshToken);
    if (!tokenDoc) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // 새 Access Token 생성
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    logger.info(`Access token refreshed for user: ${decoded.userId}`);

    // Refresh Token Rotation (선택적)
    // const newRefreshToken = generateRefreshToken({
    //   userId: decoded.userId,
    //   email: decoded.email,
    //   role: decoded.role,
    // });
    // await deleteRefreshToken(refreshToken);
    // await saveRefreshToken(decoded.userId, newRefreshToken, ...);

    return {
      accessToken,
      expiresIn: config.jwt.expiresIn,
    };
  } catch (error) {
    logger.error(`Token refresh failed: ${error.message}`);
    throw error;
  }
};

/**
 * ID로 사용자 조회
 * @param {string|number} userId - 사용자 ID
 * @returns {Promise<Object>} 사용자 객체 (password 제외)
 */
const getUserById = async (userId) => {
  try {
    const User = getUserModel();
    const dbType = ConnectionManager.getCurrentDbType();

    let user;
    if (dbType === 'mongodb') {
      user = await User.findById(userId);
    } else {
      user = await User.findByPk(userId);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // password 제거
    const userResponse = {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  } catch (error) {
    logger.error(`Failed to get user: ${error.message}`);
    throw error;
  }
};

/**
 * Token Pair 생성 (Access Token + Refresh Token)
 * @param {string|number} userId - 사용자 ID
 * @param {string} email - 이메일
 * @param {string} role - 역할
 * @param {Object} meta - 메타 정보 { ipAddress, userAgent }
 * @returns {Promise<Object>} { accessToken, refreshToken, expiresIn }
 */
const generateTokenPair = async (userId, email, role, meta = {}) => {
  try {
    const payload = {
      userId: userId.toString(),
      email,
      role,
    };

    // Access Token 생성
    const accessToken = generateAccessToken(payload);

    // Refresh Token 생성
    const refreshToken = generateRefreshToken(payload);

    // Refresh Token을 DB에 저장
    const expiresAt = new Date();
    const refreshExpiresIn = parseInt(config.jwt.refreshExpiresIn);
    expiresAt.setDate(expiresAt.getDate() + refreshExpiresIn);

    await saveRefreshToken(userId, refreshToken, expiresAt, meta);

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  } catch (error) {
    logger.error(`Failed to generate token pair: ${error.message}`);
    throw error;
  }
};

/**
 * 비밀번호 검증 (이메일로 사용자 조회 후 비밀번호 검증)
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object|null>} 사용자 객체 또는 null
 */
const verifyPassword = async (email, password) => {
  try {
    const User = getUserModel();
    const dbType = ConnectionManager.getCurrentDbType();

    // 사용자 조회 (password 포함)
    let user;
    if (dbType === 'mongodb') {
      user = await User.findWithPassword({ email });
    } else {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      return null;
    }

    // 비밀번호 검증
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // password 제거
    const userResponse = {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    return userResponse;
  } catch (error) {
    logger.error(`Password verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * 소셜 로그인 사용자 찾기 또는 생성
 * @param {string} provider - 소셜 로그인 제공자 ('kakao', 'apple', 'google')
 * @param {string} providerId - 제공자의 사용자 ID
 * @param {Object} userData - 사용자 데이터 { email, name }
 * @param {Object} meta - 메타 정보 { ipAddress, userAgent }
 * @returns {Promise<Object>} { user, tokens }
 */
const findOrCreateSocialUser = async (provider, providerId, userData, meta = {}) => {
  try {
    const User = getUserModel();
    const dbType = ConnectionManager.getCurrentDbType();
    const { email, name } = userData;

    // Provider ID 필드 이름 매핑
    const providerIdField = `${provider}Id`;

    // 1. Provider ID로 사용자 조회
    let user;
    if (dbType === 'mongodb') {
      user = await User.findOne({ [providerIdField]: providerId });
    } else {
      user = await User.findOne({ where: { [providerIdField]: providerId } });
    }

    // 2. 사용자가 없으면 생성
    if (!user) {
      // 이메일 중복 확인
      let existingUser;
      if (dbType === 'mongodb') {
        existingUser = await User.findOne({ email });
      } else {
        existingUser = await User.findOne({ where: { email } });
      }

      if (existingUser) {
        // 이메일은 같지만 다른 제공자로 가입된 경우
        throw new ConflictError(
          `An account with this email already exists. Please login with your existing method.`
        );
      }

      // 새 사용자 생성 (소셜 로그인 사용자는 비밀번호가 없음)
      const randomPassword = Math.random().toString(36).slice(-16);
      const hashedPassword = await hashPassword(randomPassword);

      const newUserData = {
        name,
        email,
        password: hashedPassword, // 랜덤 비밀번호 (사용되지 않음)
        [providerIdField]: providerId,
        isEmailVerified: true, // 소셜 로그인은 이메일 검증됨
      };

      if (dbType === 'mongodb') {
        user = await User.create(newUserData);
      } else {
        user = await User.create(newUserData);
      }

      logger.info(`New ${provider} user created: ${email}`);
    }

    // 3. Token Pair 생성
    const tokens = await generateTokenPair(
      user.id || user._id.toString(),
      user.email,
      user.role,
      meta
    );

    // 4. lastLoginAt 업데이트
    if (dbType === 'mongodb') {
      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    } else {
      await user.update({ lastLoginAt: new Date() });
    }

    // 5. 사용자 응답 객체 생성
    const userResponse = {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: new Date(),
    };

    logger.info(`${provider} user logged in: ${email}`);
    return {
      user: userResponse,
      tokens,
    };
  } catch (error) {
    logger.error(`Social login failed (${provider}): ${error.message}`);
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  getUserById,
  generateTokenPair,
  verifyPassword,
  findOrCreateSocialUser,
};
