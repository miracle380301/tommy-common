/**
 * Repository Interface
 * 모든 DB Adapter가 구현해야 하는 공통 메서드 정의
 */
class IRepository {
  /**
   * ID로 단일 문서 조회
   * @param {string} id - 문서 ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * 조건으로 단일 문서 조회
   * @param {Object} filter - 조회 조건
   * @returns {Promise<Object|null>}
   */
  async findOne(filter) {
    throw new Error('Method findOne() must be implemented');
  }

  /**
   * 여러 문서 조회
   * @param {Object} filter - 조회 조건
   * @param {Object} options - 옵션 (sort, limit, skip, populate, select)
   * @returns {Promise<Array>}
   */
  async findAll(filter, options = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  /**
   * 문서 생성
   * @param {Object} data - 생성할 데이터
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * 문서 수정
   * @param {string} id - 문서 ID
   * @param {Object} data - 수정할 데이터
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * 문서 삭제
   * @param {string} id - 문서 ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * 문서 개수 조회
   * @param {Object} filter - 조회 조건
   * @returns {Promise<number>}
   */
  async count(filter = {}) {
    throw new Error('Method count() must be implemented');
  }

  /**
   * 문서 존재 여부 확인
   * @param {Object} filter - 조회 조건
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    throw new Error('Method exists() must be implemented');
  }

  /**
   * 페이지네이션
   * @param {Object} filter - 조회 조건
   * @param {number} page - 페이지 번호
   * @param {number} limit - 페이지당 항목 수
   * @param {Object} options - 옵션 (sort, populate, select)
   * @returns {Promise<Object>} { data, total, page, limit, totalPages }
   */
  async paginate(filter, page, limit, options = {}) {
    throw new Error('Method paginate() must be implemented');
  }

  /**
   * 대량 생성
   * @param {Array} dataArray - 생성할 데이터 배열
   * @returns {Promise<Array>}
   */
  async bulkCreate(dataArray) {
    throw new Error('Method bulkCreate() must be implemented');
  }

  /**
   * 대량 수정
   * @param {Object} filter - 조회 조건
   * @param {Object} data - 수정할 데이터
   * @returns {Promise<number>} 수정된 문서 수
   */
  async bulkUpdate(filter, data) {
    throw new Error('Method bulkUpdate() must be implemented');
  }

  /**
   * 대량 삭제
   * @param {Object} filter - 조회 조건
   * @returns {Promise<number>} 삭제된 문서 수
   */
  async bulkDelete(filter) {
    throw new Error('Method bulkDelete() must be implemented');
  }

  /**
   * 트랜잭션 실행
   * @param {Function} callback - 트랜잭션 내에서 실행할 콜백
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    throw new Error('Method transaction() must be implemented');
  }
}

module.exports = IRepository;
