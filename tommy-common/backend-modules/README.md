# Backend Modules

Express 기반 백엔드 애플리케이션을 위한 공통 모듈 라이브러리

## 📦 설치

```bash
npm install
```

## 🚀 빠른 시작

### 1. 환경 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

### 2. 예제 서버 실행

```bash
npm start
# 또는 개발 모드
npm run dev
```

서버가 실행되면 다음 URL에서 확인 가능합니다:
- **API 문서 (Swagger UI)**: http://localhost:3000/api-docs
- **Health check**: http://localhost:3000/health

## 📚 주요 기능

### 1. API 문서화 (Swagger)

FastAPI의 `/docs`처럼 자동 API 문서를 제공합니다.

```javascript
const { createApp, setupSwagger } = require('@miracle380301/backend-modules');

const app = createApp();

// Swagger 설정 (기본 경로: /api-docs)
setupSwagger(app);

// 또는 커스텀 경로
setupSwagger(app, '/docs');
```

**JSDoc 주석으로 API 문서화:**

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/api/users', async (req, res) => {
  // ...
});
```

### 2. Express 앱 초기화

기본 미들웨어가 설정된 Express 앱을 생성합니다.

```javascript
const { createApp } = require('@miracle380301/backend-modules');

const app = createApp({
  corsOrigin: '*',
  corsCredentials: true,
  jsonLimit: '10mb',
});
```

**기본 미들웨어:**
- helmet (보안 헤더)
- cors (CORS 설정)
- express.json() (JSON 파싱)
- express.urlencoded() (URL 인코딩 파싱)
- compression (응답 압축)

### 2. 환경 설정

`.env` 파일의 환경 변수를 관리합니다.

```javascript
const { config } = require('@miracle380301/backend-modules');

console.log(config.server.port); // 3000
console.log(config.database.uri); // mongodb://...
console.log(config.jwt.secret); // your-secret-key
```

**주요 설정:**
- `config.server` - 서버 설정 (env, port, host)
- `config.database` - 데이터베이스 설정
- `config.jwt` - JWT 토큰 설정
- `config.logging` - 로깅 설정
- `config.rateLimit` - Rate Limiting 설정

### 3. Winston 로거

구조화된 로깅 시스템을 제공합니다.

```javascript
const { logger } = require('@miracle380301/backend-modules');

logger.info('서버가 시작되었습니다');
logger.error('에러 발생', { error: err });
logger.debug('디버그 정보', { userId: 123 });
```

**로그 레벨:**
- error (0) - 에러만
- warn (1) - 경고 + 에러
- info (2) - 정보 + 경고 + 에러
- http (3) - HTTP 요청 로그
- debug (4) - 모든 로그

**HTTP 로그 미들웨어:**

```javascript
const { httpLogger } = require('@miracle380301/backend-modules');

app.use(httpLogger);
```

### 4. 에러 처리

통합된 에러 처리 시스템을 제공합니다.

```javascript
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  asyncHandler,
  notFoundHandler,
  errorHandler,
} = require('@miracle380301/backend-modules');

// 에러 던지기
throw new BadRequestError('잘못된 요청입니다');

// Async 핸들러 (자동 try-catch)
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  successResponse(res, users);
}));

// 404 핸들러 (마지막 라우트 다음에 추가)
app.use(notFoundHandler);

// 전역 에러 핸들러 (가장 마지막에 추가)
app.use(errorHandler);
```

**에러 클래스:**
- `AppError` - 기본 에러 클래스
- `BadRequestError` - 400
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `ValidationError` - 422
- `InternalServerError` - 500

### 5. 응답 포맷터

일관된 응답 형식을 제공합니다.

```javascript
const {
  successResponse,
  paginatedResponse,
  createdResponse,
  errorResponse,
} = require('@miracle380301/backend-modules');

// 성공 응답
app.get('/users', async (req, res) => {
  const users = await User.find();
  successResponse(res, users, 'Users fetched successfully');
});

// 생성 응답 (201)
app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  createdResponse(res, user, 'User created successfully');
});

// 페이지네이션 응답
app.get('/users', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = await User.find().limit(limit).skip((page - 1) * limit);
  const total = await User.countDocuments();

  paginatedResponse(res, users, { page, limit, total });
});
```

## 📁 프로젝트 구조

```
backend-modules/
├── src/
│   ├── config/              # 환경 설정
│   │   ├── express.js       # Express 앱 초기화
│   │   └── index.js         # 환경 변수 관리
│   ├── core/
│   │   ├── logger/          # Winston 로거
│   │   ├── errors/          # 에러 클래스 & 핸들러
│   │   └── response/        # 응답 포맷터
│   └── index.js             # 메인 export
├── examples/
│   └── server.js            # 예제 서버
├── .env.example             # 환경 변수 예제
├── package.json
└── README.md
```

## 🔧 API 예제

### GET /health

서버 상태 확인

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/users

모든 사용자 조회

**Response:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" }
  ]
}
```

### POST /api/users

새 사용자 생성

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

## 🧪 테스트

```bash
npm test
# 또는 watch 모드
npm run test:watch
```

## 📝 라이센스

MIT

## 👤 Author

miracle380301
