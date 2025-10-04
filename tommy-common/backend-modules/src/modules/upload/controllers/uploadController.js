const path = require('path');
const { config } = require('../../../config');
const { successResponse, createdResponse } = require('../../../core/response');
const { asyncHandler } = require('../../../core/errors');
const imageService = require('../services/imageService');
const { logger } = require('../../../core/logger');

/**
 * Generate file URL
 * @param {string} filename - File name
 * @returns {string} Full URL to the file
 */
const generateFileUrl = (filename) => {
  const { port } = config.server;
  const host = process.env.HOST || 'localhost';
  return `http://${host}:${port}/uploads/${filename}`;
};

/**
 * Format file info
 * @param {object} file - Multer file object
 * @returns {object} Formatted file info
 */
const formatFileInfo = (file) => {
  return {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    url: generateFileUrl(file.filename),
  };
};

/**
 * Upload single file
 */
const uploadSingle = asyncHandler(async (req, res) => {
  const file = req.file;

  logger.info(`File uploaded: ${file.filename}`);

  const fileInfo = formatFileInfo(file);

  createdResponse(res, fileInfo, 'File uploaded successfully');
});

/**
 * Upload multiple files
 */
const uploadMultiple = asyncHandler(async (req, res) => {
  const files = req.files;

  logger.info(`${files.length} files uploaded`);

  const filesInfo = files.map(formatFileInfo);

  createdResponse(res, filesInfo, `${files.length} files uploaded successfully`);
});

/**
 * Delete uploaded file
 */
const deleteFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  const filePath = path.join(process.cwd(), 'uploads', filename);

  await imageService.deleteFile(filePath);

  successResponse(res, { filename }, 'File deleted successfully');
});

/**
 * Process image (resize, optimize)
 */
const processImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const { width, height, quality, format } = req.body;

  const filePath = path.join(process.cwd(), 'uploads', filename);

  const result = await imageService.processImage(filePath, {
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    quality: quality ? parseInt(quality) : 80,
    format: format || 'jpeg',
  });

  const processedFilename = path.basename(result.processedPath);

  successResponse(
    res,
    {
      original: formatFileInfo({
        filename,
        path: filePath,
        url: generateFileUrl(filename),
      }),
      processed: {
        filename: processedFilename,
        path: result.processedPath,
        url: generateFileUrl(processedFilename),
        size: result.size,
        format: result.format,
      },
    },
    'Image processed successfully'
  );
});

/**
 * Generate thumbnail
 */
const generateThumbnail = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const { size } = req.body;

  const filePath = path.join(process.cwd(), 'uploads', filename);

  const result = await imageService.generateThumbnail(
    filePath,
    size ? parseInt(size) : 200
  );

  const thumbnailFilename = path.basename(result.thumbnailPath);

  successResponse(
    res,
    {
      original: {
        filename,
        url: generateFileUrl(filename),
      },
      thumbnail: {
        filename: thumbnailFilename,
        url: generateFileUrl(thumbnailFilename),
        size: result.size,
      },
    },
    'Thumbnail generated successfully'
  );
});

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  processImage,
  generateThumbnail,
};
