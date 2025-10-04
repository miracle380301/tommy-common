const { DataTypes } = require('sequelize');

/**
 * User Model (Sequelize)
 * @param {Object} sequelize - Sequelize 인스턴스
 * @returns {Model} User 모델
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_email_verified',
      },
      // 소셜 로그인 ID
      googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'google_id',
      },
      kakaoId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'kakao_id',
      },
      appleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'apple_id',
      },
      // 메타 정보
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['email'],
          unique: true,
        },
        {
          fields: ['google_id'],
          unique: true,
          where: { google_id: { [sequelize.Sequelize.Op.ne]: null } },
        },
        {
          fields: ['kakao_id'],
          unique: true,
          where: { kakao_id: { [sequelize.Sequelize.Op.ne]: null } },
        },
        {
          fields: ['apple_id'],
          unique: true,
          where: { apple_id: { [sequelize.Sequelize.Op.ne]: null } },
        },
      ],
    }
  );

  /**
   * JSON 변환 시 민감 정보 제외
   */
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  /**
   * 이메일 중복 확인
   * @param {string} email - 확인할 이메일
   * @returns {Promise<boolean>}
   */
  User.isEmailTaken = async function (email) {
    const user = await this.findOne({ where: { email } });
    return !!user;
  };

  return User;
};
