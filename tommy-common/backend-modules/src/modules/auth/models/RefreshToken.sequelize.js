const { DataTypes } = require('sequelize');

/**
 * RefreshToken Model (Sequelize)
 * @param {Object} sequelize - Sequelize 인스턴스
 * @returns {Model} RefreshToken 모델
 */
module.exports = (sequelize) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        field: 'user_id',
      },
      token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address',
      },
      userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'user_agent',
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
      tableName: 'refresh_tokens',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['token'],
          unique: true,
        },
        {
          fields: ['expires_at'],
        },
      ],
    }
  );

  /**
   * 만료 여부 확인 메서드
   * @returns {boolean} 만료 여부
   */
  RefreshToken.prototype.isExpired = function () {
    return this.expiresAt < new Date();
  };

  return RefreshToken;
};
