const Queue = require('bull');
const sharp = require('sharp');
const path = require('path');
const { getRedisConfig } = require('../config/redisConfig');
const { logger } = require('../../../core/logger');

let imageQueue = null;
let isRedisAvailable = true;

/**
 * Initialize image processing queue
 * @returns {Queue|null} Bull queue instance or null if Redis unavailable
 */
const initImageQueue = () => {
  if (imageQueue) {
    return imageQueue;
  }

  try {
    const redisConfig = getRedisConfig();

    imageQueue = new Queue('image-processing', {
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
    imageQueue.on('ready', () => {
      logger.info('Image processing queue is ready');
      isRedisAvailable = true;
    });

    imageQueue.on('error', (error) => {
      logger.error(`Image processing queue error: ${error.message}`);
      isRedisAvailable = false;
    });

    imageQueue.on('failed', (job, error) => {
      logger.error(`Image processing job ${job.id} failed: ${error.message}`);
    });

    imageQueue.on('completed', (job, result) => {
      logger.info(`Image processing job ${job.id} completed: ${result.outputPath}`);
    });

    imageQueue.on('progress', (job, progress) => {
      logger.info(`Image processing job ${job.id} progress: ${progress}%`);
    });

    // Process image jobs
    imageQueue.process(async (job) => {
      const { filePath, width, height, quality, format } = job.data;

      logger.info(`Processing image job ${job.id}`);
      logger.info(`File: ${filePath}`);
      logger.info(`Dimensions: ${width}x${height}`);

      try {
        // Update progress
        await job.progress(10);

        // Create sharp instance
        let image = sharp(filePath);

        await job.progress(30);

        // Resize if dimensions provided
        if (width || height) {
          image = image.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        await job.progress(50);

        // Convert format and set quality
        const targetFormat = format || 'jpeg';
        const targetQuality = quality || 80;

        if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
          image = image.jpeg({ quality: targetQuality });
        } else if (targetFormat === 'png') {
          image = image.png({ quality: targetQuality });
        } else if (targetFormat === 'webp') {
          image = image.webp({ quality: targetQuality });
        }

        await job.progress(70);

        // Generate output path
        const ext = path.extname(filePath);
        const outputPath = filePath.replace(ext, `-processed.${targetFormat}`);

        // Save processed image
        await image.toFile(outputPath);

        await job.progress(100);

        logger.info(`Image processed successfully: ${outputPath}`);

        return {
          success: true,
          originalPath: filePath,
          outputPath,
          width,
          height,
          format: targetFormat,
          quality: targetQuality,
          processedAt: new Date(),
        };
      } catch (error) {
        logger.error(`Image processing failed: ${error.message}`);
        throw error;
      }
    });

    logger.info('Image processing queue initialized successfully');
    return imageQueue;
  } catch (error) {
    logger.error(`Failed to initialize image processing queue: ${error.message}`);
    logger.warn('Image processing queue will work in mock mode without Redis');
    isRedisAvailable = false;
    return null;
  }
};

/**
 * Get image processing queue instance
 * @returns {Queue|null} Image processing queue instance
 */
const getImageQueue = () => {
  if (!imageQueue) {
    return initImageQueue();
  }
  return imageQueue;
};

/**
 * Add image processing job to queue
 * @param {object} jobData - Job data
 * @param {string} jobData.filePath - Path to image file
 * @param {number} jobData.width - Target width
 * @param {number} jobData.height - Target height
 * @param {number} jobData.quality - Image quality (1-100)
 * @param {string} jobData.format - Output format (jpeg, png, webp)
 * @returns {Promise<object>} Job info
 */
const addImageProcessingJob = async (jobData) => {
  const queue = getImageQueue();

  if (!queue || !isRedisAvailable) {
    // Mock mode: process immediately without queue
    logger.warn('Redis unavailable - Processing image in mock mode');

    try {
      const { filePath, width, height, quality, format } = jobData;

      let image = sharp(filePath);

      if (width || height) {
        image = image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const targetFormat = format || 'jpeg';
      const targetQuality = quality || 80;

      if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
        image = image.jpeg({ quality: targetQuality });
      } else if (targetFormat === 'png') {
        image = image.png({ quality: targetQuality });
      } else if (targetFormat === 'webp') {
        image = image.webp({ quality: targetQuality });
      }

      const ext = path.extname(filePath);
      const outputPath = filePath.replace(ext, `-processed.${targetFormat}`);

      await image.toFile(outputPath);

      logger.info(`Image processed in mock mode: ${outputPath}`);

      return {
        id: `mock-${Date.now()}`,
        data: jobData,
        status: 'mock-completed',
        result: {
          success: true,
          originalPath: filePath,
          outputPath,
          processedAt: new Date(),
        },
      };
    } catch (error) {
      logger.error(`Mock image processing failed: ${error.message}`);
      throw error;
    }
  }

  try {
    const job = await queue.add(jobData, {
      priority: jobData.priority || 1,
    });

    logger.info(`Image processing job ${job.id} added to queue`);

    return {
      id: job.id,
      data: job.data,
      status: 'queued',
      timestamp: job.timestamp,
    };
  } catch (error) {
    logger.error(`Failed to add image processing job: ${error.message}`);
    throw error;
  }
};

/**
 * Get image processing queue statistics
 * @returns {Promise<object>} Queue statistics
 */
const getImageQueueStats = async () => {
  const queue = getImageQueue();

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
    logger.error(`Failed to get image queue stats: ${error.message}`);
    throw error;
  }
};

/**
 * Close image processing queue
 * @returns {Promise<void>}
 */
const closeImageQueue = async () => {
  if (imageQueue) {
    await imageQueue.close();
    imageQueue = null;
    logger.info('Image processing queue closed');
  }
};

module.exports = {
  initImageQueue,
  getImageQueue,
  addImageProcessingJob,
  getImageQueueStats,
  closeImageQueue,
};
