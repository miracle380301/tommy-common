// Config
const { multerConfig, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } = require('./config/multerConfig');

// Middlewares
const { uploadSingle, uploadMultiple } = require('./middlewares/upload');

// Services
const imageService = require('./services/imageService');

// Controllers
const uploadController = require('./controllers/uploadController');

module.exports = {
  // Config
  multerConfig,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,

  // Middlewares
  uploadSingle,
  uploadMultiple,

  // Services
  imageService,

  // Controllers
  uploadController,
};
