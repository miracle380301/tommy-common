const IRepository = require('../interfaces/IRepository');
const { AppError, ConflictError, NotFoundError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');
const { Op } = require('sequelize');

/**
 * Sequelize Adapter for Repository Pattern
 * Supports PostgreSQL, MySQL, SQLite
 */
class SequelizeAdapter extends IRepository {
  /**
   * @param {Sequelize.Model} model - Sequelize Model
   */
  constructor(model) {
    super();
    if (!model) {
      throw new Error('Model is required for SequelizeAdapter');
    }
    this.model = model;
    this.sequelize = model.sequelize;
  }

  /**
   * ID로 단일 레코드 조회
   */
  async findById(id) {
    try {
      const record = await this.model.findByPk(id);
      return record;
    } catch (error) {
      logger.error(`findById error: ${error.message}`);
      throw new AppError(`Failed to find record by ID: ${error.message}`, 500);
    }
  }

  /**
   * 조건으로 단일 레코드 조회
   */
  async findOne(filter) {
    try {
      const record = await this.model.findOne({ where: filter });
      return record;
    } catch (error) {
      logger.error(`findOne error: ${error.message}`);
      throw new AppError(`Failed to find record: ${error.message}`, 500);
    }
  }

  /**
   * 여러 레코드 조회
   */
  async findAll(filter = {}, options = {}) {
    try {
      const queryOptions = { where: filter };

      // Sort: Mongoose 스타일을 Sequelize 스타일로 변환
      if (options.sort) {
        queryOptions.order = this._convertSort(options.sort);
      }

      // Limit
      if (options.limit) {
        queryOptions.limit = options.limit;
      }

      // Skip (offset in Sequelize)
      if (options.skip) {
        queryOptions.offset = options.skip;
      }

      // Include (Sequelize associations - populate equivalent)
      if (options.populate) {
        queryOptions.include = Array.isArray(options.populate)
          ? options.populate
          : [options.populate];
      }

      // Select fields (attributes in Sequelize)
      if (options.select) {
        queryOptions.attributes = Array.isArray(options.select)
          ? options.select
          : options.select.split(' ');
      }

      const records = await this.model.findAll(queryOptions);
      return records;
    } catch (error) {
      logger.error(`findAll error: ${error.message}`);
      throw new AppError(`Failed to find records: ${error.message}`, 500);
    }
  }

  /**
   * 레코드 생성
   */
  async create(data) {
    try {
      const record = await this.model.create(data);
      return record;
    } catch (error) {
      // Unique constraint error
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path || 'field';
        throw new ConflictError(`Duplicate value for field: ${field}`);
      }

      // Validation error
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e) => e.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 422);
      }

      logger.error(`create error: ${error.message}`);
      throw new AppError(`Failed to create record: ${error.message}`, 500);
    }
  }

  /**
   * 레코드 수정
   */
  async update(id, data) {
    try {
      // PostgreSQL supports returning
      const [affectedCount, affectedRows] = await this.model.update(data, {
        where: { id },
        returning: true,
      });

      if (affectedCount === 0) {
        return null;
      }

      // PostgreSQL returns updated rows, MySQL doesn't
      if (affectedRows && affectedRows.length > 0) {
        return affectedRows[0];
      }

      // For MySQL, fetch the updated record
      return await this.findById(id);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e) => e.message);
        throw new AppError(`Validation failed: ${messages.join(', ')}`, 422);
      }

      logger.error(`update error: ${error.message}`);
      throw new AppError(`Failed to update record: ${error.message}`, 500);
    }
  }

  /**
   * 레코드 삭제
   */
  async delete(id) {
    try {
      const deletedCount = await this.model.destroy({ where: { id } });
      return deletedCount > 0;
    } catch (error) {
      logger.error(`delete error: ${error.message}`);
      throw new AppError(`Failed to delete record: ${error.message}`, 500);
    }
  }

  /**
   * 레코드 개수 조회
   */
  async count(filter = {}) {
    try {
      const count = await this.model.count({ where: filter });
      return count;
    } catch (error) {
      logger.error(`count error: ${error.message}`);
      throw new AppError(`Failed to count records: ${error.message}`, 500);
    }
  }

  /**
   * 레코드 존재 여부 확인
   */
  async exists(filter) {
    try {
      const count = await this.count(filter);
      return count > 0;
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
      const offset = (page - 1) * limit;

      const queryOptions = {
        where: filter,
        limit: limit,
        offset: offset,
      };

      // Sort
      if (options.sort) {
        queryOptions.order = this._convertSort(options.sort);
      }

      // Include
      if (options.populate) {
        queryOptions.include = Array.isArray(options.populate)
          ? options.populate
          : [options.populate];
      }

      // Select
      if (options.select) {
        queryOptions.attributes = Array.isArray(options.select)
          ? options.select
          : options.select.split(' ');
      }

      const { count, rows } = await this.model.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return {
        data: rows,
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      };
    } catch (error) {
      logger.error(`paginate error: ${error.message}`);
      throw new AppError(`Failed to paginate records: ${error.message}`, 500);
    }
  }

  /**
   * 대량 생성
   */
  async bulkCreate(dataArray) {
    try {
      const records = await this.model.bulkCreate(dataArray, {
        validate: true,
      });
      return records;
    } catch (error) {
      logger.error(`bulkCreate error: ${error.message}`);
      throw new AppError(`Failed to bulk create records: ${error.message}`, 500);
    }
  }

  /**
   * 대량 수정
   */
  async bulkUpdate(filter, data) {
    try {
      const [affectedCount] = await this.model.update(data, { where: filter });
      return affectedCount;
    } catch (error) {
      logger.error(`bulkUpdate error: ${error.message}`);
      throw new AppError(`Failed to bulk update records: ${error.message}`, 500);
    }
  }

  /**
   * 대량 삭제
   */
  async bulkDelete(filter) {
    try {
      const deletedCount = await this.model.destroy({ where: filter });
      return deletedCount;
    } catch (error) {
      logger.error(`bulkDelete error: ${error.message}`);
      throw new AppError(`Failed to bulk delete records: ${error.message}`, 500);
    }
  }

  /**
   * 트랜잭션 실행
   */
  async transaction(callback) {
    const t = await this.sequelize.transaction();

    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      logger.error(`transaction error: ${error.message}`);
      throw new AppError(`Transaction failed: ${error.message}`, 500);
    }
  }

  /**
   * Mongoose 스타일 정렬을 Sequelize 스타일로 변환
   * @private
   */
  _convertSort(sort) {
    if (typeof sort === 'string') {
      // 'createdAt' or '-createdAt'
      if (sort.startsWith('-')) {
        return [[sort.substring(1), 'DESC']];
      }
      return [[sort, 'ASC']];
    }

    if (typeof sort === 'object' && !Array.isArray(sort)) {
      // { createdAt: -1, name: 1 }
      return Object.entries(sort).map(([field, direction]) => [
        field,
        direction === -1 ? 'DESC' : 'ASC',
      ]);
    }

    // Already in Sequelize format or array
    return sort;
  }
}

module.exports = SequelizeAdapter;
