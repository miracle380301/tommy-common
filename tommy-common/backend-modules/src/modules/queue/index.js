// Config
const { getRedisConfig, createRedisClient, testRedisConnection } = require('./config/redisConfig');

// Queues
const emailQueue = require('./queues/emailQueue');
const imageQueue = require('./queues/imageQueue');

// Services
const queueService = require('./services/queueService');

// Controllers
const queueController = require('./controllers/queueController');

module.exports = {
  // Config
  getRedisConfig,
  createRedisClient,
  testRedisConnection,

  // Queues
  emailQueue,
  imageQueue,

  // Services
  queueService,

  // Controllers
  queueController,
};
