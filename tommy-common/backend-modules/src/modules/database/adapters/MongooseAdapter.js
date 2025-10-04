const IRepository = require('../interfaces/IRepository');
const { AppError, ConflictError, NotFoundError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

/**
 * Mongoose Adapter for Repository Pattern
 */
class MongooseAdapter extends IRepository {
  /**
   * @param {mongoose.Model} model - Mongoose Model
   */
  constructor(model) {
    super();
    if (!model) {
      throw new Error('Model is required for MongooseAdapter');
    }
    this.model = model;
  }

  /**
   * ID로 단일 문서 조회
   */
  async findById(id) {
    try {
      const doc = await this.model.findById(id);
      return doc;
    } catch (error) {
      logger.error(`findById error: ${error.message}`);
      throw new AppError(`Failed to find document by ID: ${error.message}`, 500);
    }
  }

  /**
   * 조건으로 단일 문서 조회
   */
  async findOne(filter) {
    try {
      const doc = await this.model.findOne(filter);
      return doc;
    } catch (error) {
      logger.error(`findOne error: ${error.message}`);
      throw new AppError(`Failed to find document: ${error.message}`, 500);
    }
  }

  /**
   * 여러 문서 조회
   */
  async findAll(filter = {}, options = {}) {
    try {
      let query = this.model.find(filter);

      // Sort
      if (options.sort) {
        query = query.sort(options.sort);
      }

      // Limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Skip
      if (options.skip) {
        query = query.skip(options.skip);
      }

      // Populate (Mongoose specific)
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach((pop) => {
            query = query.populate(pop);
          });
        } else {
          query = query.populate(options.populate);
        }
      }

      // Select fields
      if (options.select) {
        query = query.select(options.select);
      }

      const docs = await query.exec();
      return docs;
    } catch (error) {
      logger.error(`findAll error: ${error.message}`);
      throw new AppError(`Failed to find documents: ${error.message}`, 500);
    }
  }

  /**
   * 문서 생성
   */
  async create(data) {
    try {
      const doc = new this.model(data);
      const savedDoc = await doc.save();
      return savedDoc;
    } catch (error) {
      // Duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        throw new ConflictError(`Duplicate value for field: ${field}`);
      }

      // Validation error
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 422);
      }

      logger.error(`create error: ${error.message}`);
      throw new AppError(`Failed to create document: ${error.message}`, 500);
    }
  }

  /**
   * 문서 수정
   */
  async update(id, data) {
    try {
      const doc = await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!doc) {
        return null;
      }

      return doc;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 422);
      }

      logger.error(`update error: ${error.message}`);
      throw new AppError(`Failed to update document: ${error.message}`, 500);
    }
  }

  /**
   * 문서 삭제
   */
  async delete(id) {
    try {
      const doc = await this.model.findByIdAndDelete(id);
      return doc !== null;
    } catch (error) {
      logger.error(`delete error: ${error.message}`);
      throw new AppError(`Failed to delete document: ${error.message}`, 500);
    }
  }

  /**
   * 문서 개수 조회
   */
  async count(filter = {}) {
    try {
      const count = await this.model.countDocuments(filter);
      return count;
    } catch (error) {
      logger.error(`count error: ${error.message}`);
      throw new AppError(`Failed to count documents: ${error.message}`, 500);
    }
  }

  /**
   * 문서 존재 여부 확인
   */
  async exists(filter) {
    try {
      const doc = await this.model.exists(filter);
      return doc !== null;
    } catch (error) {
      logger.error(`exists error: ${error.message}`);
      throw new AppError(`Failed to check existence: ${error.message}`, 500);
    }
  }

  /**
   * 페이지네이션
   */
  async paginate(filter = {}, page = 1, limit = 10, options = {}) {
    try {
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.model.countDocuments(filter);

      // Build query
      let query = this.model.find(filter).skip(skip).limit(limit);

      // Sort
      if (options.sort) {
        query = query.sort(options.sort);
      }

      // Populate
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach((pop) => {
            query = query.populate(pop);
          });
        } else {
          query = query.populate(options.populate);
        }
      }

      // Select
      if (options.select) {
        query = query.select(options.select);
      }

      const data = await query.exec();
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      };
    } catch (error) {
      logger.error(`paginate error: ${error.message}`);
      throw new AppError(`Failed to paginate documents: ${error.message}`, 500);
    }
  }

  /**
   * 대량 생성
   */
  async bulkCreate(dataArray) {
    try {
      const docs = await this.model.insertMany(dataArray, { ordered: false });
      return docs;
    } catch (error) {
      // Handle partial success in bulk insert
      if (error.writeErrors) {
        logger.warn(`Bulk create partial success: ${error.writeErrors.length} errors`);
        throw new AppError(
          `Bulk create completed with errors: ${error.writeErrors.length} failed`,
          207
        );
      }

      logger.error(`bulkCreate error: ${error.message}`);
      throw new AppError(`Failed to bulk create documents: ${error.message}`, 500);
    }
  }

  /**
   * 대량 수정
   */
  async bulkUpdate(filter, data) {
    try {
      const result = await this.model.updateMany(filter, { $set: data });
      return result.modifiedCount;
    } catch (error) {
      logger.error(`bulkUpdate error: ${error.message}`);
      throw new AppError(`Failed to bulk update documents: ${error.message}`, 500);
    }
  }

  /**
   * 대량 삭제
   */
  async bulkDelete(filter) {
    try {
      const result = await this.model.deleteMany(filter);
      return result.deletedCount;
    } catch (error) {
      logger.error(`bulkDelete error: ${error.message}`);
      throw new AppError(`Failed to bulk delete documents: ${error.message}`, 500);
    }
  }

  /**
   * 트랜잭션 실행
   */
  async transaction(callback) {
    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`transaction error: ${error.message}`);
      throw new AppError(`Transaction failed: ${error.message}`, 500);
    } finally {
      session.endSession();
    }
  }
}

module.exports = MongooseAdapter;
