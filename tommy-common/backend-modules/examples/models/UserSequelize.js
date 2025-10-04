const { Sequelize, DataTypes } = require('sequelize');

/**
 * Sequelize User Model Factory
 * @param {Sequelize} sequelize - Sequelize 인스턴스
 * @returns {Model} User Model
 */
function createUserModel(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name is required',
          },
          len: {
            args: [2, 50],
            msg: 'Name must be between 2 and 50 characters',
          },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: 'Email already exists',
        },
        validate: {
          notEmpty: {
            msg: 'Email is required',
          },
          isEmail: {
            msg: 'Please provide a valid email',
          },
        },
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: 'Age must be positive',
          },
          max: {
            args: [150],
            msg: 'Age must be realistic',
          },
        },
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'users',
      timestamps: true, // createdAt, updatedAt 자동 생성
      underscored: false, // camelCase 사용
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          fields: ['createdAt'],
        },
        {
          fields: ['status'],
        },
      ],
    }
  );

  return User;
}

module.exports = createUserModel;
