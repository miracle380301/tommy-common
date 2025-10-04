const mongoose = require('mongoose');

/**
 * User Schema (Mongoose)
 * 사용자 정보를 저장하는 모델
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // 기본적으로 조회 시 제외
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // 소셜 로그인 ID (선택적)
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    kakaoId: {
      type: String,
      sparse: true,
      index: true,
    },
    appleId: {
      type: String,
      sparse: true,
      index: true,
    },
    // 메타 정보
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
    collection: 'users',
  }
);

// 인덱스 설정
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ kakaoId: 1 }, { sparse: true });
userSchema.index({ appleId: 1 }, { sparse: true });

/**
 * JSON 변환 시 민감 정보 제외
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * 사용자 조회 시 password 필드 포함하는 헬퍼 메서드
 * @param {Object} query - 조회 조건
 * @returns {Promise<User>}
 */
userSchema.statics.findWithPassword = function (query) {
  return this.findOne(query).select('+password');
};

/**
 * 이메일 중복 확인
 * @param {string} email - 확인할 이메일
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

/**
 * 모델 생성 (이미 존재하면 재사용)
 */
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
