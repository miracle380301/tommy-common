const multer = require('multer');
const { multerConfig } = require('../config/multerConfig');
const { BadRequestError } = require('../../../core/errors');

// Create multer instance
const upload = multer(multerConfig);

/**
 * Single file upload middleware
 * @param {string} fieldName - Name of the file field in the form
 */
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size exceeds the maximum limit of 5MB'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new BadRequestError(`Unexpected field: ${err.field}`));
        }
        return next(new BadRequestError(`Upload error: ${err.message}`));
      } else if (err) {
        // Other errors (e.g., fileFilter rejection)
        return next(err);
      }

      // No file uploaded
      if (!req.file) {
        return next(new BadRequestError('No file uploaded'));
      }

      next();
    });
  };
};

/**
 * Multiple files upload middleware
 * @param {string} fieldName - Name of the file field in the form
 * @param {number} maxCount - Maximum number of files allowed
 */
const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);

    multipleUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size exceeds the maximum limit of 5MB'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new BadRequestError(`Too many files. Maximum allowed: ${maxCount}`));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new BadRequestError(`Unexpected field: ${err.field}`));
        }
        return next(new BadRequestError(`Upload error: ${err.message}`));
      } else if (err) {
        // Other errors (e.g., fileFilter rejection)
        return next(err);
      }

      // No files uploaded
      if (!req.files || req.files.length === 0) {
        return next(new BadRequestError('No files uploaded'));
      }

      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
};
