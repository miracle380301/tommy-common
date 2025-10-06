JWT 인증 시스템 PRD v1.0
1. 제품의 목적과 비전
JWT 기반의 완전한 인증 시스템을 구축하여 안전하고 확장 가능한 사용자 인증 기능을 제공한다.
핵심 원칙:

보안 우선: 업계 표준 보안 관행 준수
사용 편의성: 간단한 API로 빠른 통합
확장성: Refresh Token, 이메일 인증 등 고급 기능 포함


2. 핵심 기능 명세
2.1 JWT 토큰 시스템
2.1.1 Access Token
기능:

짧은 유효기간 (15분)
사용자 인증 정보 포함 (userId, email, role)
API 요청 시 인증 헤더로 전송

설정 옵션:

JWT_SECRET: 토큰 서명 비밀키
JWT_EXPIRES_IN: 만료 시간 (기본: 15m)
JWT_ALGORITHM: 암호화 알고리즘 (기본: HS256)

2.1.2 Refresh Token
기능:

긴 유효기간 (7일)
Access Token 재발급용
DB에 저장 및 관리 (기존 DB 패키지 사용)
블랙리스트 기능 (로그아웃 시)
Refresh Token Rotation (재사용 공격 방지)

DB 스키마 (기존 DB 패키지 사용):
javascriptRefreshToken {
  id: UUID,
  userId: FK(User.id),
  token: string (hashed),
  expiresAt: Date,
  isRevoked: boolean,
  deviceInfo: string (optional),
  createdAt: Date
}

2.2 비밀번호 관리
2.2.1 비밀번호 암호화
기능:

bcrypt 사용 (salt rounds: 10)
해싱된 비밀번호만 DB 저장
레인보우 테이블 공격 방지

보안 요구사항:

최소 8자 이상
영문, 숫자, 특수문자 조합 권장 (선택적 강제)
비밀번호 변경 시 이전 비밀번호와 다르게

2.2.2 비밀번호 재설정
Flow:

사용자가 이메일 입력
재설정 토큰 생성 및 이메일 전송
사용자가 링크 클릭 → 토큰 검증
새 비밀번호 입력 및 저장
토큰 무효화

DB 스키마 (기존 DB 패키지 사용):
javascriptPasswordResetToken {
  id: UUID,
  userId: FK(User.id),
  token: string (hashed),
  expiresAt: Date,
  isUsed: boolean,
  createdAt: Date
}

2.3 회원가입 API
2.3.1 기본 회원가입
Endpoint: POST /api/auth/register
Request Body:
json{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "agreeToTerms": true
}
Response (201):
json{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "isEmailVerified": false
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
검증 규칙:

이메일: 유효한 형식, 중복 확인
비밀번호: 최소 8자, 강도 검증 (선택)
이름: 2자 이상
약관 동의: 필수

2.3.2 이메일 인증
Flow:

회원가입 완료
인증 토큰 생성 및 이메일 발송
사용자가 링크 클릭
토큰 검증 및 계정 활성화

DB 스키마 (기존 DB 패키지 사용):
javascriptEmailVerificationToken {
  id: UUID,
  userId: FK(User.id),
  token: string (hashed),
  expiresAt: Date,
  createdAt: Date
}

2.4 로그인/로그아웃 API
2.4.1 로그인
Endpoint: POST /api/auth/login
Request Body:
json{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
Response (200):
json{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
보안 기능:

로그인 시도 제한 (5회 실패 시 15분 잠금)
IP 기반 로그 기록
비밀번호 오류 시 구체적 정보 노출 방지

2.4.2 로그아웃
Endpoint: POST /api/auth/logout
Headers:
Authorization: Bearer {accessToken}
기능:

Refresh Token DB에서 무효화 (isRevoked = true)
선택적: Access Token 블랙리스트 추가 (Redis 권장)

2.4.3 토큰 갱신
Endpoint: POST /api/auth/refresh
Response (200):
json{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}

3. API 명세 전체
MethodEndpoint설명인증 필요POST/api/auth/register회원가입❌POST/api/auth/login로그인❌POST/api/auth/logout로그아웃✅POST/api/auth/refresh토큰 갱신❌POST/api/auth/forgot-password비밀번호 재설정 요청❌POST/api/auth/reset-password비밀번호 재설정❌GET/api/auth/verify-email/:token이메일 인증❌POST/api/auth/resend-verification인증 이메일 재발송❌GET/api/auth/me현재 사용자 정보✅

4. 미들웨어 명세
4.1 인증 미들웨어
authenticate

Authorization 헤더 검증
JWT 토큰 검증
req.user에 사용자 정보 주입
실패 시 401 Unauthorized

optionalAuth

토큰이 있으면 검증
없어도 통과 (req.user = null)

requireRole(...roles)

특정 역할만 접근 허용
실패 시 403 Forbidden


5. 보안 요구사항
5.1 OWASP Top 10 대응
위협대응 방안Injection입력 검증, Parameterized Query (기존 DB 패키지)Broken AuthenticationJWT + Refresh Token, 비밀번호 암호화Sensitive Data ExposureHTTPS 강제, 비밀번호 해싱XSSInput Sanitization, CSP 헤더Broken Access ControlRBAC, 권한 미들웨어Security Misconfiguration환경변수 관리, 기본값 변경CSRFSameSite Cookie, CSRF Token (선택)
5.2 추가 보안 기능

Rate Limiting (로그인: 5회/15분)
IP 기반 로깅
Brute Force 방지
세션 타임아웃
의심스러운 활동 모니터링


6. 기술 스택
6.1 Core 라이브러리

jsonwebtoken: JWT 생성 및 검증
bcrypt: 비밀번호 해싱
joi 또는 zod: 입력 검증

6.2 보안 라이브러리

helmet: 보안 헤더 설정
express-rate-limit: 요청 제한
express-validator: 입력 정제

6.3 외부 의존성

이메일 서비스: 기존 Nodemailer 모듈 사용
DB: 기존 Database Abstraction Layer 사용


7. 환경 변수
bash# JWT 설정
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# 이메일 인증
EMAIL_VERIFICATION_EXPIRES_IN=24h
EMAIL_FROM=noreply@yourapp.com

# 비밀번호 재설정
PASSWORD_RESET_EXPIRES_IN=1h

# 보안
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_TIME=15m

# 이메일 서비스 (기존 모듈 설정)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

8. 에러 코드 정의
javascript// 인증 관련
AUTH_001: 'INVALID_CREDENTIALS'        // 잘못된 이메일/비밀번호
AUTH_002: 'EMAIL_ALREADY_EXISTS'       // 이메일 중복
AUTH_003: 'INVALID_TOKEN'              // 유효하지 않은 토큰
AUTH_004: 'TOKEN_EXPIRED'              // 만료된 토큰
AUTH_005: 'REFRESH_TOKEN_REVOKED'      // 무효화된 Refresh Token
AUTH_006: 'EMAIL_NOT_VERIFIED'         // 이메일 미인증
AUTH_007: 'ACCOUNT_LOCKED'             // 계정 잠김 (로그인 시도 초과)
AUTH_008: 'WEAK_PASSWORD'              // 약한 비밀번호
AUTH_009: 'PASSWORD_RESET_TOKEN_INVALID' // 잘못된 재설정 토큰
AUTH_010: 'PASSWORD_RESET_TOKEN_EXPIRED' // 만료된 재설정 토큰

9. DB 스키마 요구사항 (기존 DB 패키지 사용)
9.1 User 모델 확장
javascriptUser {
  id: UUID (primary key),
  email: string (unique, indexed),
  password: string (hashed),
  name: string,
  role: enum('user', 'admin', 'moderator'),
  isEmailVerified: boolean (default: false),
  emailVerifiedAt: Date (nullable),
  lastLoginAt: Date (nullable),
  loginAttempts: number (default: 0),
  lockedUntil: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
9.2 새 모델
javascript// Refresh Token
RefreshToken {
  id: UUID,
  userId: FK(User.id) (indexed),
  token: string (hashed, unique),
  expiresAt: Date,
  isRevoked: boolean (default: false),
  deviceInfo: string (optional),
  ipAddress: string (optional),
  createdAt: Date
}

// Email Verification Token
EmailVerificationToken {
  id: UUID,
  userId: FK(User.id) (indexed),
  token: string (hashed, unique),
  expiresAt: Date,
  createdAt: Date
}

// Password Reset Token
PasswordResetToken {
  id: UUID,
  userId: FK(User.id) (indexed),
  token: string (hashed, unique),
  expiresAt: Date,
  isUsed: boolean (default: false),
  createdAt: Date
}
인덱싱 전략:

User.email (unique)
RefreshToken.userId, RefreshToken.token
EmailVerificationToken.userId, EmailVerificationToken.token
PasswordResetToken.userId, PasswordResetToken.token


10. 개발 일정 (Day 4-5)
Day 4: 기본 인증 시스템
오전 (4시간):

JWT 유틸리티 구현

Access Token 생성/검증
Refresh Token 생성/검증


비밀번호 유틸리티

bcrypt 해싱
비밀번호 비교



오후 (4시간):

회원가입 API

입력 검증
중복 체크
비밀번호 해싱
DB 저장 (기존 Repository 사용)
이메일 인증 토큰 발송



Day 5: 로그인 및 고급 기능
오전 (4시간):

로그인 API
로그아웃 API
토큰 갱신 API

오후 (4시간):

비밀번호 재설정
이메일 인증
인증 미들웨어 구현

저녁 (2시간):

통합 테스트
문서화


11. 테스트 시나리오
11.1 회원가입

 정상 회원가입
 중복 이메일 검증
 비밀번호 강도 검증
 필수 필드 누락 시 오류
 이메일 인증 메일 발송

11.2 로그인

 정상 로그인
 잘못된 이메일
 잘못된 비밀번호
 5회 실패 시 계정 잠금
 미인증 계정 로그인 제한

11.3 토큰 관리

 Access Token 검증
 만료된 Access Token
 Refresh Token으로 갱신
 무효화된 Refresh Token
 Refresh Token Rotation

11.4 비밀번호 재설정

 재설정 이메일 발송
 유효한 토큰으로 재설정
 만료된 토큰
 사용된 토큰 재사용 방지

11.5 이메일 인증

 인증 링크 클릭
 만료된 인증 링크
 재발송 기능


12. 성공 기준
12.1 정량적 지표

✅ 9개 API 엔드포인트 완성
✅ 3개 인증 미들웨어
✅ JWT + Refresh Token 시스템
✅ 이메일 인증 기능
✅ 비밀번호 재설정 기능
✅ 2일 내 완료 (Day 4-5)

12.2 정성적 지표

✅ OWASP Top 10 주요 항목 대응
✅ 기존 DB 패키지와 완벽 통합
✅ 기존 이메일 모듈과 연동
✅ 실제 프로젝트에 바로 적용 가능
✅ 명확한 에러 메시지


13. 참고 사항
13.1 기존 모듈 활용

DB 레이어: 기존 Repository Pattern 사용
이메일 서비스: 기존 Nodemailer 모듈 사용

13.2 확장 포인트

OAuth 소셜 로그인 (Day 6-7)
2FA (Two-Factor Authentication)
세션 관리 (동시 로그인 제한)
디바이스 관리


14. 리스크 & 대응
리스크대응 방안토큰 보안 취약점짧은 Access Token, Refresh Token Rotation이메일 전송 실패재발송 기능, 큐 시스템 (기존 모듈)DB 성능인덱싱 최적화, Refresh Token 정리 Cron로그인 공격Rate Limiting, 계정 잠금

15. 결론
이 JWT 인증 시스템은 보안, 확장성, 사용 편의성을 모두 만족하며, 기존 DB 및 이메일 모듈과 완벽히 통합됩니다.
2일 투자로 향후 모든 프로젝트에서 안전하고 완전한 인증 시스템을 즉시 사용할 수 있습니다.