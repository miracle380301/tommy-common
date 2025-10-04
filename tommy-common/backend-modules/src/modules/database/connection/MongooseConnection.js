const mongoose = require('mongoose');
const { logger } = require('../../../core/logger');

class MongooseConnection {
  constructor() {
    this.connection = null;
    this.setupEventListeners();
  }

  /**
   * MongoDB 연결
   * @param {string} uri - MongoDB URI
   * @param {Object} options - Mongoose 연결 옵션
   */
  async connect(uri, options = {}) {
    try {
      const defaultOptions = {
        // Mongoose 6+ 에서는 이 옵션들이 기본값이므로 제거 가능
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      };

      const connectionOptions = { ...defaultOptions, ...options };

      await mongoose.connect(uri, connectionOptions);
      this.connection = mongoose.connection;
      logger.info('✅ MongoDB connected successfully');
    } catch (error) {
      logger.error(`❌ MongoDB connection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * MongoDB 연결 해제
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.connection = null;
      logger.info('MongoDB disconnected');
    } catch (error) {
      logger.error(`MongoDB disconnect error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 현재 연결 상태 반환
   */
  getConnection() {
    return this.connection;
  }

  /**
   * 연결 상태 확인
   */
  healthCheck() {
    const readyState = mongoose.connection.readyState;

    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: states[readyState] || 'unknown',
      isConnected: readyState === 1,
    };
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.info('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      logger.info('Mongoose connection closed due to app termination');
      process.exit(0);
    });
  }
}

// Singleton instance
const mongooseConnection = new MongooseConnection();

module.exports = mongooseConnection;
