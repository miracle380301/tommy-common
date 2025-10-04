Day 10: 파일 처리
📋 목표
파일 업로드, 이미지 처리, 다중 저장소(로컬/S3/Cloudinary) 지원 구현
📁 디렉토리 구조
src/modules/file/
├── storage/
│   ├── StorageInterface.js    # 저장소 인터페이스
│   ├── LocalStorage.js        # 로컬 파일 시스템
│   ├── S3Storage.js           # AWS S3
│   └── CloudinaryStorage.js  # Cloudinary
├── processors/
│   ├── ImageProcessor.js      # 이미지 처리 (Sharp)
│   └── FileValidator.js       # 파일 검증
├── middleware/
│   └── upload.js              # Multer 래퍼
├── services/
│   └── fileService.js         # 파일 서비스
├── controllers/
│   └── fileController.js      # 파일 컨트롤러
└── index.js
🎯 구현 모듈
10.1 Storage Interface
파일 위치: src/modules/file/storage/StorageInterface.js
목적: 모든 저장소가 구현해야 하는 공통 인터페이스
javascriptclass StorageInterface {
  /**
   * 파일 업로드
   * @param {Buffer|Stream} file - 파일 데이터
   * @param {Object} options - { filename, folder, metadata }
   * @returns {Promise<Object>} { url, key, size, ... }
   */
  async upload(file, options) {
    throw new Error('upload must be implemented');
  }

  /**
   * 파일 삭제
   * @param {string} key - 파일 식별자
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    throw new Error('delete must be implemented');
  }

  /**
   * 파일 조회 URL 생성
   * @param {string} key - 파일 식별자
   * @param {Object} options - { expiresIn }
   * @returns {Promise<string>} URL
   */
  async getUrl(key, options = {}) {
    throw new Error('getUrl must be implemented');
  }

  /**
   * 파일 존재 여부 확인
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    throw new Error('exists must be implemented');
  }

  /**
   * 파일 메타데이터 조회
   * @param {string} key
   * @returns {Promise<Object>}
   */
  async getMetadata(key) {
    throw new Error('getMetadata must be implemented');
  }
}

module.exports = StorageInterface;
10.2 Local Storage
파일 위치: src/modules/file/storage/LocalStorage.js
목적: 로컬 파일 시스템에 저장
javascriptconst fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const StorageInterface = require('./StorageInterface');
const AppError = require('../../../core/errors/AppError');

class LocalStorage extends StorageInterface {
  constructor(config = {}) {
    super();
    this.uploadDir = config.uploadDir || 'uploads';
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    
    // 업로드 디렉토리 생성
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 파일 업로드
   */
  async upload(file, options = {}) {
    const {
      filename = null,
      folder = '',
      preserveExtension = true
    } = options;

    // 고유 파일명 생성
    const ext = preserveExtension && filename 
      ? path.extname(filename) 
      : '';
    const uniqueName = filename || `${uuidv4()}${ext}`;
    
    // 폴더 경로
    const folderPath = path.join(this.uploadDir, folder);
    await fs.mkdir(folderPath, { recursive: true });
    
    // 전체 경로
    const filePath = path.join(folderPath, uniqueName);
    const key = path.join(folder, uniqueName);

    // 파일 쓰기
    if (Buffer.isBuffer(file)) {
      await fs.writeFile(filePath, file);
    } else if (file.path) {
      // Multer 파일
      await fs.copyFile(file.path, filePath);
      await fs.unlink(file.path);  // 임시 파일 삭제
    } else {
      throw new AppError('Invalid file format', 400);
    }

    // 파일 정보 조회
    const stats = await fs.stat(filePath);

    return {
      key,
      url: `${this.baseUrl}/${key}`,
      size: stats.size,
      storage: 'local'
    };
  }

  /**
   * 파일 삭제
   */
  async delete(key) {
    const filePath = path.join(this.uploadDir, key);
    
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;  // 파일 없음
      }
      throw error;
    }
  }

  /**
   * URL 생성
   */
  async getUrl(key, options = {}) {
    return `${this.baseUrl}/${key}`;
  }

  /**
   * 존재 여부
   */
  async exists(key) {
    const filePath = path.join(this.uploadDir, key);
    
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 메타데이터
   */
  async getMetadata(key) {
    const filePath = path.join(this.uploadDir, key);
    const stats = await fs.stat(filePath);
    
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  }
}

module.exports = LocalStorage;
10.3 S3 Storage
파일 위치: src/modules/file/storage/S3Storage.js
환경 변수:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
구현:
javascriptconst { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const StorageInterface = require('./StorageInterface');

class S3Storage extends StorageInterface {
  constructor(config = {}) {
    super();
    
    this.bucket = config.bucket || process.env.AWS_S3_BUCKET;
    this.region = config.region || process.env.AWS_REGION;
    
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  /**
   * 파일 업로드
   */
  async upload(file, options = {}) {
    const {
      filename = null,
      folder = '',
      contentType = null,
      acl = 'public-read',
      metadata = {}
    } = options;

    // Key 생성
    const ext = filename ? path.extname(filename) : '';
    const uniqueName = filename || `${uuidv4()}${ext}`;
    const key = folder ? `${folder}/${uniqueName}` : uniqueName;

    // 파일 데이터
    let body;
    if (Buffer.isBuffer(file)) {
      body = file;
    } else if (file.buffer) {
      body = file.buffer;
    } else {
      throw new AppError('Invalid file format', 400);
    }

    // S3 업로드
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType || file.mimetype || 'application/octet-stream',
      ACL: acl,
      Metadata: metadata
    });

    await this.s3.send(command);

    // URL 생성
    const url = acl === 'public-read'
      ? `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
      : await this.getUrl(key);

    return {
      key,
      url,
      size: body.length,
      storage: 's3',
      bucket: this.bucket
    };
  }

  /**
   * 파일 삭제
   */
  async delete(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    await this.s3.send(command);
    return true;
  }

  /**
   * Signed URL 생성 (Private 파일용)
   */
  async getUrl(key, options = {}) {
    const expiresIn = options.expiresIn || 3600;  // 1시간

    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn });
    return url;
  }

  /**
   * 존재 여부
   */
  async exists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      
      await this.s3.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 메타데이터
   */
  async getMetadata(key) {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    const response = await this.s3.send(command);

    return {
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata
    };
  }
}

module.exports = S3Storage;
10.4 Cloudinary Storage
파일 위치: src/modules/file/storage/CloudinaryStorage.js
환경 변수:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
구현:
javascriptconst cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const StorageInterface = require('./StorageInterface');

class CloudinaryStorage extends StorageInterface {
  constructor(config = {}) {
    super();
    
    cloudinary.config({
      cloud_name: config.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
      api_key: config.apiKey || process.env.CLOUDINARY_API_KEY,
      api_secret: config.apiSecret || process.env.CLOUDINARY_API_SECRET
    });
  }

  /**
   * 파일 업로드
   */
  async upload(file, options = {}) {
    const {
      folder = '',
      publicId = uuidv4(),
      resourceType = 'auto',
      transformation = null
    } = options;

    const uploadOptions = {
      folder,
      public_id: publicId,
      resource_type: resourceType
    };

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    let result;

    // Buffer로 업로드
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(file);
      });
    } 
    // Multer file
    else if (file.path) {
      result = await cloudinary.uploader.upload(file.path, uploadOptions);
    }
    // Base64
    else if (file.buffer) {
      result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        uploadOptions
      );
    } else {
      throw new AppError('Invalid file format', 400);
    }

    return {
      key: result.public_id,
      url: result.secure_url,
      size: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
      storage: 'cloudinary'
    };
  }

  /**
   * 파일 삭제
   */
  async delete(key) {
    const result = await cloudinary.uploader.destroy(key);
    return result.result === 'ok';
  }

  /**
   * URL 생성 (변환 옵션 포함)
   */
  async getUrl(key, options = {}) {
    const { transformation = null } = options;

    if (transformation) {
      return cloudinary.url(key, { transformation });
    }

    return cloudinary.url(key);
  }

  /**
   * 존재 여부
   */
  async exists(key) {
    try {
      await cloudinary.api.resource(key);
      return true;
    } catch (error) {
      if (error.error && error.error.http_code === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 메타데이터
   */
  async getMetadata(key) {
    const result = await cloudinary.api.resource(key);

    return {
      size: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
      createdAt: result.created_at,
      url: result.secure_url
    };
  }
}

module.exports = CloudinaryStorage;
10.5 Image Processor
파일 위치: src/modules/file/processors/ImageProcessor.js
목적: Sharp를 이용한 이미지 처리
javascriptconst sharp = require('sharp');
const AppError = require('../../../core/errors/AppError');

class ImageProcessor {
  /**
   * 이미지 리사이징
   */
  static async resize(buffer, options = {}) {
    const {
      width = null,
      height = null,
      fit = 'cover',  // cover | contain | fill | inside | outside
      quality = 80,
      format = null
    } = options;

    let image = sharp(buffer);

    // 리사이즈
    if (width || height) {
      image = image.resize(width, height, { fit });
    }

    // 포맷 변환
    if (format) {
      switch (format) {
        case 'jpeg':
        case 'jpg':
          image = image.jpeg({ quality });
          break;
        case 'png':
          image = image.png({ quality });
          break;
        case 'webp':
          image = image.webp({ quality });
          break;
        default:
          throw new AppError(`Unsupported format: ${format}`, 400);
      }
    }

    return await image.toBuffer();
  }

  /**
   * 썸네일 생성
   */
  static async createThumbnail(buffer, options = {}) {
    const {
      width = 200,
      height = 200,
      fit = 'cover'
    } = options;

    return await sharp(buffer)
      .resize(width, height, { fit })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  /**
   * 여러 크기 생성
   */
  static async createMultipleSizes(buffer, sizes = {}) {
    const results = {};

    for (const [name, size] of Object.entries(sizes)) {
      results[name] = await this.resize(buffer, size);
    }

    return results;
  }

  /**
   * 워터마크 추가
   */
  static async addWatermark(buffer, watermarkPath, options = {}) {
    const {
      gravity = 'southeast',  // 위치
      opacity = 0.5
    } = options;

    return await sharp(buffer)
      .composite([
        {
          input: watermarkPath,
          gravity,
          blend: 'over'
        }
      ])
      .toBuffer();
  }

  /**
   * 이미지 압축
   */
  static async compress(buffer, options = {}) {
    const {
      quality = 80,
      format = 'jpeg'
    } = options;

    return await sharp(buffer)
      .toFormat(format, { quality })
      .toBuffer();
  }

  /**
   * 이미지 정보 조회
   */
  static async getMetadata(buffer) {
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha
    };
  }

  /**
   * 이미지 검증
   */
  static async validateImage(buffer) {
    try {
      const metadata = await this.getMetadata(buffer);
      
      // 지원하는 포맷 확인
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
      if (!supportedFormats.includes(metadata.format)) {
        throw new AppError(`Unsupported image format: ${metadata.format}`, 400);
      }

      return metadata;
    } catch (error) {
      throw new AppError('Invalid image file', 400);
    }
  }
}

module.exports = ImageProcessor;
10.6 File Validator
파일 위치: src/modules/file/processors/FileValidator.js
목적: 파일 검증 (크기, 타입, 확장자)
javascriptconst path = require('path');
const AppError = require('../../../core/errors/AppError');

class FileValidator {
  /**
   * MIME 타입 검증
   */
  static validateMimeType(file, allowedTypes) {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        400
      );
    }
  }

  /**
   * 확장자 검증
   */
  static validateExtension(filename, allowedExtensions) {
    const ext = path.extname(filename).toLowerCase().slice(1);
    
    if (!allowedExtensions.includes(ext)) {
      throw new AppError(
        `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
        400
      );
    }
  }

  /**
   * 파일 크기 검증
   */
  static validateSize(file, maxSizeInBytes) {
    const size = file.size || file.buffer?.length || 0;
    
    if (size > maxSizeInBytes) {
      const maxSizeMB = (maxSizeInBytes / (1024 * 1024)).toFixed(2);
      throw new AppError(
        `File size exceeds limit. Maximum size: ${maxSizeMB}MB`,
        400
      );
    }
  }

  /**
   * 파일 이름 정제
   */
  static sanitizeFilename(filename) {
    // 특수 문자 제거, 공백을 언더스코어로
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  /**
   * 이미지 파일 검증 (프리셋)
   */
  static validateImage(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024,  // 5MB
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    } = options;

    this.validateMimeType(file, allowedTypes);
    this.validateExtension(file.originalname, allowedExtensions);
    this.validateSize(file, maxSize);
  }

  /**
   * 문서 파일 검증 (프리셋)
   */
  static validateDocument(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024,  // 10MB
      allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      allowedExtensions = ['pdf', 'doc', 'docx']
    } = options;

    this.validateMimeType(file, allowedTypes);
    this.validateExtension(file.originalname, allowedExtensions);
    this.validateSize(file, maxSize);
  }
}

module.exports = FileValidator;
10.7 Upload Middleware
파일 위치: src/modules/file/middleware/upload.js
목적: Multer 래퍼 및 설정
javascriptconst multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AppError = require('../../../core/errors/AppError');

/**
 * Multer 메모리 스토리지 (기본)
 */
const memoryStorage = multer.memoryStorage();

/**
 * 기본 파일 필터
 */
function createFileFilter(options = {}) {
  const {
    allowedMimeTypes = [],
    allowedExtensions = []
  } = options;

  return (req, file, cb) => {
    // MIME 타입 체크
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          `File type not allowed: ${file.mimetype}`,
          400
        ),
        false
      );
    }

    // 확장자 체크
    if (allowedExtensions.length > 0) {
      const ext = path.extname(file.originalname).toLowerCase().slice(1);
      if (!allowedExtensions.includes(ext)) {
        return cb(
          new AppError(
            `File extension not allowed: ${ext}`,
            400
          ),
          false
        );
      }
    }

    cb(null, true);
  };
}

/**
 * Upload 미들웨어 생성
 */
function createUploadMiddleware(options = {}) {
  const {
    storage = memoryStorage,
    fileFilter = null,
    limits = {
      fileSize: 5 * 1024 * 1024  // 5MB
    },
    allowedMimeTypes = [],
    allowedExtensions = []
  } = options;

  const multerOptions = {
    storage,
    limits
  };

  if (fileFilter) {
    multerOptions.fileFilter = fileFilter;
  } else if (allowedMimeTypes.length > 0 || allowedExtensions.length > 0) {
    multerOptions.fileFilter = createFileFilter({
      allowedMimeTypes,
      allowedExtensions
    });
  }

  return multer(multerOptions);
}

/**
 * 프리셋: 이미지 업로드
 */
const imageUpload = createUploadMiddleware({
  limits: { fileSize: 5 * 1024 * 1024 },
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
});

/**
 * 프리셋: 문서 업로드
 */
const documentUpload = createUploadMiddleware({
  limits: { fileSize: 10 * 1024 * 1024 },
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['pdf', 'doc', 'docx']
});

/**
 * 에러 핸들러
 */
function handleMulterError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size too large', 400));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files', 400));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected field', 400));
    }
  }
  next(error);
}

module.exports = {
  createUploadMiddleware,
  imageUpload,
  documentUpload,
  handleMulterError
};
10.8 File Service
파일 위치: src/modules/file/services/fileService.js
목적: 파일 업로드/삭제/처리 통합
javascriptconst LocalStorage = require('../storage/LocalStorage');
const S3Storage = require('../storage/S3Storage');
const CloudinaryStorage = require('../storage/CloudinaryStorage');
const ImageProcessor = require('../processors/ImageProcessor');
const FileValidator = require('../processors/FileValidator');
const config = require('../../../config');
const AppError = require('../../../core/errors/AppError');

class FileService {
  constructor() {
    // 환경에 따라 스토리지 선택
    this.storage = this.initStorage();
  }

  /**
   * 스토리지 초기화
   */
  initStorage() {
    const storageType = config.FILE_STORAGE || 'local';

    switch (storageType) {
      case 's3':
        return new S3Storage();
      case 'cloudinary':
        return new CloudinaryStorage();
      case 'local':
      default:
        return new LocalStorage();
    }
  }

  /**
   * 파일 업로드
   */
  async uploadFile(file, options = {}) {
    const {
      folder = 'uploads',
      validate = true,
      validationOptions = {}
    } = options;

    // 검증
    if (validate) {
      FileValidator.validateImage(file, validationOptions);
    }

    // 업로드
    const result = await this.storage.upload(file, {
      folder,
      filename: FileValidator.sanitizeFilename(file.originalname)
    });

    return result;
  }

  /**
   * 이미지 업로드 (리사이징 포함)
   */
  async uploadImage(file, options = {}) {
    const {
      resize = null,
      thumbnail = false,
      folder = 'images'
    } = options;

    // 이미지 검증
    await ImageProcessor.validateImage(file.buffer);

    let buffer = file.buffer;
    const results = {};

    // 리사이징
    if (resize) {
      buffer = await ImageProcessor.resize(buffer, resize);
    }

    // 원본 업로드
    results.original = await this.storage.upload(buffer, {
      folder,
      filename: file.originalname
    });

    // 썸네일 생성
    if (thumbnail) {
      const thumbBuffer = await ImageProcessor.createThumbnail(buffer);
      results.thumbnail = await this.storage.upload(thumbBuffer, {
        folder: `${folder}/thumbnails`,
        filename: `thumb_${file.originalname}`
      });
    }

    return results;
  }

  /**
   * 여러 크기로 업로드
   */
  async uploadMultipleSizes(file, sizes = {}, options = {}) {
    const { folder = 'images' } = options;

    await ImageProcessor.validateImage(file.buffer);

    // 여러 크기 생성
    const sizeBuffers = await ImageProcessor.createMultipleSizes(
      file.buffer,
      sizes
    );

    const results = {};

    // 각 크기별 업로드
    for (const [sizeName, buffer] of Object.entries(sizeBuffers)) {
      results[sizeName] = await this.storage.upload(buffer, {
        folder: `${folder}/${sizeName}`,
        filename: file.originalname
      });
    }

    return results;
  }

  /**
   * 파일 삭제
   */
  async deleteFile(key) {
    return await this.storage.delete(key);
  }

  /**
   * 여러 파일 삭제
   */
  async deleteMultipleFiles(keys) {
    const results = await Promise.allSettled(
      keys.map(key => this.storage.delete(key))
    );

    return {
      deleted: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }

  /**
   * URL 생성
   */
  async getFileUrl(key, options = {}) {
    return await this.storage.getUrl(key, options);
  }

  /**
   * 파일 존재 확인
   */
  async fileExists(key) {
    return await this.storage.exists(key);
  }

  /**
   * 메타데이터 조회
   */
  async getFileMetadata(key) {
    return await this.storage.getMetadata(key);
  }
}

module.exports = FileService;
10.9 File Controller
파일 위치: src/modules/file/controllers/fileController.js
목적: HTTP 엔드포인트
javascriptconst FileService = require('../services/fileService');
const { successResponse } = require('../../../core/response');
const AppError = require('../../../core/errors/AppError');

const fileService = new FileService();

class FileController {
  /**
   * 단일 파일 업로드
   * POST /files/upload
   */
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('No file provided', 400);
      }

      const result = await fileService.uploadFile(req.file, {
        folder: req.body.folder || 'uploads'
      });

      successResponse(res, result, 'File uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 여러 파일 업로드
   * POST /files/upload-multiple
   */
  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new AppError('No files provided', 400);
      }

      const uploadPromises = req.files.map(file =>
        fileService.uploadFile(file, {
          folder: req.body.folder || 'uploads'
        })
      );

      const results = await Promise.all(uploadPromises);

      successResponse(res, results, 'Files uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 이미지 업로드 (리사이징)
   * POST /files/upload-image
   */
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('No image provided', 400);
      }

      const options = {
        folder: req.body.folder || 'images',
        thumbnail: req.body.thumbnail === 'true',
        resize: req.body.resize ? JSON.parse(req.body.resize) : null
      };

      const result = await fileService.uploadImage(req.file, options);

      successResponse(res, result, 'Image uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 파일 삭제
   * DELETE /files/:key
   */
  async deleteFile(req, res, next) {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);

      const deleted = await fileService.deleteFile(decodedKey);

      if (!deleted) {
        throw new AppError('File not found', 404);
      }

      successResponse(res, null, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 파일 메타데이터 조회
   * GET /files/:key/metadata
   */
  async getMetadata(req, res, next) {
    try {
      const { key } = req.params;
      const decodedKey = decodeURIComponent(key);

      const metadata = await fileService.getFileMetadata(decodedKey);

      successResponse(res, metadata);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
📦 패키지 의존성
json"dependencies": {
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.0",
  "@aws-sdk/client-s3": "^3.450.0",
  "@aws-sdk/s3-request-presigner": "^3.450.0",
  "cloudinary": "^1.41.0",
  "uuid": "^9.0.1"
}
📝 사용 예제
파일 위치: examples/day10-file-upload.js
javascriptconst express = require('express');
const { imageUpload, documentUpload } = require('../src/modules/file/middleware/upload');
const fileController = require('../src/modules/file/controllers/fileController');
const { authenticate } = require('../src/modules/auth');

const app = express();

// 1. 단일 이미지 업로드
app.post('/files/image',
  authenticate,
  imageUpload.single('image'),
  fileController.uploadImage
);

// 2. 여러 이미지 업로드
app.post('/files/images',
  authenticate,
  imageUpload.array('images', 10),  // 최대 10개
  fileController.uploadMultiple
);

// 3. 프로필 이미지 업로드 (리사이징)
app.post('/users/avatar',
  authenticate,
  imageUpload.single('avatar'),
  async (req, res, next) => {
    req.body.resize = JSON.stringify({ width: 200, height: 200 });
    req.body.thumbnail = 'true';
    next();
  },
  fileController.uploadImage
);

// 4. 문서 업로드
app.post('/files/document',
  authenticate,
  documentUpload.single('document'),
  fileController.uploadSingle
);

// 5. 파일 삭제
app.delete('/files/:key',
  authenticate,
  fileController.deleteFile
);

app.listen(3000);

// 사용법:
// curl -X POST http://localhost:3000/files/image \
//   -H "Authorization: Bearer YOUR_TOKEN" \
//   -F "image=@/path/to/image.jpg" \
//   -F "folder=avatars"
✅ 완료 기준

 Local Storage 동작 (파일 시스템)
 S3 Storage 동작 (AWS S3)
 Cloudinary Storage 동작
 이미지 리사이징 (Sharp)
 썸네일 생성
 파일 검증 (크기, 타입, 확장자)
 Multer 미들웨어 통합
 단일/다중 파일 업로드
 파일 삭제
 환경 변수로 스토리지 전환