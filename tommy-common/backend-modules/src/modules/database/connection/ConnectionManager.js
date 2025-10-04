const mongooseConnection = require('./MongooseConnection');
const sequelizeConnection = require('./SequelizeConnection');
const MongooseAdapter = require('../adapters/MongooseAdapter');
const SequelizeAdapter = require('../adapters/SequelizeAdapter');
const { logger } = require('../../../core/logger');
const { config } = require('../../../config');

/**
 * Connection Manager
 * DB 타입에 따라 자동으로 적절한 데이터베이스 연결 관리
 */
class ConnectionManager {
  constructor() {
    this.currentDbType = null;
    this.connection = null;
  }

  /**
   * 환경 변수 기반 자동 연결
   * DB_TYPE 환경 변수를 읽어 적절한 데이터베이스에 연결
   */
  async connect() {
    const dbType = config.database.type || process.env.DB_TYPE || 'mongodb';
    this.currentDbType = dbType.toLowerCase();

    logger.info(`Connecting to database type: ${this.currentDbType}`);

    try {
      switch (this.currentDbType) {
        case 'mongodb':
          await this._connectMongoDB();
          break;

        case 'postgresql':
        case 'postgres':
          await this._connectPostgreSQL();
          break;

        case 'mysql':
          await this._connectMySQL();
          break;

        case 'sqlite':
          await this._connectSQLite();
          break;

        default:
          throw new Error(
            `Unsupported database type: ${this.currentDbType}. Supported types: mongodb, postgresql, mysql, sqlite`
          );
      }

      this.connection = this._getCurrentConnection();
      return this.connection;
    } catch (error) {
      logger.error(`Failed to connect to ${this.currentDbType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * MongoDB 연결
   * @private
   */
  async _connectMongoDB() {
    const uri =
      config.database.uri ||
      process.env.DB_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/mydb';

    await mongooseConnection.connect(uri);
  }

  /**
   * PostgreSQL 연결
   * @private
   */
  async _connectPostgreSQL() {
    const dbConfig = {
      database: config.database.name || process.env.DB_NAME || 'mydb',
      username: config.database.username || process.env.DB_USER || 'postgres',
      password: config.database.password || process.env.DB_PASSWORD || '',
      host: config.database.host || process.env.DB_HOST || 'localhost',
      port: config.database.port || process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: config.server.env === 'development',
    };

    await sequelizeConnection.connect(dbConfig);
  }

  /**
   * MySQL 연결
   * @private
   */
  async _connectMySQL() {
    const dbConfig = {
      database: config.database.name || process.env.DB_NAME || 'mydb',
      username: config.database.username || process.env.DB_USER || 'root',
      password: config.database.password || process.env.DB_PASSWORD || '',
      host: config.database.host || process.env.DB_HOST || 'localhost',
      port: config.database.port || process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: config.server.env === 'development',
    };

    await sequelizeConnection.connect(dbConfig);
  }

  /**
   * SQLite 연결
   * @private
   */
  async _connectSQLite() {
    const dbConfig = {
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: config.server.env === 'development',
    };

    await sequelizeConnection.connect(dbConfig);
  }

  /**
   * 연결 해제
   */
  async disconnect() {
    try {
      if (!this.currentDbType) {
        logger.warn('No active database connection to disconnect');
        return;
      }

      if (this.currentDbType === 'mongodb') {
        await mongooseConnection.disconnect();
      } else {
        await sequelizeConnection.disconnect();
      }

      this.currentDbType = null;
      this.connection = null;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error(`Failed to disconnect: ${error.message}`);
      throw error;
    }
  }

  /**
   * 현재 DB 타입에 맞는 Adapter 반환
   * @param {Object} model - Mongoose Model 또는 Sequelize Model
   * @returns {IRepository} Repository Adapter
   */
  getAdapter(model) {
    if (!this.currentDbType) {
      throw new Error('Database not connected. Call connect() first.');
    }

    if (this.currentDbType === 'mongodb') {
      return new MongooseAdapter(model);
    } else {
      return new SequelizeAdapter(model);
    }
  }

  /**
   * Health Check
   */
  async healthCheck() {
    try {
      if (!this.currentDbType) {
        return {
          status: 'disconnected',
          isConnected: false,
        };
      }

      if (this.currentDbType === 'mongodb') {
        return mongooseConnection.healthCheck();
      } else {
        return await sequelizeConnection.healthCheck();
      }
    } catch (error) {
      logger.error(`Health check failed: ${error.message}`);
      return {
        status: 'error',
        isConnected: false,
        error: error.message,
      };
    }
  }

  /**
   * 현재 연결 객체 반환
   * @private
   */
  _getCurrentConnection() {
    if (this.currentDbType === 'mongodb') {
      return mongooseConnection.getConnection();
    } else {
      return sequelizeConnection.getSequelize();
    }
  }

  /**
   * 현재 DB 타입 반환
   */
  getCurrentDbType() {
    return this.currentDbType;
  }

  /**
   * MongoDB Sequelize 인스턴스 직접 접근 (고급 사용)
   */
  getSequelize() {
    if (this.currentDbType !== 'mongodb') {
      return sequelizeConnection.getSequelize();
    }
    throw new Error('Current database is MongoDB, not Sequelize');
  }

  /**
   * Mongoose Connection 직접 접근 (고급 사용)
   */
  getMongooseConnection() {
    if (this.currentDbType === 'mongodb') {
      return mongooseConnection.getConnection();
    }
    throw new Error('Current database is not MongoDB');
  }

  /**
   * 데이터베이스 동기화 (개발용 - Sequelize만 해당)
   */
  async sync(options = {}) {
    if (this.currentDbType === 'mongodb') {
      logger.warn('Sync is not applicable for MongoDB');
      return;
    }

    await sequelizeConnection.sync(options);
  }
}

// Singleton instance
const connectionManager = new ConnectionManager();

module.exports = connectionManager;
