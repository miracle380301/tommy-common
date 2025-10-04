const { addEmailJob, getEmailQueueStats } = require('../queues/emailQueue');
const { addImageProcessingJob, getImageQueueStats } = require('../queues/imageQueue');
const { logger } = require('../../../core/logger');

/**
 * Add email to queue
 * @param {object} emailData - Email data
 * @returns {Promise<object>} Job info
 */
const addEmail = async (emailData) => {
  try {
    const job = await addEmailJob(emailData);
    logger.info(`Email job added: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add email job: ${error.message}`);
    throw error;
  }
};

/**
 * Add image processing job to queue
 * @param {object} jobData - Job data
 * @returns {Promise<object>} Job info
 */
const addImageProcessing = async (jobData) => {
  try {
    const job = await addImageProcessingJob(jobData);
    logger.info(`Image processing job added: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add image processing job: ${error.message}`);
    throw error;
  }
};

/**
 * Get statistics for a specific queue
 * @param {string} queueName - Queue name ('email' or 'image-processing')
 * @returns {Promise<object>} Queue statistics
 */
const getQueueStatsByName = async (queueName) => {
  try {
    let stats;

    switch (queueName) {
      case 'email':
        stats = await getEmailQueueStats();
        break;
      case 'image-processing':
        stats = await getImageQueueStats();
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    return {
      queueName,
      ...stats,
    };
  } catch (error) {
    logger.error(`Failed to get queue stats for ${queueName}: ${error.message}`);
    throw error;
  }
};

/**
 * Get statistics for all queues
 * @returns {Promise<object>} All queue statistics
 */
const getAllQueueStats = async () => {
  try {
    const [emailStats, imageStats] = await Promise.all([
      getEmailQueueStats(),
      getImageQueueStats(),
    ]);

    return {
      email: emailStats,
      imageProcessing: imageStats,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error(`Failed to get all queue stats: ${error.message}`);
    throw error;
  }
};

module.exports = {
  addEmail,
  addImageProcessing,
  getQueueStatsByName,
  getAllQueueStats,
};
