# Backend 모듈 라이브러리 PRD v2.0 (요건정의서)

## 1. 제품의 목적과 비전
재사용 가능한 Backend 모듈 라이브러리를 구축하여, 향후 프로젝트 개발 시 빠른 API 개발과 일관된 서버 아키텍처를 제공한다.

**핵심 원칙:**
- **DB 독립성**: 어떤 데이터베이스든 쉽게 교체 가능
- **확장성**: 새로운 기능을 플러그인처럼 추가
- **실용성**: 12일 안에 실제 프로젝트에 바로 적용 가능

---

## 2. 타겟 사용자
**풀스택 개발자**
- 혼자서 빠르게 백엔드 API를 구축해야 하는 개발자
- 일관된 서버 구조와 보안이 필요한 개발자
- 반복적인 CRUD 작업을 줄이고 비즈니스 로직에 집중하고 싶은 개발자
- 프로토타입을 빠르게 만들어야 하는 개발자
- 여러 프로젝트에서 다른 DB를 사용하는 개발자

---

## 3. 핵심 기능 목록

### 3.1 인증 & 보안 모듈

#### 3.1.1 기본 인증 (Authentication)
- JWT 토큰 생성 및 검증
- Refresh Token 관리
- 비밀번호 암호화 (bcrypt)
- 로그인/로그아웃 API
- 회원가입 API
- 비밀번호 재설정
- 이메일 인증

#### 3.1.2 소셜 로그인 (OAuth 2.0)
**지원 플랫폼:**
- **Google OAuth 2.0** - Gmail 계정 로그인
- **Kakao OAuth 2.0** - 카카오톡 계정 로그인
- **Apple Sign In** - Apple ID 로그인
- **Magic Link** - 이메일 인증 링크 로그인 (비밀번호 불필요)

**공통 기능:**
- 소셜 계정과 로컬 계정 연동
- 다중 소셜 계정 연결
- 계정 통합 (같은 이메일로 여러 방식 로그인)
- OAuth State 관리 (CSRF 방지)
- Callback URL 처리

#### 3.1.3 인가 (Authorization)
- Role-based Access Control (RBAC)
- Permission 체크
- API 접근 권한 관리

#### 3.1.4 보안
- Rate Limiting (요청 제한)
- CORS 설정
- Helmet (보안 헤더)
- XSS 방지
- SQL Injection 방지
- Input Sanitization

---

### 3.2 Database Abstraction Layer (신규 추가)

#### 3.2.1 Repository Pattern
**공통 인터페이스로 모든 DB 통일:**
- `findById`, `findOne`, `findAll`
- `create`, `update`, `delete`
- `count`, `exists`, `paginate`
- `bulkCreate`, `bulkUpdate`, `bulkDelete`
- `transaction` (트랜잭션 관리)

#### 3.2.2 Database Adapters
**지원 어댑터:**
- **MongooseAdapter** - MongoDB 전용
- **SequelizeAdapter** - PostgreSQL, MySQL, SQLite
- **PrismaAdapter** - PostgreSQL, MySQL, MongoDB
- 추가 DB는 새 Adapter 구현으로 확장 가능

#### 3.2.3 Connection Manager
**DB 연결 추상화:**
- 환경 변수 기반 DB 선택 (`DB_TYPE=mongodb` 또는 `postgresql`)
- Connection Pool 관리
- Health Check
- 자동 재연결

#### 3.2.4 Query Builder Abstraction
**DB 독립적 쿼리 작성:**
```javascript
query.where('status', '=', 'active')
     .where('age', '>', 18)
     .orderBy('createdAt', 'DESC')
     .limit(10);
// MongoDB, PostgreSQL 모두 동작
```

---

### 3.3 CRUD 템플릿
- RESTful API 자동 생성 (GET, POST, PUT, DELETE)
- **DB 독립적 설계** - Repository 패턴 사용
- Pagination, Search, Filter, Sort
- Soft Delete (논리 삭제)
- Bulk Operations (일괄 작업)

---

### 3.4 미들웨어
**인증 미들웨어:** `authenticate`, `optionalAuth`, `requireAuth`  
**권한 미들웨어:** `requireRole`, `requirePermission`, `resourceOwner`  
**검증 미들웨어:** `validateRequest`, `validateBody`, `validateQuery`  
**기타:** `errorHandler`, `logger`, `rateLimiter`, `cache`, `compression`

---

### 3.5 파일 처리
- 파일 업로드 (Multer)
- 이미지 리사이징 (Sharp)
- 저장소 추상화 (로컬/S3/Cloudinary)

---

### 3.6 응답 & 에러 처리
- 표준 응답 포맷 (Success, Error, Paginated)
- 에러 핸들러 (HTTP, Validation, Database)
- 로거 (Winston/Pino)

---

### 3.7 데이터베이스 (통합됨 - 3.2와 연동)
- **연결 관리:** MongoDB, PostgreSQL, MySQL 지원
- **모델 베이스:** 공통 필드 및 메서드
- **마이그레이션:** Schema 버전 관리, Seed 데이터

---

### 3.8 외부 서비스 연동
- **이메일:** Nodemailer, 템플릿 엔진
- **SMS:** Twilio, AWS SNS
- **결제:** Stripe, 토스페이먼츠
- **푸시 알림:** Firebase Cloud Messaging
- **OAuth:** Google, Kakao, Apple SDK

---

### 3.9 유틸리티
- Date/Time (날짜 포맷, 시간대 변환)
- String (Slug 생성, Random String)
- Validation (이메일, 전화번호, URL)
- Crypto (암호화, Hash, UUID)

---

### 3.10 작업 큐 & 스케줄러
- Job Queue (Bull/BullMQ)
- Cron Jobs (정기 작업)

---

### 3.11 모니터링 & 헬스체크
- Health Check (API, DB, 외부 서비스)
- Metrics (응답 시간, 에러율)

---

## 4. 기술 스택

### 4.1 Core
- Runtime: Node.js (v18+)
- Framework: Express.js
- Language: JavaScript (ES6+) / TypeScript 준비

### 4.2 Database Abstraction
- **Core:** Custom Repository Pattern
- **Adapters:** Mongoose, Sequelize, Prisma
- **Caching:** Redis

### 4.3 인증 & 보안
- JWT: jsonwebtoken
- Hashing: bcrypt
- Security: helmet, cors, express-rate-limit
- **OAuth:** passport-google-oauth20, passport-kakao, apple-signin-auth

### 4.4 Validation
- Schema Validation: Joi / Zod
- Sanitization: express-validator

### 4.5 파일 처리
- Upload: Multer
- Image Processing: Sharp
- Storage: AWS SDK, Cloudinary

### 4.6 외부 서비스
- Email: Nodemailer
- SMS: Twilio
- Payment: Stripe, Toss Payments

### 4.7 작업 큐
- Queue: Bull / BullMQ
- Scheduler: node-cron

### 4.8 로깅 & 모니터링
- Logger: Winston / Pino
- Monitoring: PM2

---

## 5. 비기능적 요구사항

### 5.1 성능
- API 응답 시간 < 200ms
- 동시 접속 1000명 처리
- DB 쿼리 최적화 (인덱스, 캐싱)

### 5.2 보안
- OWASP Top 10 대응
- SQL Injection, XSS, CSRF 방지
- Rate Limiting
- OAuth State/Nonce 검증

### 5.3 확장성
- 모듈 독립성 유지
- 수평 확장 가능
- **DB 독립성** - 설정만으로 DB 교체 가능

### 5.4 신뢰성
- 에러 복구 메커니즘
- 트랜잭션 관리
- 데이터 정합성

### 5.5 유지보수성
- 일관된 코드 스타일
- 명확한 에러 메시지
- 완전한 문서화

---

## 6. 제약사항과 가정사항

### 6.1 제약사항
**개발 기간:** 총 12일 (소셜 로그인 및 DB 추상화 추가로 2일 연장)  
**환경 제약:** Node.js, Express.js, **DB 독립적 설계**  
**범위 제약:** GraphQL 미지원, WebSocket 미포함, Microservices 미지원

### 6.2 가정사항
**사용 환경:** Node.js v18+, MongoDB 4.0+ 또는 PostgreSQL 12+ 또는 MySQL 8.0+  
**사용자:** Express.js 기본 지식, REST API 개념, OAuth 2.0 기본 이해  
**프로젝트 특성:** 중소규모, MVP, 소셜 로그인 필요한 B2C 서비스

---

## 7. 성공 기준

### 7.1 정량적 지표
✅ 인증 & 보안 모듈 완성 (소셜 로그인 4개 포함)  
✅ **DB 추상화 레이어 완성** (Adapter Pattern)  
✅ **CRUD 템플릿 완성** (DB 독립적)  
✅ 10개 이상의 미들웨어  
✅ 5개 이상의 유틸리티 모듈  
✅ 파일 처리 모듈 완성  
✅ 12일 내 완료

### 7.2 정성적 지표
✅ 새 프로젝트 시작 시간 80% 단축  
✅ **DB 교체 시 코드 변경 최소화** (설정만 변경)  
✅ 일관된 API 구조  
✅ 문서만 보고 사용 가능  
✅ 소셜 로그인 5분 안에 통합 가능

---

## 8. 개발 일정 (12일)

| 일차 | 범위 | 주요 모듈 |
|------|------|----------|
| **Day 1** | 프로젝트 구조 & 기본 설정 | Express 설정, 에러 핸들러, 로거 |
| **Day 2** | **DB 추상화 레이어 (1)** | Repository Interface, Mongoose Adapter |
| **Day 3** | **DB 추상화 레이어 (2)** | Sequelize Adapter, Connection Manager, Query Builder |
| **Day 4** | 인증 시스템 (1) | JWT 유틸, 비밀번호 암호화, 회원가입 |
| **Day 5** | 인증 시스템 (2) | 로그인, 인증 미들웨어, 권한 체크 |
| **Day 6** | **소셜 로그인 (1)** | Google OAuth, Kakao OAuth 연동 |
| **Day 7** | **소셜 로그인 (2)** | Apple Sign In, Magic Link (이메일 로그인) |
| **Day 8** | **CRUD 템플릿** | RESTful API 자동 생성, 페이지네이션 **(DB 독립적)** |
| **Day 9** | 검증 & 미들웨어 | Validation, Rate Limiter, CORS |
| **Day 10** | 파일 처리 | 업로드, 이미지 처리, S3 연동 |
| **Day 11** | 외부 서비스 & 큐 | 이메일, SMS, 결제, Bull Queue, Cron |
| **Day 12** | 통합 테스트 & 문서화 | **다중 DB 테스트**, README, 예제, 소셜 로그인 가이드 |

**총 결과물:**
- ✅ DB 추상화 레이어 (Adapter Pattern)
- ✅ 인증 시스템 (JWT + 4개 소셜 로그인)
- ✅ DB 독립적 CRUD 템플릿
- ✅ 10+ 미들웨어
- ✅ 파일 처리, 외부 서비스 연동, 유틸리티
- ✅ 완전한 문서 (소셜 로그인 가이드 포함)

---

## 9. 예상 사용 시나리오

### 시나리오 1: 블로그 API (DB 독립성)
**기존:** 2주 + DB 전환 시 1주 추가  
**모듈 사용:** 2일 + DB 전환 5분

```javascript
// DB 독립적 코드
const userRepository = createRepository(User);
const user = await userRepository.findById(id);

// DB 전환: .env만 수정
// DB_TYPE=mongodb → DB_TYPE=postgresql
// 코드 변경 없음!
```

### 시나리오 2: 소셜 로그인 SaaS
**기존:** 1개월 (각 소셜 로그인마다 1주)  
**모듈 사용:** 3일

```javascript
import { socialAuth, authenticate } from './modules';

// 소셜 로그인 자동 생성
app.get('/auth/google', socialAuth.google.login);
app.get('/auth/kakao', socialAuth.kakao.login);
app.post('/auth/apple', socialAuth.apple.login);
app.post('/auth/magic-link', socialAuth.email.sendMagicLink);

// 계정 연동
app.post('/auth/link/:provider', authenticate, socialAuth.link);
```

### 시나리오 3: 이커머스 API
**기존:** 1.5개월  
**모듈 사용:** 1주일

```javascript
// DB 독립적 + 소셜 로그인 + 파일 처리 + 결제
const productRepo = createRepository(Product);
app.use('/products', authenticate, createCRUD(productRepo));
app.get('/auth/:provider', socialAuth.dynamicLogin);
app.post('/products/image', fileUpload.single('image'));
app.post('/webhooks/payment', paymentWebhook);
```

---

## 10. 향후 확장 계획 (Out of Scope)

**Phase 2:**
- TypeScript 마이그레이션
- GraphQL 지원
- WebSocket 지원
- 단위 테스트 & 통합 테스트
- API 문서 자동 생성 (Swagger)

**Phase 3:**
- Microservices 지원
- Message Queue (RabbitMQ, Kafka)
- 캐싱 전략 고도화
- 모니터링 대시보드

**Phase 4:**
- npm 패키지 배포
- CLI 도구 제공
- 온라인 문서 사이트

---

## 11. 리스크 & 대응

| 리스크 | 대응 방안 |
|--------|----------|
| 시간 부족 | 우선순위 높은 모듈 먼저 (인증, CRUD, DB 추상화) |
| DB 종속성 | **Adapter 패턴으로 해결** (Day 2-3) |
| 외부 서비스 의존성 | Mock 서비스 제공, 환경변수로 제어 |
| 소셜 로그인 복잡도 | 공통 인터페이스 설계로 단순화 |

---

## 12. 측정 지표

### 개발 속도
- 새 프로젝트 시작: 2주 → 2일
- CRUD API 추가: 1시간 → 5분
- 인증 구현: 3일 → 30분
- 소셜 로그인 추가: 1주 → 30분
- **DB 전환: 3일 → 5분** (설정만 변경)

### 코드 품질
- 코드 중복률: 50% → 10%
- DB 결합도: 높음 → 낮음 (Adapter 패턴)

### 비즈니스 임팩트
- Time to Market: 60% 단축
- 개발 비용: 50% 절감
- 유지보수 시간: 70% 단축

---

## 13. 참고 자료

**유사 프로젝트:**
- Nest.js (프레임워크)
- Adonis.js (프레임워크)
- Strapi (Headless CMS)

**우리 프로젝트의 차이점:**
- 프레임워크가 아닌 **모듈 라이브러리**
- Express 기반 (익숙함)
- **DB 독립적 설계** (Adapter Pattern)
- 최소한의 학습 곡선
- 즉시 사용 가능

---

## 14. 결론

이 Backend 모듈 라이브러리는 **DB 독립성**과 **소셜 로그인 통합**으로 풀스택 개발의 생산성을 극대화합니다.

**핵심 가치:**
- ✅ DB 교체 시 코드 변경 없이 설정만 수정
- ✅ 4개 소셜 로그인 5분 안에 통합
- ✅ FE 디자인 시스템 + BE 모듈 라이브러리 = 완전한 풀스택 도구

**12일 투자로 향후 모든 프로젝트에서 80% 이상의 시간 절약을 기대할 수 있습니다.**