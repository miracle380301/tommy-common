/**
 * Multi-Database Example
 *
 * 이 예제는 환경 변수 DB_TYPE을 변경하는 것만으로
 * MongoDB와 PostgreSQL/MySQL을 전환할 수 있음을 보여줍니다.
 *
 * 사용법:
 *
 * MongoDB:
 * DB_TYPE=mongodb node examples/multi-db-example.js
 *
 * PostgreSQL:
 * DB_TYPE=postgresql DB_HOST=localhost DB_NAME=mydb DB_USER=postgres DB_PASSWORD=password node examples/multi-db-example.js
 *
 * MySQL:
 * DB_TYPE=mysql DB_HOST=localhost DB_NAME=mydb DB_USER=root DB_PASSWORD=password node examples/multi-db-example.js
 *
 * SQLite (개발/테스트용):
 * DB_TYPE=sqlite node examples/multi-db-example.js
 */

require('dotenv').config();
const { connect, disconnect, createRepository, getCurrentDbType, sync, QueryBuilder } = require('../src/modules/database');
const { logger } = require('../src/core/logger');

async function runExample() {
  try {
    // 1. 데이터베이스 연결 (DB_TYPE에 따라 자동 선택)
    logger.info('=== Connecting to database ===');
    await connect();
    const dbType = getCurrentDbType();
    logger.info(`Connected to: ${dbType}`);

    // 2. 모델 정의 (DB 타입에 따라 다름)
    let User;
    let userRepository;

    if (dbType === 'mongodb') {
      // MongoDB: Mongoose 모델 사용
      const mongoose = require('mongoose');
      const UserSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        age: { type: Number },
        status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
      }, { timestamps: true });

      User = mongoose.model('User', UserSchema);
      logger.info('Using Mongoose model');
    } else {
      // PostgreSQL/MySQL/SQLite: Sequelize 모델 사용
      const { ConnectionManager } = require('../src/modules/database');
      const sequelize = ConnectionManager.getSequelize();
      const createUserModel = require('./models/UserSequelize');
      User = createUserModel(sequelize);

      // 개발 환경에서만 테이블 자동 생성
      if (process.env.NODE_ENV === 'development') {
        await sync({ alter: true });
        logger.info('Database synchronized');
      }

      logger.info('Using Sequelize model');
    }

    // 3. Repository 생성 (자동으로 적절한 Adapter 선택)
    userRepository = createRepository(User);
    logger.info('Repository created');

    // 4. CRUD 작업 (DB 타입과 무관하게 동일한 코드!)
    logger.info('\n=== Creating users ===');
    const user1 = await userRepository.create({
      name: 'John Doe',
      email: `john.${Date.now()}@example.com`,
      age: 30,
      status: 'active',
    });
    logger.info(`Created user: ${user1.name} (ID: ${user1.id || user1._id})`);

    const user2 = await userRepository.create({
      name: 'Jane Smith',
      email: `jane.${Date.now()}@example.com`,
      age: 25,
      status: 'active',
    });
    logger.info(`Created user: ${user2.name} (ID: ${user2.id || user2._id})`);

    // 5. 조회
    logger.info('\n=== Finding users ===');
    const allUsers = await userRepository.findAll();
    logger.info(`Total users: ${allUsers.length}`);

    // 6. Query Builder 사용 (DB 독립적 쿼리)
    logger.info('\n=== Using Query Builder ===');
    const qb = new QueryBuilder();
    const { filter, options } = qb
      .where('status', '=', 'active')
      .where('age', '>=', 18)
      .orderBy('createdAt', 'DESC')
      .limit(10)
      .build(dbType);

    logger.info('Query built:', JSON.stringify({ filter, options }, null, 2));

    const activeUsers = await userRepository.findAll(filter, options);
    logger.info(`Active users (age >= 18): ${activeUsers.length}`);

    // 7. 페이지네이션
    logger.info('\n=== Pagination ===');
    const page1 = await userRepository.paginate({}, 1, 5, { sort: '-createdAt' });
    logger.info(`Page 1: ${page1.data.length} users (total: ${page1.total}, pages: ${page1.totalPages})`);

    // 8. 수정
    logger.info('\n=== Updating user ===');
    const userId = user1.id || user1._id;
    const updated = await userRepository.update(userId, { age: 31 });
    logger.info(`Updated user age to: ${updated.age}`);

    // 9. 개수 확인
    logger.info('\n=== Counting ===');
    const count = await userRepository.count({ status: 'active' });
    logger.info(`Active users count: ${count}`);

    // 10. 삭제
    logger.info('\n=== Deleting user ===');
    const deleted = await userRepository.delete(userId);
    logger.info(`User deleted: ${deleted}`);

    // 11. 트랜잭션 예제
    logger.info('\n=== Transaction example ===');
    try {
      await userRepository.transaction(async (t) => {
        // 트랜잭션 내에서 작업 수행
        const user3 = await userRepository.create({
          name: 'Transaction User',
          email: `trans.${Date.now()}@example.com`,
          age: 28,
        });
        logger.info(`Created in transaction: ${user3.name}`);

        // 예제: 에러 발생 시 롤백
        // throw new Error('Test rollback');
      });
      logger.info('Transaction completed successfully');
    } catch (error) {
      logger.error(`Transaction failed: ${error.message}`);
    }

    logger.info('\n=== Example completed successfully ===');
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    logger.error(error.stack);
  } finally {
    // 연결 해제
    await disconnect();
    logger.info('Database disconnected');
  }
}

// 실행
if (require.main === module) {
  runExample()
    .then(() => {
      logger.info('All done!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = runExample;
