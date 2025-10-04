const { Sequelize } = require('sequelize');
const { logger } = require('../../../core/logger');

class SequelizeConnection {
  constructor() {
    this.sequelize = null;
  }

  /**
   * Sequelize 연결
   * @param {Object} config - Sequelize 연결 설정
   * @param {string} config.database - 데이터베이스 이름
   * @param {string} config.username - 사용자명
   * @param {string} config.password - 비밀번호
   * @param {string} config.host - 호스트
   * @param {number} config.port - 포트
   * @param {string} config.dialect - 데이터베이스 타입 (postgres, mysql, sqlite)
   * @param {boolean} config.logging - 로깅 활성화 여부
   * @param {Object} config.pool - 커넥션 풀 설정
   */
  async connect(config) {
    try {
      const defaultConfig = {
        host: config.host || 'localhost',
        dialect: config.dialect || 'postgres',
        logging: config.logging !== undefined ? config.logging : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
          ...config.pool,
        },
      };

      // SQLite는 username/password 불필요
      if (config.dialect === 'sqlite') {
        this.sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: config.storage || ':memory:',
          logging: defaultConfig.logging,
        });
      } else {
        this.sequelize = new Sequelize(
          config.database,
          config.username,
          config.password,
          {
            ...defaultConfig,
            port: config.port,
          }
        );
      }

      // 연결 테스트
      await this.sequelize.authenticate();
      logger.info(`✅ ${config.dialect.toUpperCase()} connected successfully`);
    } catch (error) {
      logger.error(`❌ Sequelize connection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 연결 해제
   */
  async disconnect() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.sequelize = null;
        logger.info('Sequelize disconnected');
      }
    } catch (error) {
      logger.error(`Sequelize disconnect error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sequelize 인스턴스 반환
   */
  getSequelize() {
    return this.sequelize;
  }

  /**
   * 연결 상태 확인
   */
  async healthCheck() {
    try {
      if (!this.sequelize) {
        return {
          status: 'disconnected',
          isConnected: false,
        };
      }

      await this.sequelize.authenticate();
      return {
        status: 'connected',
        isConnected: true,
        dialect: this.sequelize.getDialect(),
      };
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
   * 데이터베이스 동기화 (개발용)
   * @param {Object} options - 동기화 옵션
   * @param {boolean} options.force - 테이블 재생성
   * @param {boolean} options.alter - 테이블 변경사항 적용
   */
  async sync(options = {}) {
    try {
      if (!this.sequelize) {
        throw new Error('Sequelize is not connected');
      }

      await this.sequelize.sync(options);
      logger.info('Database synchronized');
    } catch (error) {
      logger.error(`Database sync error: ${error.message}`);
      throw error;
    }
  }
}

// Singleton instance
const sequelizeConnection = new SequelizeConnection();

module.exports = sequelizeConnection;
