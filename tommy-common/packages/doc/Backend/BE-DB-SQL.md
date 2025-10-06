Day 3: DB 추상화 레이어 (2) - Sequelize Adapter & Connection Manager
📋 목표
SQL 데이터베이스(PostgreSQL, MySQL)를 위한 Sequelize Adapter 구현 및 DB 타입에 따른 자동 연결 관리
📁 디렉토리 구조
src/modules/database/
├── adapters/
│   ├── MongooseAdapter.js      # (Day 2 완성)
│   └── SequelizeAdapter.js     # 신규
├── connection/
│   ├── MongooseConnection.js   # (Day 2 완성)
│   ├── SequelizeConnection.js  # 신규
│   └── ConnectionManager.js    # 신규 - DB 타입별 자동 연결
├── query/
│   └── QueryBuilder.js         # 신규 - DB 독립적 쿼리
└── index.js                    # 업데이트
🎯 구현 모듈
3.1 Sequelize Adapter
파일 위치: src/modules/database/adapters/SequelizeAdapter.js
목적: IRepository를 Sequelize로 구현 (PostgreSQL, MySQL, SQLite 지원)
생성자:
javascriptnew SequelizeAdapter(model)

model: Sequelize Model 인스턴스

구현 세부사항:

findById(id)

Model.findByPk(id) 사용
null 가능


findOne(filter)

Model.findOne({ where: filter }) 사용


findAll(filter, options)

Sequelize 옵션으로 변환:



javascript   {
     where: filter,
     order: options.sort,      // [['createdAt', 'DESC']]
     limit: options.limit,
     offset: options.skip,
     include: options.populate  // Sequelize associations
   }

create(data)

Model.create(data) 사용
Unique 제약 에러 → 409 상태 코드


update(id, data)

Model.update(data, { where: { id }, returning: true }) 사용
PostgreSQL: returning 지원
MySQL: 업데이트 후 다시 조회


delete(id)

Model.destroy({ where: { id } }) 사용
삭제된 행 수 > 0이면 true


count(filter)

Model.count({ where: filter }) 사용


exists(filter)

count로 구현: count(filter) > 0


paginate(filter, page, limit, options)

Model.findAndCountAll() 사용
offset 계산


bulkCreate(dataArray)

Model.bulkCreate(dataArray) 사용


bulkUpdate(filter, data)

Model.update(data, { where: filter }) 사용
수정된 행 수 반환


bulkDelete(filter)

Model.destroy({ where: filter }) 사용
삭제된 행 수 반환


transaction(callback)

Sequelize Transaction 사용:



javascript    const t = await sequelize.transaction();
    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
Mongoose → Sequelize 변환:
MongooseSequelize{ age: { $gte: 18 } }{ age: { [Op.gte]: 18 } }{ createdAt: -1 } (sort)[['createdAt', 'DESC']]populate('author')include: [{ model: Author }]
3.2 Sequelize 연결 관리
파일 위치: src/modules/database/connection/SequelizeConnection.js
기능:

connect(config)

Sequelize 인스턴스 생성
설정:



javascript   {
     database: 'mydb',
     username: 'user',
     password: 'pass',
     host: 'localhost',
     port: 5432,
     dialect: 'postgres',  // 'mysql', 'sqlite'
     logging: false,       // 프로덕션에서는 false
     pool: {
       max: 5,
       min: 0,
       acquire: 30000,
       idle: 10000
     }
   }

authenticate() 호출로 연결 테스트


disconnect()

sequelize.close() 호출


getSequelize()

Sequelize 인스턴스 반환


healthCheck()

authenticate() 호출
성공 시 { status: 'connected' }


sync(options)

sequelize.sync(options) 호출
개발 시에만 사용 (자동 테이블 생성)
옵션: { force: true, alter: true }



3.3 Connection Manager (핵심!)
파일 위치: src/modules/database/connection/ConnectionManager.js
목적: 환경 변수에 따라 자동으로 적절한 DB 연결
기능:

connect()

DB_TYPE 환경 변수 읽기
타입별 분기:



javascript   switch (config.DB_TYPE) {
     case 'mongodb':
       return MongooseConnection.connect(config.DB_URI);
     case 'postgresql':
     case 'mysql':
     case 'sqlite':
       return SequelizeConnection.connect({
         database: config.DB_NAME,
         username: config.DB_USER,
         password: config.DB_PASSWORD,
         host: config.DB_HOST,
         dialect: config.DB_TYPE,
       });
     default:
       throw new Error(`Unsupported DB_TYPE: ${config.DB_TYPE}`);
   }

disconnect()

현재 연결된 DB 타입에 따라 적절한 disconnect 호출


getAdapter(model)

DB 타입에 따라 적절한 Adapter 반환:



javascript   if (config.DB_TYPE === 'mongodb') {
     return new MongooseAdapter(model);
   } else {
     return new SequelizeAdapter(model);
   }

healthCheck()

현재 DB의 health check 호출



환경 변수 추가:
# MongoDB
DB_TYPE=mongodb
DB_URI=mongodb://localhost:27017/mydb

# PostgreSQL
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=password

# MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mydb
DB_USER=root
DB_PASSWORD=password
3.4 Query Builder (선택 사항)
파일 위치: src/modules/database/query/QueryBuilder.js
목적: DB 독립적인 쿼리 작성 DSL
사용 예:
javascriptconst query = new QueryBuilder()
  .where('status', '=', 'active')
  .where('age', '>', 18)
  .orderBy('createdAt', 'DESC')
  .limit(10)
  .build();

// MongoDB 결과: { status: 'active', age: { $gt: 18 } }
// Sequelize 결과: { where: { status: 'active', age: { [Op.gt]: 18 } }, order: [...], limit: 10 }
메서드:

where(field, operator, value)
whereIn(field, values)
whereBetween(field, min, max)
orderBy(field, direction)
limit(number)
skip(number)
build(dbType) - DB 타입에 맞게 변환

구현:

내부적으로 쿼리를 추상화된 형태로 저장
build() 호출 시 DB 타입에 맞게 변환
Mongoose와 Sequelize 연산자 매핑 테이블 유지

3.5 업데이트된 외부 API
파일 위치: src/modules/database/index.js
javascriptconst ConnectionManager = require('./connection/ConnectionManager');

// 자동 연결 (DB_TYPE 기반)
async function connect() {
  return ConnectionManager.connect();
}

// 자동 Repository 생성 (DB_TYPE 기반)
function createRepository(model) {
  return ConnectionManager.getAdapter(model);
}

// 연결 해제
async function disconnect() {
  return ConnectionManager.disconnect();
}

// Health Check
async function healthCheck() {
  return ConnectionManager.healthCheck();
}

module.exports = {
  connect,
  disconnect,
  createRepository,
  healthCheck,
};
📦 패키지 의존성
json"dependencies": {
  "mongoose": "^8.0.0",
  "sequelize": "^6.35.0",
  "pg": "^8.11.0",        // PostgreSQL
  "pg-hstore": "^2.3.4",  // PostgreSQL
  "mysql2": "^3.6.0",     // MySQL
  "sqlite3": "^5.1.0"     // SQLite (선택)
}
📝 사용 예제
파일 위치: examples/day3-multi-db.js
MongoDB 사용:
javascript// .env
// DB_TYPE=mongodb
// DB_URI=mongodb://localhost:27017/mydb

const { connect, createRepository } = require('../src/modules/database');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.model('User', UserSchema);

await connect();  // 자동으로 MongoDB 연결
const userRepo = createRepository(User);
await userRepo.create({ name: 'John', email: 'john@example.com' });
PostgreSQL 사용 (같은 코드!):
javascript// .env
// DB_TYPE=postgresql
// DB_HOST=localhost
// DB_NAME=mydb
// DB_USER=postgres
// DB_PASSWORD=password

const { connect, createRepository } = require('../src/modules/database');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(/* config */);
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING
});

await connect();  // 자동으로 PostgreSQL 연결
const userRepo = createRepository(User);
await userRepo.create({ name: 'John', email: 'john@example.com' });
// Repository 메서드는 동일!
✅ 완료 기준

 SequelizeAdapter가 IRepository 완전 구현
 PostgreSQL, MySQL 연결 정상 동작
 ConnectionManager가 DB_TYPE 기반 자동 연결
 MongoDB ↔ PostgreSQL 코드 변경 없이 .env만 수정으로 전환
 예제가 두 DB 모두에서 실행됨
 트랜잭션이 두 Adapter 모두 작동