# Database Abstraction Layer NPM Package Plan

## 1. 패키지 개요

### 패키지명
`@yourname/db-abstraction` (또는 `universal-db-adapter`)

### 목적
**하나의 코드로 모든 데이터베이스를 사용할 수 있는 추상화 레이어**
- MongoDB ↔ PostgreSQL ↔ MySQL 전환 시 코드 변경 없음
- Repository Pattern 기반 통일된 인터페이스
- 환경 변수만으로 DB 전환 가능

### 핵심 가치
```javascript
// 개발자는 이 코드만 작성
const userRepo = createRepository('User', UserSchema);
const user = await userRepo.findById(id);

// DB 전환: .env만 수정
// DB_TYPE=mongodb → DB_TYPE=postgresql
// 코드는 그대로!
```

---

## 2. 패키지 구조

```
@yourname/db-abstraction/
├── src/
│   ├── core/
│   │   ├── Repository.js           # 기본 Repository 인터페이스
│   │   ├── BaseRepository.js       # 공통 Repository 구현
│   │   └── QueryBuilder.js         # DB 독립적 쿼리 빌더
│   │
│   ├── adapters/
│   │   ├── MongooseAdapter.js      # MongoDB 어댑터
│   │   ├── SequelizeAdapter.js     # PostgreSQL/MySQL 어댑터
│   │   ├── PrismaAdapter.js        # Prisma 어댑터 (향후)
│   │   └── index.js
│   │
│   ├── connection/
│   │   ├── ConnectionManager.js    # DB 연결 관리자
│   │   ├── PoolManager.js          # Connection Pool 관리
│   │   └── HealthCheck.js          # DB Health Check
│   │
│   ├── utils/
│   │   ├── SchemaMapper.js         # 스키마 변환 유틸
│   │   ├── DataTransformer.js      # 데이터 변환 (_id ↔ id)
│   │   └── ErrorHandler.js         # 에러 핸들링
│   │
│   └── index.js                     # 메인 export
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── examples/
│   ├── mongodb-example/
│   ├── postgresql-example/
│   └── migration-example/          # DB 전환 예제
│
├── docs/
│   ├── API.md
│   ├── GUIDE.md
│   └── MIGRATION.md
│
├── package.json
├── README.md
└── LICENSE
```

---

## 3. 핵심 모듈 설계

### 3.1 Repository Interface (Day 2 - Part 1)

```javascript
// src/core/Repository.js
class Repository {
  // CRUD
  async findById(id, options = {}) {}
  async findOne(query, options = {}) {}
  async findAll(query = {}, options = {}) {}
  async create(data) {}
  async update(id, data) {}
  async delete(id) {}
  
  // Bulk Operations
  async bulkCreate(dataArray) {}
  async bulkUpdate(updates) {}
  async bulkDelete(ids) {}
  
  // Query
  async count(query = {}) {}
  async exists(query) {}
  async paginate(query, { page, limit }) {}
  
  // Transaction
  async transaction(callback) {}
}
```

### 3.2 Mongoose Adapter (Day 2 - Part 2)

```javascript
// src/adapters/MongooseAdapter.js
import { Repository } from '../core/Repository.js';

class MongooseAdapter extends Repository {
  constructor(model) {
    super();
    this.model = model;
  }
  
  async findById(id, options = {}) {
    const { populate } = options;
    let query = this.model.findById(id);
    
    if (populate) {
      query = query.populate(populate);
    }
    
    return this._transform(await query.exec());
  }
  
  async create(data) {
    const doc = await this.model.create(data);
    return this._transform(doc);
  }
  
  // MongoDB ObjectId → 일반 id 변환
  _transform(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      ...obj,
      id: obj._id.toString(),
      _id: undefined
    };
  }
}
```

### 3.3 Sequelize Adapter (Day 3 - Part 1)

```javascript
// src/adapters/SequelizeAdapter.js
import { Repository } from '../core/Repository.js';

class SequelizeAdapter extends Repository {
  constructor(model) {
    super();
    this.model = model;
  }
  
  async findById(id, options = {}) {
    const { include } = options;
    
    return await this.model.findByPk(id, {
      include: this._buildIncludes(include)
    });
  }
  
  async create(data) {
    return await this.model.create(data);
  }
  
  async transaction(callback) {
    const sequelize = this.model.sequelize;
    const t = await sequelize.transaction();
    
    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
  
  _buildIncludes(populate) {
    // populate 배열 → Sequelize include 변환
    // 예: ['author', 'comments'] → [{ model: Author }, { model: Comment }]
  }
}
```

### 3.4 Connection Manager (Day 3 - Part 2)

```javascript
// src/connection/ConnectionManager.js
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

class ConnectionManager {
  static instance = null;
  static connections = {};
  
  static async connect(config = {}) {
    const dbType = config.type || process.env.DB_TYPE;
    
    if (this.connections[dbType]) {
      return this.connections[dbType];
    }
    
    switch (dbType) {
      case 'mongodb':
        return await this._connectMongoDB(config);
      case 'postgresql':
      case 'mysql':
      case 'sqlite':
        return await this._connectSQL(dbType, config);
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
  
  static async _connectMongoDB(config) {
    const uri = config.uri || process.env.DB_URI || 
                `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    
    await mongoose.connect(uri, {
      maxPoolSize: config.poolSize || 10,
      serverSelectionTimeoutMS: 5000
    });
    
    this.connections.mongodb = mongoose.connection;
    return mongoose.connection;
  }
  
  static async _connectSQL(dialect, config) {
    const sequelize = new Sequelize(
      config.database || process.env.DB_NAME,
      config.username || process.env.DB_USER,
      config.password || process.env.DB_PASSWORD,
      {
        host: config.host || process.env.DB_HOST,
        port: config.port || process.env.DB_PORT,
        dialect,
        pool: {
          max: config.poolSize || 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        logging: config.logging || false
      }
    );
    
    await sequelize.authenticate();
    
    this.connections[dialect] = sequelize;
    return sequelize;
  }
  
  static async disconnect(dbType) {
    const connection = this.connections[dbType];
    if (!connection) return;
    
    if (dbType === 'mongodb') {
      await mongoose.disconnect();
    } else {
      await connection.close();
    }
    
    delete this.connections[dbType];
  }
  
  static async healthCheck(dbType) {
    const connection = this.connections[dbType];
    if (!connection) return { healthy: false, message: 'Not connected' };
    
    try {
      if (dbType === 'mongodb') {
        await mongoose.connection.db.admin().ping();
      } else {
        await connection.authenticate();
      }
      return { healthy: true };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }
}

export default ConnectionManager;
```

### 3.5 Query Builder (Day 3 - Part 3)

```javascript
// src/core/QueryBuilder.js
class QueryBuilder {
  constructor(adapter) {
    this.adapter = adapter;
    this.conditions = [];
    this.sortOptions = [];
    this.limitValue = null;
    this.skipValue = null;
    this.populateFields = [];
  }
  
  // 체이닝 메서드
  where(field, operator, value) {
    // 2개 인자: where('age', 18) → age = 18
    // 3개 인자: where('age', '>', 18) → age > 18
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    
    this.conditions.push({ field, operator, value });
    return this;
  }
  
  orderBy(field, direction = 'ASC') {
    this.sortOptions.push({ field, direction });
    return this;
  }
  
  limit(count) {
    this.limitValue = count;
    return this;
  }
  
  skip(count) {
    this.skipValue = count;
    return this;
  }
  
  populate(fields) {
    this.populateFields = Array.isArray(fields) ? fields : [fields];
    return this;
  }
  
  // 실행
  async execute() {
    // Adapter별로 쿼리 변환
    if (this.adapter.type === 'mongodb') {
      return this._executeMongoQuery();
    } else {
      return this._executeSQLQuery();
    }
  }
  
  _executeMongoQuery() {
    const query = {};
    
    // where 조건 변환
    this.conditions.forEach(({ field, operator, value }) => {
      switch (operator) {
        case '=':
          query[field] = value;
          break;
        case '>':
          query[field] = { $gt: value };
          break;
        case '>=':
          query[field] = { $gte: value };
          break;
        case '<':
          query[field] = { $lt: value };
          break;
        case '<=':
          query[field] = { $lte: value };
          break;
        case '!=':
          query[field] = { $ne: value };
          break;
        case 'in':
          query[field] = { $in: value };
          break;
      }
    });
    
    // sort 변환
    const sort = {};
    this.sortOptions.forEach(({ field, direction }) => {
      sort[field] = direction === 'DESC' ? -1 : 1;
    });
    
    return this.adapter.model
      .find(query)
      .sort(sort)
      .limit(this.limitValue)
      .skip(this.skipValue)
      .populate(this.populateFields);
  }
  
  _executeSQLQuery() {
    const where = {};
    
    // Sequelize where 조건 변환
    this.conditions.forEach(({ field, operator, value }) => {
      // Sequelize Op 사용
      const { Op } = require('sequelize');
      
      switch (operator) {
        case '=':
          where[field] = value;
          break;
        case '>':
          where[field] = { [Op.gt]: value };
          break;
        case '>=':
          where[field] = { [Op.gte]: value };
          break;
        case '<':
          where[field] = { [Op.lt]: value };
          break;
        case '<=':
          where[field] = { [Op.lte]: value };
          break;
        case '!=':
          where[field] = { [Op.ne]: value };
          break;
        case 'in':
          where[field] = { [Op.in]: value };
          break;
      }
    });
    
    // Sequelize order 변환
    const order = this.sortOptions.map(({ field, direction }) => [field, direction]);
    
    return this.adapter.model.findAll({
      where,
      order,
      limit: this.limitValue,
      offset: this.skipValue,
      include: this._buildIncludes()
    });
  }
}

export default QueryBuilder;
```

### 3.6 메인 Export (index.js)

```javascript
// src/index.js
import ConnectionManager from './connection/ConnectionManager.js';
import MongooseAdapter from './adapters/MongooseAdapter.js';
import SequelizeAdapter from './adapters/SequelizeAdapter.js';
import QueryBuilder from './core/QueryBuilder.js';

// 편의 함수
export function createRepository(model, schema, options = {}) {
  const dbType = options.type || process.env.DB_TYPE;
  
  switch (dbType) {
    case 'mongodb':
      return new MongooseAdapter(model);
    case 'postgresql':
    case 'mysql':
    case 'sqlite':
      return new SequelizeAdapter(model);
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}

export function query(repository) {
  return new QueryBuilder(repository);
}

export {
  ConnectionManager,
  MongooseAdapter,
  SequelizeAdapter,
  QueryBuilder
};

// Default export
export default {
  createRepository,
  query,
  ConnectionManager,
  MongooseAdapter,
  SequelizeAdapter,
  QueryBuilder
};
```

---

## 4. 사용 예제

### 4.1 기본 사용법

```javascript
import { ConnectionManager, createRepository } from '@yourname/db-abstraction';
import UserModel from './models/User.js';

// 1. DB 연결
await ConnectionManager.connect({
  type: 'mongodb', // 또는 'postgresql'
  uri: process.env.DB_URI
});

// 2. Repository 생성
const userRepo = createRepository(UserModel);

// 3. CRUD 작업 (DB 독립적!)
const user = await userRepo.findById('123');
const newUser = await userRepo.create({ name: 'John', email: 'john@example.com' });
const users = await userRepo.paginate({}, { page: 1, limit: 10 });
```

### 4.2 고급 쿼리

```javascript
import { query } from '@yourname/db-abstraction';

// MongoDB, PostgreSQL 모두 동작하는 쿼리
const activeUsers = await query(userRepo)
  .where('status', '=', 'active')
  .where('age', '>', 18)
  .orderBy('createdAt', 'DESC')
  .limit(10)
  .populate(['profile', 'posts'])
  .execute();
```

### 4.3 트랜잭션

```javascript
// MongoDB, PostgreSQL 모두 동작
await userRepo.transaction(async (session) => {
  const user = await userRepo.create({ name: 'John' }, { session });
  const profile = await profileRepo.create({ userId: user.id }, { session });
  return { user, profile };
});
```

---

## 5. 개발 일정 (상세)

### **Day 2: NoSQL Foundation (8시간)**

#### Part 1: Repository Interface (3시간)
- [ ] `Repository.js` - 기본 인터페이스 정의
- [ ] `BaseRepository.js` - 공통 로직 구현
- [ ] 테스트 케이스 작성

#### Part 2: Mongoose Adapter (5시간)
- [ ] `MongooseAdapter.js` - CRUD 구현
- [ ] `_transform()` - ObjectId → id 변환
- [ ] populate, aggregate 지원
- [ ] 에러 핸들링
- [ ] 단위 테스트

---

### **Day 3: SQL Support & Infrastructure (8시간)**

#### Part 1: Sequelize Adapter (3시간)
- [ ] `SequelizeAdapter.js` - CRUD 구현
- [ ] include (JOIN) 처리
- [ ] 트랜잭션 지원
- [ ] 단위 테스트

#### Part 2: Connection Manager (2시간)
- [ ] `ConnectionManager.js` - 연결 관리
- [ ] MongoDB/PostgreSQL/MySQL 지원
- [ ] Connection Pool 설정
- [ ] Health Check

#### Part 3: Query Builder (3시간)
- [ ] `QueryBuilder.js` - 체이닝 API
- [ ] MongoDB 쿼리 변환
- [ ] SQL 쿼리 변환
- [ ] 통합 테스트

---

## 6. package.json

```json
{
  "name": "@yourname/db-abstraction",
  "version": "1.0.0",
  "description": "Database abstraction layer for MongoDB, PostgreSQL, MySQL",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "keywords": [
    "database",
    "orm",
    "mongodb",
    "postgresql",
    "mysql",
    "abstraction",
    "repository-pattern"
  ],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "mongoose": "^8.0.0",
    "sequelize": "^6.35.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 7. 환경 변수 설정

```bash
# .env.example

# Database Type (required)
DB_TYPE=mongodb  # or 'postgresql', 'mysql', 'sqlite'

# MongoDB
DB_URI=mongodb://localhost:27017/mydb
# or
DB_HOST=localhost
DB_PORT=27017
DB_NAME=mydb

# PostgreSQL/MySQL
DB_HOST=localhost
DB_PORT=5432  # 3306 for MySQL
DB_NAME=mydb
DB_USER=admin
DB_PASSWORD=password

# Connection Pool
DB_POOL_SIZE=10
```

---

## 8. 테스트 전략

### 8.1 단위 테스트
```javascript
// tests/unit/MongooseAdapter.test.js
describe('MongooseAdapter', () => {
  it('should transform _id to id', async () => {
    const adapter = new MongooseAdapter(UserModel);
    const user = await adapter.findById('123');
    expect(user).toHaveProperty('id');
    expect(user).not.toHaveProperty('_id');
  });
});
```

### 8.2 통합 테스트
```javascript
// tests/integration/repository.test.js
describe('Repository with different databases', () => {
  test('MongoDB CRUD', async () => { /* ... */ });
  test('PostgreSQL CRUD', async () => { /* ... */ });
  test('MySQL CRUD', async () => { /* ... */ });
});
```

### 8.3 E2E 테스트
```javascript
// tests/e2e/migration.test.js
describe('Database Migration', () => {
  it('should migrate from MongoDB to PostgreSQL', async () => {
    // MongoDB에서 데이터 읽기
    // PostgreSQL에 데이터 쓰기
    // 검증
  });
});
```

---

## 9. 문서화

### 9.1 README.md
- 빠른 시작 가이드
- 설치 방법
- 기본 사용법
- API 레퍼런스 링크

### 9.2 API.md
- 모든 메서드 상세 설명
- 파라미터 및 반환값
- 예제 코드

### 9.3 GUIDE.md
- 개념 설명 (Repository Pattern, Adapter Pattern)
- 고급 사용법 (트랜잭션, 복잡한 쿼리)
- 성능 최적화 팁

### 9.4 MIGRATION.md
- MongoDB → PostgreSQL 마이그레이션 가이드
- 스키마 변환 예제
- 주의사항

---

## 10. 배포 계획

### 10.1 NPM 배포
```bash
npm login
npm publish --access public
```

### 10.2 버전 관리
- v1.0.0: MongoDB + PostgreSQL 지원
- v1.1.0: MySQL 지원 추가
- v1.2.0: Prisma Adapter 추가
- v2.0.0: TypeScript 마이그레이션

---

## 11. 성공 지표

### 11.1 기능적 목표
✅ MongoDB ↔ PostgreSQL 코드 변경 없이 전환  
✅ 10개 이상의 CRUD 메서드 제공  
✅ 트랜잭션 지원  
✅ Query Builder 지원  
✅ Connection Pool 관리  

### 11.2 품질 목표
✅ 테스트 커버리지 80% 이상  
✅ 완전한 문서화  
✅ 예제 프로젝트 3개 이상  
✅ NPM 배포 완료  

### 11.3 성능 목표
✅ 쿼리 응답 시간 < 100ms  
✅ 메모리 사용량 최소화  
✅ Connection Pool 효율적 관리  

---

## 12. 리스크 & 대응

| 리스크 | 대응 방안 |
|--------|----------|
| MongoDB/SQL 차이가 너무 큼 | 공통 기능만 추상화, DB별 특화 기능은 별도 제공 |
| 성능 오버헤드 | 벤치마크 테스트, 필요시 직접 Adapter 노출 |
| 복잡한 쿼리 지원 어려움 | 기본 쿼리만 Query Builder, 복잡한 건 native 쿼리 허용 |
| 유지보수 부담 | 명확한 테스트, 문서화, 커뮤니티 기여 유도 |

---

## 13. 다음 단계

1. ✅ Day 2 시작: Repository Interface + Mongoose Adapter
2. ✅ Day 3 시작: Sequelize Adapter + Connection Manager + Query Builder
3. 테스트 작성
4. 문서화
5. 예제 프로젝트 작성
6. NPM 배포

**시작할 준비 되셨나요? Day 2 작업부터 시작하시겠어요?** 🚀