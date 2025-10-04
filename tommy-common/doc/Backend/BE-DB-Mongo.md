Day 2: DB 추상화 레이어 (1) - Repository Pattern & Mongoose Adapter
📋 목표
데이터베이스 독립적인 Repository 패턴 구현 및 MongoDB(Mongoose) Adapter 개발
📁 디렉토리 구조
src/modules/database/
├── interfaces/
│   └── IRepository.js       # Repository 인터페이스
├── adapters/
│   └── MongooseAdapter.js   # Mongoose 구현체
├── connection/
│   └── MongooseConnection.js # MongoDB 연결 관리
└── index.js                 # 외부 노출 API
🎯 구현 모듈
2.1 Repository Interface
파일 위치: src/modules/database/interfaces/IRepository.js
목적: 모든 DB Adapter가 구현해야 하는 공통 메서드 정의
필수 메서드:
메서드파라미터반환값설명findByIdid: stringPromise<Object|null>ID로 단일 조회findOnefilter: ObjectPromise<Object|null>조건으로 단일 조회findAllfilter: Object, options: ObjectPromise<Array>여러 문서 조회createdata: ObjectPromise<Object>문서 생성updateid: string, data: ObjectPromise<Object|null>문서 수정deleteid: stringPromise<boolean>문서 삭제countfilter: ObjectPromise<number>문서 개수existsfilter: ObjectPromise<boolean>존재 여부paginatefilter, page, limit, optionsPromise<Object>페이지네이션bulkCreatedataArray: ArrayPromise<Array>대량 생성bulkUpdatefilter: Object, data: ObjectPromise<number>대량 수정bulkDeletefilter: ObjectPromise<number>대량 삭제transactioncallback: FunctionPromise<any>트랜잭션 실행
options 파라미터 (findAll, paginate):

sort: 정렬 (예: { createdAt: -1 })
limit: 개수 제한
skip: 건너뛰기
populate: 관계 데이터 로드 (Mongoose 전용)
select: 필드 선택

2.2 Mongoose Adapter
파일 위치: src/modules/database/adapters/MongooseAdapter.js
목적: IRepository를 Mongoose로 구현
생성자:
javascriptnew MongooseAdapter(model)

model: Mongoose Model 인스턴스

구현 세부사항:

findById(id)

Model.findById(id) 사용
에러 시 AppError 던지기


findOne(filter)

Model.findOne(filter) 사용


findAll(filter, options)

쿼리 체이닝: find() → sort() → limit() → skip() → populate()
options에 따라 동적으로 쿼리 구성


create(data)

new Model(data).save() 사용
Duplicate key 에러(11000) → 409 상태 코드


update(id, data)

findByIdAndUpdate() 사용
옵션: { new: true, runValidators: true }
$set 연산자로 업데이트


delete(id)

findByIdAndDelete() 사용
성공 시 true, 실패 시 false 반환


count(filter)

Model.countDocuments(filter) 사용


exists(filter)

Model.exists(filter) 사용
null이 아니면 true


paginate(filter, page, limit, options)

skip 계산: (page - 1) * limit
total 조회 후 데이터 조회
반환 형식:



javascript   {
     data: [...],
     total: 100,
     page: 1,
     limit: 10,
     totalPages: 10
   }

bulkCreate(dataArray)

Model.insertMany(dataArray) 사용


bulkUpdate(filter, data)

Model.updateMany(filter, { $set: data }) 사용
수정된 문서 수 반환


bulkDelete(filter)

Model.deleteMany(filter) 사용
삭제된 문서 수 반환


transaction(callback)

Mongoose Session 시작
callback에 session 전달
성공 시 commit, 실패 시 abort



에러 처리:

모든 메서드에서 try-catch
Mongoose 에러를 AppError로 변환
에러 메시지에 원인 포함

2.3 MongoDB 연결 관리
파일 위치: src/modules/database/connection/MongooseConnection.js
기능:

connect(uri, options)

mongoose.connect() 래핑
연결 성공/실패 로그
기본 옵션:



javascript   {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   }

disconnect()

mongoose.disconnect() 호출
로그 기록


getConnection()

현재 연결 상태 반환


healthCheck()

연결 상태 확인
반환: { status: 'connected' | 'disconnected' }



이벤트 리스너:

connected: 연결 성공 시
error: 에러 발생 시
disconnected: 연결 해제 시

2.4 외부 API
파일 위치: src/modules/database/index.js
노출 함수:
javascript// Repository 생성
function createRepository(model, adapterType = 'mongoose') {
  if (adapterType === 'mongoose') {
    return new MongooseAdapter(model);
  }
  throw new Error(`Unknown adapter type: ${adapterType}`);
}

// 연결 관리
const connection = {
  connect: MongooseConnection.connect,
  disconnect: MongooseConnection.disconnect,
  healthCheck: MongooseConnection.healthCheck,
};

module.exports = {
  createRepository,
  connection,
};
📦 패키지 의존성
json"dependencies": {
  "mongoose": "^8.0.0"
}
📝 사용 예제
파일 위치: examples/day2-repository.js
javascriptconst mongoose = require('mongoose');
const { createRepository, connection } = require('../src/modules/database');

// 1. 모델 정의
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  age: Number,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 2. 연결
await connection.connect('mongodb://localhost:27017/testdb');

// 3. Repository 생성
const userRepo = createRepository(User);

// 4. 사용
const user = await userRepo.create({ name: 'John', email: 'john@example.com', age: 30 });
const found = await userRepo.findById(user._id);
const all = await userRepo.findAll({ age: { $gte: 18 } }, { sort: { createdAt: -1 } });
const paginated = await userRepo.paginate({}, 1, 10);
✅ 완료 기준

 IRepository 인터페이스 정의 완료 (13개 메서드)
 MongooseAdapter가 모든 메서드 구현
 MongoDB 연결/해제 정상 동작
 예제 코드가 에러 없이 실행됨
 트랜잭션이 정상 작동 (commit/rollback)