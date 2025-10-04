# Day 9: CRUD 작업 패턴

## 📋 목표
Repository 패턴을 활용한 체계적인 CRUD 작업 구현 및 공통 패턴 정립

## 📁 디렉토리 구조
```
src/modules/crud/
├── controllers/
│   └── baseController.js    # 기본 CRUD 컨트롤러
├── services/
│   └── baseService.js        # 기본 CRUD 서비스
└── index.js
```

## 🎯 구현 모듈

### 9.1 기본 CRUD 작업

**Repository 메서드:**

1. **Create (생성)**
```javascript
const user = await repository.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});
```

2. **Read (조회)**
```javascript
// 단일 조회
const user = await repository.findById('507f1f77bcf86cd799439011');

// 조건 조회
const user = await repository.findOne({ email: 'john@example.com' });

// 목록 조회
const users = await repository.findAll(
  { status: 'active' },
  { sort: '-createdAt', limit: 10 }
);
```

3. **Update (수정)**
```javascript
const updated = await repository.update(
  '507f1f77bcf86cd799439011',
  { age: 31, status: 'inactive' }
);
```

4. **Delete (삭제)**
```javascript
const deleted = await repository.delete('507f1f77bcf86cd799439011');
```

### 9.2 페이지네이션

```javascript
const result = await repository.paginate(
  { status: 'active' },  // 필터
  1,                      // 페이지
  10,                     // 페이지당 개수
  { sort: '-createdAt' }  // 옵션
);

// 결과
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNextPage: true,
    hasPrevPage: false
  }
}
```

### 9.3 필터링 & 정렬

**필터링 예제:**
```javascript
// 단순 필터
const activeUsers = await repository.findAll({ status: 'active' });

// 범위 필터 (Mongoose/Sequelize 자동 변환)
const adults = await repository.findAll({ age: { $gte: 18 } });

// 검색 (정규표현식)
const searched = await repository.findAll({
  name: { $regex: 'John', $options: 'i' }
});
```

**정렬 예제:**
```javascript
// 오름차순
const users = await repository.findAll({}, { sort: 'name' });

// 내림차순
const users = await repository.findAll({}, { sort: '-createdAt' });

// 다중 정렬
const users = await repository.findAll({}, { sort: 'status -createdAt' });
```

### 9.4 Populate/Include (관계 데이터)

**Mongoose:**
```javascript
const posts = await repository.findAll(
  {},
  { populate: 'author' }
);
```

**Sequelize:**
```javascript
const posts = await repository.findAll(
  {},
  { include: ['author', 'comments'] }
);
```

### 9.5 트랜잭션

```javascript
await repository.transaction(async (session) => {
  // 1. User 생성
  const user = await userRepository.create(
    { name: 'John', email: 'john@example.com' },
    { session }
  );

  // 2. Profile 생성
  await profileRepository.create(
    { userId: user.id, bio: 'Hello' },
    { session }
  );

  // 모두 성공하면 커밋, 하나라도 실패하면 롤백
});
```

### 9.6 Bulk 작업

```javascript
// Bulk Create
const users = await repository.bulkCreate([
  { name: 'User1', email: 'user1@example.com' },
  { name: 'User2', email: 'user2@example.com' },
  { name: 'User3', email: 'user3@example.com' },
]);

// Bulk Update (향후 구현)
// Bulk Delete (향후 구현)
```

### 9.7 Soft Delete

**User 모델에 deletedAt 필드 추가:**
```javascript
{
  name: String,
  email: String,
  deletedAt: Date,  // null이면 활성, 날짜가 있으면 삭제됨
}
```

**Soft Delete 구현:**
```javascript
// Soft delete
await repository.update(userId, { deletedAt: new Date() });

// 삭제된 항목 제외 조회
const activeUsers = await repository.findAll({
  deletedAt: null
});

// 삭제된 항목만 조회
const deletedUsers = await repository.findAll({
  deletedAt: { $ne: null }
});

// 복구
await repository.update(userId, { deletedAt: null });
```

## 📝 실전 예제

### 예제 1: User CRUD API

```javascript
const express = require('express');
const { createRepository } = require('./modules/database');
const { UserMongoose } = require('./modules/auth');
const { asyncHandler } = require('./core/errors');

const app = express();
const userRepository = createRepository(UserMongoose);

// Create
app.post('/users', asyncHandler(async (req, res) => {
  const user = await userRepository.create(req.body);
  res.status(201).json({ success: true, data: user });
}));

// Read - List with pagination
app.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const result = await userRepository.paginate(
    filter,
    parseInt(page),
    parseInt(limit),
    { sort: '-createdAt' }
  );

  res.json({ success: true, ...result });
}));

// Read - Single
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.json({ success: true, data: user });
}));

// Update
app.put('/users/:id', asyncHandler(async (req, res) => {
  const user = await userRepository.update(req.params.id, req.body);
  if (!user) throw new NotFoundError('User not found');
  res.json({ success: true, data: user });
}));

// Delete
app.delete('/users/:id', asyncHandler(async (req, res) => {
  const deleted = await userRepository.delete(req.params.id);
  if (!deleted) throw new NotFoundError('User not found');
  res.json({ success: true, message: 'User deleted' });
}));
```

### 예제 2: 검색 & 필터링

```javascript
app.get('/users/search', asyncHandler(async (req, res) => {
  const { q, minAge, maxAge, status, role } = req.query;

  const filter = {};

  // 텍스트 검색 (이름 또는 이메일)
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  // 나이 범위
  if (minAge) filter.age = { ...filter.age, $gte: parseInt(minAge) };
  if (maxAge) filter.age = { ...filter.age, $lte: parseInt(maxAge) };

  // 상태
  if (status) filter.status = status;

  // 역할
  if (role) filter.role = role;

  const users = await userRepository.findAll(filter, {
    sort: '-createdAt',
    limit: 50,
  });

  res.json({ success: true, data: users });
}));
```

### 예제 3: 트랜잭션 사용

```javascript
app.post('/users/with-profile', asyncHandler(async (req, res) => {
  const { name, email, bio } = req.body;

  const result = await userRepository.transaction(async (session) => {
    // 1. User 생성
    const user = await userRepository.create(
      { name, email },
      { session }
    );

    // 2. Profile 생성
    const profile = await profileRepository.create(
      { userId: user.id, bio },
      { session }
    );

    return { user, profile };
  });

  res.status(201).json({ success: true, data: result });
}));
```

## ✅ 완료 기준

- [ ] Repository의 모든 CRUD 메서드 이해
- [ ] 페이지네이션 구현
- [ ] 필터링 & 정렬 구현
- [ ] Populate/Include 사용
- [ ] 트랜잭션 이해
- [ ] Bulk 작업 사용
- [ ] Soft Delete 구현 (선택)

## 🔍 주요 포인트

1. **Repository 패턴**: 데이터베이스 추상화로 MongoDB/SQL 전환 용이
2. **asyncHandler**: 비동기 에러 처리 자동화
3. **페이지네이션**: 대량 데이터 효율적 처리
4. **필터링**: 동적 쿼리 빌딩
5. **트랜잭션**: 데이터 일관성 보장
6. **Soft Delete**: 데이터 복구 가능성 유지
