const Queue = require('bull');
const { getRedisConfig } = require('../config/redisConfig');
const { logger } = require('../../../core/logger');

let emailQueue = null;
let isRedisAvailable = true;

/**
 * Initialize email queue
 * @returns {Queue|null} Bull queue instance or null if Redis unavailable
 */
const initEmailQueue = () => {
  if (emailQueue) {
    return emailQueue;
  }

  try {
    const redisConfig = getRedisConfig();

    emailQueue = new Queue('email', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    // Queue event listeners
    emailQueue.on('ready', () => {
      logger.info('Email queue is ready');
      isRedisAvailable = true;
    });

    emailQueue.on('error', (error) => {
      logger.error(`Email queue error: ${error.message}`);
      isRedisAvailable = false;
    });

    emailQueue.on('failed', (job, error) => {
      logger.error(`Email job ${job.id} failed: ${error.message}`);
    });

    emailQueue.on('completed', (job) => {
      logger.info(`Email job ${job.id} completed successfully`);
    });

    // Process email jobs
    emailQueue.process(async (job) => {
      const { to, subject, body } = job.data;

      logger.info(`Processing email job ${job.id}`);
      logger.info(`Sending email to: ${to}`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Body: ${body}`);

      // Mock email sending (in production, integrate with actual email service)
      // Example: await sendGridService.send({ to, subject, body });
      // Example: await nodemailerTransport.sendMail({ to, subject, text: body });

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        to,
        subject,
        sentAt: new Date(),
      };
    });

    logger.info('Email queue initialized successfully');
    return emailQueue;
  } catch (error) {
    logger.error(`Failed to initialize email queue: ${error.message}`);
    logger.warn('Email queue will work in mock mode without Redis');
    isRedisAvailable = false;
    return null;
  }
};

/**
 * Get email queue instance
 * @returns {Queue|null} Email queue instance
 */
const getEmailQueue = () => {
  if (!emailQueue) {
    return initEmailQueue();
  }
  return emailQueue;
};

/**
 * Add email job to queue
 * @param {object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body
 * @returns {Promise<object>} Job info
 */
const addEmailJob = async (emailData) => {
  const queue = getEmailQueue();

  if (!queue || !isRedisAvailable) {
    // Mock mode: log email without queue
    logger.warn('Redis unavailable - Processing email in mock mode');
    logger.info(`Mock email sent to: ${emailData.to}`);
    logger.info(`Subject: ${emailData.subject}`);
    logger.info(`Body: ${emailData.body}`);

    return {
      id: `mock-${Date.now()}`,
      data: emailData,
      status: 'mock-completed',
      timestamp: new Date(),
    };
  }

  try {
    const job = await queue.add(emailData, {
      priority: emailData.priority || 1,
    });

    logger.info(`Email job ${job.id} added to queue`);

    return {
      id: job.id,
      data: job.data,
      status: 'queued',
      timestamp: job.timestamp,
    };
  } catch (error) {
    logger.error(`Failed to add email job: ${error.message}`);
    throw error;
  }
};

/**
 * Get email queue statistics
 * @returns {Promise<object>} Queue statistics
 */
const getEmailQueueStats = async () => {
  const queue = getEmailQueue();

  if (!queue || !isRedisAvailable) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      status: 'mock-mode',
    };
  }

  try {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      status: 'active',
    };
  } catch (error) {
    logger.error(`Failed to get email queue stats: ${error.message}`);
    throw error;
  }
};

/**
 * Close email queue
 * @returns {Promise<void>}
 */
const closeEmailQueue = async () => {
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
    logger.info('Email queue closed');
  }
};

module.exports = {
  initEmailQueue,
  getEmailQueue,
  addEmailJob,
  getEmailQueueStats,
  closeEmailQueue,
};
