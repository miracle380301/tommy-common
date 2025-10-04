const MongooseAdapter = require('./adapters/MongooseAdapter');
const SequelizeAdapter = require('./adapters/SequelizeAdapter');
const mongooseConnection = require('./connection/MongooseConnection');
const sequelizeConnection = require('./connection/SequelizeConnection');
const ConnectionManager = require('./connection/ConnectionManager');
const QueryBuilder = require('./query/QueryBuilder');

/**
 * 자동 연결 (DB_TYPE 기반)
 * 환경 변수에 설정된 DB_TYPE에 따라 자동으로 연결
 * @returns {Promise<Object>} 연결 객체
 */
async function connect() {
  return ConnectionManager.connect();
}

/**
 * 자동 Repository 생성 (DB_TYPE 기반)
 * 현재 연결된 데이터베이스에 맞는 Adapter를 자동으로 선택
 * @param {Object} model - Mongoose Model 또는 Sequelize Model
 * @returns {IRepository} Repository Adapter
 */
function createRepository(model) {
  return ConnectionManager.getAdapter(model);
}

/**
 * 연결 해제
 * @returns {Promise<void>}
 */
async function disconnect() {
  return ConnectionManager.disconnect();
}

/**
 * Health Check
 * @returns {Promise<Object>} 상태 정보
 */
async function healthCheck() {
  return ConnectionManager.healthCheck();
}

/**
 * 데이터베이스 동기화 (Sequelize 전용, 개발용)
 * @param {Object} options - 동기화 옵션
 * @returns {Promise<void>}
 */
async function sync(options = {}) {
  return ConnectionManager.sync(options);
}

/**
 * 현재 DB 타입 확인
 * @returns {string} 현재 연결된 DB 타입
 */
function getCurrentDbType() {
  return ConnectionManager.getCurrentDbType();
}

/**
 * Legacy 연결 API (하위 호환성)
 * @deprecated 새 코드에서는 connect() 사용 권장
 */
const connection = {
  connect: (uri, options) => mongooseConnection.connect(uri, options),
  disconnect: () => mongooseConnection.disconnect(),
  healthCheck: () => mongooseConnection.healthCheck(),
  getConnection: () => mongooseConnection.getConnection(),
};

module.exports = {
  // 자동 연결 API (권장)
  connect,
  disconnect,
  createRepository,
  healthCheck,
  sync,
  getCurrentDbType,

  // Legacy API (하위 호환성)
  connection,

  // Adapters
  MongooseAdapter,
  SequelizeAdapter,

  // 연결 관리자 (고급 사용)
  ConnectionManager,
  mongooseConnection,
  sequelizeConnection,

  // Query Builder
  QueryBuilder,
};
