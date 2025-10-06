# Backend Modules - 완전한 문서

 - Express.js 기반 재사용 가능한 백엔드 모듈 라이브러리

## 개요

Express.js 백엔드 애플리케이션 개발을 위한 재사용 가능한 모듈 라이브러리입니다.

### 주요 기능

- ✅ 다중 데이터베이스: MongoDB, PostgreSQL, MySQL, SQLite
- ✅ Repository 패턴: DB 독립적 코드 작성
- ✅ 완전한 인증: JWT + 소셜 로그인 (Kakao, Apple)
- ✅ 파일 업로드: Multer + Sharp 이미지 처리
- ✅ 메시지 큐: Bull + Redis
- ✅ API 문서: Swagger/OpenAPI 자동 생성

## 빠른 시작

### 환경 변수 (.env)

\
### 기본 서버

\
## 핵심 모듈

### 1. 데이터베이스
\
### 2. 인증
\
### 3. 소셜 로그인
\
### 4. 파일 업로드
\
### 5. 메시지 큐
\
## API 엔드포인트

Swagger UI: **http://localhost:3001/api-docs**

- GET /health
- POST /auth/register, /auth/login
- GET /auth/kakao, /auth/kakao/callback
- POST /upload/single, /queue/email

## 환경 변수

### 필수
\
### 선택 (소셜 로그인)
\
## 라이센스

MIT License

---

**버전:** 1.0.0
**업데이트:** 2025-10-04
