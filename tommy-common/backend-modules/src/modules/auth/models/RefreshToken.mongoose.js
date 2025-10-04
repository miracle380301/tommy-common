const mongoose = require('mongoose');

/**
 * RefreshToken Schema (Mongoose)
 * Refresh Token을 DB에 저장하여 관리
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    collection: 'refreshtokens',
  }
);

// 인덱스 설정
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

// TTL 인덱스 (만료된 토큰 자동 삭제)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * 만료 여부 확인 메서드
 * @returns {boolean} 만료 여부
 */
refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

/**
 * 모델 생성 (이미 존재하면 재사용)
 */
const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
