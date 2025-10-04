const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { BadRequestError } = require('../../../core/errors');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload directory
const UPLOAD_DIR = './uploads';

/**
 * Multer disk storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // Sanitize filename
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${timestamp}-${randomString}-${sanitizedBaseName}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter for image validation
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(', ')} are allowed.`
      ),
      false
    );
  }
};

/**
 * Multer configuration
 */
const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};

module.exports = {
  multerConfig,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
};
