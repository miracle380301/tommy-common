const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../../../core/logger');
const { InternalServerError, NotFoundError } = require('../../../core/errors');

/**
 * Process and optimize an image
 * @param {string} filePath - Path to the image file
 * @param {object} options - Processing options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @param {number} options.quality - JPEG/WebP quality (1-100)
 * @param {string} options.format - Output format (jpeg, png, webp)
 * @returns {Promise<object>} Processed image info
 */
const processImage = async (filePath, options = {}) => {
  try {
    const {
      width,
      height,
      quality = 80,
      format = 'jpeg',
    } = options;

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    // Create sharp instance
    let image = sharp(filePath);

    // Resize if dimensions provided
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert format and set quality
    if (format === 'jpeg' || format === 'jpg') {
      image = image.jpeg({ quality });
    } else if (format === 'png') {
      image = image.png({ quality });
    } else if (format === 'webp') {
      image = image.webp({ quality });
    }

    // Generate output filename
    const ext = path.extname(filePath);
    const outputPath = filePath.replace(ext, `-processed.${format}`);

    // Save processed image
    await image.toFile(outputPath);

    // Get file stats
    const stats = await fs.stat(outputPath);

    logger.info(`Image processed successfully: ${outputPath}`);

    return {
      originalPath: filePath,
      processedPath: outputPath,
      size: stats.size,
      format,
    };
  } catch (error) {
    logger.error(`Image processing error: ${error.message}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Failed to process image: ${error.message}`);
  }
};

/**
 * Generate thumbnail for an image
 * @param {string} filePath - Path to the image file
 * @param {number} size - Thumbnail size (default: 200x200)
 * @returns {Promise<object>} Thumbnail info
 */
const generateThumbnail = async (filePath, size = 200) => {
  try {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath);
    const thumbnailPath = filePath.replace(ext, `-thumb${ext}`);

    await sharp(filePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    const stats = await fs.stat(thumbnailPath);

    logger.info(`Thumbnail generated successfully: ${thumbnailPath}`);

    return {
      originalPath: filePath,
      thumbnailPath,
      size: stats.size,
    };
  } catch (error) {
    logger.error(`Thumbnail generation error: ${error.message}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Failed to generate thumbnail: ${error.message}`);
  }
};

/**
 * Delete a file
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filePath) => {
  try {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    await fs.unlink(filePath);
    logger.info(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`File deletion error: ${error.message}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Get image metadata
 * @param {string} filePath - Path to the image file
 * @returns {Promise<object>} Image metadata
 */
const getImageMetadata = async (filePath) => {
  try {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    const metadata = await sharp(filePath).metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      space: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
    };
  } catch (error) {
    logger.error(`Metadata extraction error: ${error.message}`);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(`Failed to get image metadata: ${error.message}`);
  }
};

module.exports = {
  processImage,
  generateThumbnail,
  deleteFile,
  getImageMetadata,
};
