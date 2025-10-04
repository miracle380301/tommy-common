const Redis = require('ioredis');
const { logger } = require('../../../core/logger');

/**
 * Get Redis configuration from environment variables
 */
const getRedisConfig = () => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for Bull
    enableReadyCheck: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
};

/**
 * Create Redis client
 * @returns {Redis} Redis client instance
 */
const createRedisClient = () => {
  const config = getRedisConfig();

  try {
    const client = new Redis(config);

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('error', (err) => {
      logger.error(`Redis client error: ${err.message}`);
    });

    client.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    return client;
  } catch (error) {
    logger.error(`Failed to create Redis client: ${error.message}`);
    throw error;
  }
};

/**
 * Test Redis connection
 * @param {Redis} client - Redis client instance
 * @returns {Promise<boolean>} Connection status
 */
const testRedisConnection = async (client) => {
  try {
    await client.ping();
    logger.info('Redis connection test successful');
    return true;
  } catch (error) {
    logger.error(`Redis connection test failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  getRedisConfig,
  createRedisClient,
  testRedisConnection,
};
