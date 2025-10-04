const path = require('path');
const { successResponse, createdResponse } = require('../../../core/response');
const { asyncHandler, BadRequestError } = require('../../../core/errors');
const queueService = require('../services/queueService');
const { logger } = require('../../../core/logger');

/**
 * Send email (add to queue)
 */
const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, body, priority } = req.body;

  // Validate required fields
  if (!to || !subject || !body) {
    throw new BadRequestError('Missing required fields: to, subject, body');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new BadRequestError('Invalid email address');
  }

  const emailData = {
    to,
    subject,
    body,
    priority: priority || 1,
  };

  const job = await queueService.addEmail(emailData);

  logger.info(`Email job created: ${job.id}`);

  createdResponse(
    res,
    {
      jobId: job.id,
      status: job.status,
      data: job.data,
      timestamp: job.timestamp,
    },
    'Email job added to queue successfully'
  );
});

/**
 * Process image (add to queue)
 */
const processImage = asyncHandler(async (req, res) => {
  const { filename, width, height, quality, format, priority } = req.body;

  // Validate required fields
  if (!filename) {
    throw new BadRequestError('Missing required field: filename');
  }

  const filePath = path.join(process.cwd(), 'uploads', filename);

  const jobData = {
    filePath,
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    quality: quality ? parseInt(quality) : 80,
    format: format || 'jpeg',
    priority: priority || 1,
  };

  const job = await queueService.addImageProcessing(jobData);

  logger.info(`Image processing job created: ${job.id}`);

  createdResponse(
    res,
    {
      jobId: job.id,
      status: job.status,
      data: job.data,
      timestamp: job.timestamp,
    },
    'Image processing job added to queue successfully'
  );
});

/**
 * Get queue statistics
 */
const getStats = asyncHandler(async (req, res) => {
  const { queueName } = req.query;

  let stats;

  if (queueName) {
    // Get stats for specific queue
    stats = await queueService.getQueueStatsByName(queueName);
  } else {
    // Get stats for all queues
    stats = await queueService.getAllQueueStats();
  }

  successResponse(res, stats, 'Queue statistics retrieved successfully');
});

/**
 * Health check for queue system
 */
const healthCheck = asyncHandler(async (req, res) => {
  const stats = await queueService.getAllQueueStats();

  const isHealthy =
    stats.email.status !== 'error' && stats.imageProcessing.status !== 'error';

  successResponse(
    res,
    {
      healthy: isHealthy,
      queues: stats,
    },
    isHealthy ? 'Queue system is healthy' : 'Queue system has issues'
  );
});

module.exports = {
  sendEmail,
  processImage,
  getStats,
  healthCheck,
};
