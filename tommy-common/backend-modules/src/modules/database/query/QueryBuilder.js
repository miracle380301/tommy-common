const { Op } = require('sequelize');

/**
 * Query Builder
 * DB 독립적인 쿼리 작성 DSL
 * MongoDB와 Sequelize 양쪽 모두 지원
 */
class QueryBuilder {
  constructor() {
    this.conditions = [];
    this.sortOptions = [];
    this.limitValue = null;
    this.skipValue = null;
    this.selectFields = null;
  }

  /**
   * WHERE 조건 추가
   * @param {string} field - 필드명
   * @param {string} operator - 연산자 (=, !=, >, >=, <, <=, like, in, between)
   * @param {*} value - 값
   */
  where(field, operator, value) {
    this.conditions.push({ field, operator, value });
    return this;
  }

  /**
   * WHERE IN 조건
   * @param {string} field - 필드명
   * @param {Array} values - 값 배열
   */
  whereIn(field, values) {
    return this.where(field, 'in', values);
  }

  /**
   * WHERE BETWEEN 조건
   * @param {string} field - 필드명
   * @param {*} min - 최소값
   * @param {*} max - 최대값
   */
  whereBetween(field, min, max) {
    return this.where(field, 'between', [min, max]);
  }

  /**
   * ORDER BY 추가
   * @param {string} field - 정렬 필드
   * @param {string} direction - 정렬 방향 (ASC, DESC)
   */
  orderBy(field, direction = 'ASC') {
    this.sortOptions.push({ field, direction: direction.toUpperCase() });
    return this;
  }

  /**
   * LIMIT 설정
   * @param {number} limit - 제한 개수
   */
  limit(limit) {
    this.limitValue = limit;
    return this;
  }

  /**
   * SKIP/OFFSET 설정
   * @param {number} skip - 건너뛸 개수
   */
  skip(skip) {
    this.skipValue = skip;
    return this;
  }

  /**
   * SELECT 필드 설정
   * @param {Array|string} fields - 선택할 필드들
   */
  select(fields) {
    this.selectFields = Array.isArray(fields) ? fields : fields.split(' ');
    return this;
  }

  /**
   * 쿼리 빌드
   * @param {string} dbType - 데이터베이스 타입 (mongodb, sequelize)
   * @returns {Object} DB 타입에 맞는 쿼리 객체
   */
  build(dbType = 'mongodb') {
    if (dbType === 'mongodb') {
      return this._buildMongoQuery();
    } else {
      return this._buildSequelizeQuery();
    }
  }

  /**
   * MongoDB 쿼리 생성
   * @private
   */
  _buildMongoQuery() {
    const query = {};
    const options = {};

    // WHERE 조건 변환
    const filter = {};
    for (const condition of this.conditions) {
      const mongoOp = this._mongoOperatorMap[condition.operator];
      if (!mongoOp) {
        throw new Error(`Unsupported operator for MongoDB: ${condition.operator}`);
      }

      if (condition.operator === '=') {
        filter[condition.field] = condition.value;
      } else if (condition.operator === 'in') {
        filter[condition.field] = { $in: condition.value };
      } else if (condition.operator === 'between') {
        filter[condition.field] = {
          $gte: condition.value[0],
          $lte: condition.value[1],
        };
      } else if (condition.operator === 'like') {
        filter[condition.field] = { $regex: condition.value, $options: 'i' };
      } else {
        filter[condition.field] = { [mongoOp]: condition.value };
      }
    }

    // 정렬 옵션
    if (this.sortOptions.length > 0) {
      const sort = {};
      for (const sortOpt of this.sortOptions) {
        sort[sortOpt.field] = sortOpt.direction === 'DESC' ? -1 : 1;
      }
      options.sort = sort;
    }

    // LIMIT, SKIP
    if (this.limitValue !== null) {
      options.limit = this.limitValue;
    }
    if (this.skipValue !== null) {
      options.skip = this.skipValue;
    }

    // SELECT
    if (this.selectFields) {
      options.select = this.selectFields.join(' ');
    }

    return { filter, options };
  }

  /**
   * Sequelize 쿼리 생성
   * @private
   */
  _buildSequelizeQuery() {
    const query = { where: {} };

    // WHERE 조건 변환
    for (const condition of this.conditions) {
      const seqOp = this._sequelizeOperatorMap[condition.operator];
      if (!seqOp) {
        throw new Error(`Unsupported operator for Sequelize: ${condition.operator}`);
      }

      if (condition.operator === '=') {
        query.where[condition.field] = condition.value;
      } else if (condition.operator === 'in') {
        query.where[condition.field] = { [Op.in]: condition.value };
      } else if (condition.operator === 'between') {
        query.where[condition.field] = {
          [Op.between]: condition.value,
        };
      } else if (condition.operator === 'like') {
        query.where[condition.field] = { [Op.like]: `%${condition.value}%` };
      } else {
        query.where[condition.field] = { [seqOp]: condition.value };
      }
    }

    // 정렬 옵션
    if (this.sortOptions.length > 0) {
      query.order = this.sortOptions.map((sortOpt) => [
        sortOpt.field,
        sortOpt.direction,
      ]);
    }

    // LIMIT, OFFSET
    if (this.limitValue !== null) {
      query.limit = this.limitValue;
    }
    if (this.skipValue !== null) {
      query.offset = this.skipValue;
    }

    // SELECT
    if (this.selectFields) {
      query.attributes = this.selectFields;
    }

    return query;
  }

  /**
   * MongoDB 연산자 매핑
   * @private
   */
  get _mongoOperatorMap() {
    return {
      '=': '$eq',
      '!=': '$ne',
      '>': '$gt',
      '>=': '$gte',
      '<': '$lt',
      '<=': '$lte',
      in: '$in',
      like: '$regex',
      between: '$gte/$lte',
    };
  }

  /**
   * Sequelize 연산자 매핑
   * @private
   */
  get _sequelizeOperatorMap() {
    return {
      '=': Op.eq,
      '!=': Op.ne,
      '>': Op.gt,
      '>=': Op.gte,
      '<': Op.lt,
      '<=': Op.lte,
      in: Op.in,
      like: Op.like,
      between: Op.between,
    };
  }

  /**
   * 쿼리 리셋
   */
  reset() {
    this.conditions = [];
    this.sortOptions = [];
    this.limitValue = null;
    this.skipValue = null;
    this.selectFields = null;
    return this;
  }
}

module.exports = QueryBuilder;
