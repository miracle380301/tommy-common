import { BaseEntity } from '../../src/core/BaseRepository';
import mongoose, { Schema } from 'mongoose';
import { DataTypes, Sequelize, Model } from 'sequelize';

export interface User extends BaseEntity {
  id?: number | string;
  name: string;
  email: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

// SQLite 테이블 정의
export const USER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`;

// MongoDB Mongoose 스키마 정의
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },  // unique는 여기서만 설정
  age: { type: Number },
}, {
  timestamps: true,  // createdAt, updatedAt 자동 생성
  collection: 'users'  // 컬렉션 이름 명시
});

// Mongoose 모델 생성 (connection별로 재생성 가능하도록)
export function createUserMongooseModel(connection?: mongoose.Connection) {
  if (connection) {
    // 이미 모델이 존재하면 재사용
    return connection.models.User || connection.model('User', userSchema);
  }
  // 기본 mongoose connection 사용
  return mongoose.models.User || mongoose.model('User', userSchema);
}

// Sequelize 모델 정의 (PostgreSQL/MySQL)
export function createUserSequelizeModel(sequelize: Sequelize) {
  class UserModel extends Model implements User {
    declare id?: number;
    declare name: string;
    declare email: string;
    declare age?: number;
    declare createdAt?: string;
    declare updatedAt?: string;
  }

  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
    }
  );

  return UserModel;
}
