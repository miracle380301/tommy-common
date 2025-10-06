# Social Auth Package - PRD (Product Requirements Document)

## 1. 제품 개요

**@miracle380301/social-auth-backend**는 소셜 로그인 기능을 빠르게 구현할 수 있는 OAuth 2.0 인증 백엔드 패키지입니다.

### 핵심 가치
- **빠른 통합**: 최소한의 설정으로 소셜 로그인 구현
- **환경 독립성**: 환경변수에 종속되지 않는 설정 주입 방식
- **유연한 구조**: 독립 실행 또는 기존 Express 앱 통합 가능

### 타겟 사용자
- Node.js/Express 기반 백엔드 개발자
- 소셜 로그인 기능이 필요한 프로젝트
- 빠른 프로토타이핑이 필요한 팀

## 2. 주요 기능

### 2.1 인증 방식
- **Google OAuth**: OpenID Connect 기반
- **Kakao OAuth**: Kakao OAuth 2.0
- **Apple OAuth**: Sign in with Apple (향후)
- **Email OTP**: 이메일 기반 Passwordless 인증
  - 6자리 숫자 코드 생성
  - 이메일로 OTP 전송
  - 시간 제한 인증 (기본 5분)
  - 재전송 기능

### 2.2 JWT 토큰 관리
- 액세스 토큰 생성
- 토큰 검증 미들웨어
- 커스터마이징 가능한 만료 시간

### 2.3 Express 통합
- **독립 실행형 서버**: `startOAuthServer()` 함수로 즉시 실행
- **미들웨어 통합**: 기존 Express 앱에 `setupOAuth()` 추가
- **인증 미들웨어**: 보호된 라우트 구현

### 2.4 유연한 설정
- 환경변수 주입 방식 (패키지 내부에서 읽지 않음)
- Provider별 선택적 활성화
- 커스텀 Redirect URI 설정

## 3. 사용 시나리오

### 3.1 독립 실행형 서버 구축
```
개발자가 .env 파일 설정 → startOAuthServer() 호출 → OAuth 서버 즉시 실행
```

**사용 케이스:**
- 빠른 프로토타입 제작
- 마이크로서비스 아키텍처에서 인증 서버 분리
- 테스트 환경 구축

### 3.2 기존 Express 앱 통합
```
Express 앱 생성 → setupOAuth() 호출 → 기존 API와 함께 OAuth 기능 제공
```

**사용 케이스:**
- 기존 REST API에 소셜 로그인 추가
- 모놀리식 애플리케이션

### 3.3 클라이언트 연동
```
클라이언트에서 /api/auth/{provider}로 리다이렉트 →
OAuth 인증 완료 → Callback URL로 JWT 토큰 전달 →
클라이언트에서 토큰 저장 및 인증된 요청 수행
```

**지원 클라이언트:**
- 웹 애플리케이션 (React, Vue, Angular 등)
- 모바일 앱 (WebView 또는 Deep Link)
- 데스크톱 애플리케이션

## 4. API 명세

### 4.1 OAuth 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/auth/google` | Google 로그인 시작 |
| GET | `/api/auth/google/callback` | Google OAuth Callback |
| GET | `/api/auth/kakao` | Kakao 로그인 시작 |
| GET | `/api/auth/kakao/callback` | Kakao OAuth Callback |
| GET | `/api/auth/apple` | Apple 로그인 시작 (향후) |
| GET | `/api/auth/apple/callback` | Apple OAuth Callback (향후) |

### 4.2 Email OTP 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/email/send-otp` | OTP 코드 전송 |
| POST | `/api/auth/email/verify-otp` | OTP 코드 검증 및 로그인 |
| POST | `/api/auth/email/resend-otp` | OTP 코드 재전송 |

### 4.3 인증 API
| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/auth/me` | 현재 사용자 정보 조회 | Bearer Token |
| POST | `/api/auth/logout` | 로그아웃 | Bearer Token |

### 4.4 시스템 API
| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 확인 |

## 5. 기술 스택

### 백엔드
- **런타임**: Node.js (>=18)
- **프레임워크**: Express.js
- **언어**: TypeScript
- **인증**: JWT (jsonwebtoken)
- **HTTP 클라이언트**: Axios

### 데이터 관리
- **세션 저장소**: 메모리 (개발), Redis 권장 (프로덕션)
- **토큰 관리**: JWT (stateless)

### 패키지 배포
- **레지스트리**: GitHub Packages
- **버전 관리**: Semantic Versioning

## 6. 설정 구조

### 6.1 필수 설정
```typescript
{
  jwt: {
    secret: string,          // JWT 서명 키 (필수)
    expiresIn?: string      // 만료 시간 (선택, 기본값: '7d')
  }
}
```

### 6.2 Provider 설정 (선택적)
```typescript
{
  google?: {
    clientId: string,
    clientSecret: string,
    redirectUri?: string    // 기본값: http://localhost:3000/api/auth/google/callback
  },
  kakao?: {
    clientId: string,
    clientSecret: string,
    redirectUri?: string
  },
  apple?: {
    clientId: string,
    clientSecret: string,
    redirectUri?: string
  },
  email?: {
    enabled: boolean,       // Email OTP 활성화 여부
    otpLength?: number,     // OTP 자릿수 (기본값: 6)
    otpExpiry?: number,     // OTP 만료 시간 (초, 기본값: 300)
    emailService: {         // 이메일 전송 서비스 설정
      provider: 'smtp' | 'sendgrid' | 'ses' | 'custom',
      config: any           // Provider별 설정
    }
  }
}
```

### 6.3 서버 설정 (선택적)
```typescript
{
  port?: number,              // 기본값: 3000
  frontendUrl?: string,       // 기본값: http://localhost:5173
  corsOrigin?: string | string[]
}
```

## 7. 보안 고려사항

### 7.1 현재 구현
- HTTPS 강제 (프로덕션 환경)
- CORS 설정
- JWT 토큰 기반 인증
- Redirect URI 검증 (OAuth Provider 측)
- OTP 시간 제한 (기본 5분)
- OTP 재전송 제한 (Rate Limiting)

### 7.2 사용자 책임
- 환경변수 안전한 관리 (.env 파일 gitignore)
- JWT Secret 강력한 키 사용
- HTTPS 적용 (프로덕션)
- 세션 저장소 보안 (Redis 등)

### 7.3 향후 개선 예정
- CSRF 토큰 지원
- 전역 Rate Limiting
- IP 화이트리스트
- Refresh Token 구현
- OTP 브루트포스 방어 (실패 횟수 제한)

## 8. 제약사항 및 한계

### 8.1 현재 제약사항
- **세션 관리**: 메모리 기반 (개발용), 프로덕션에서 외부 저장소 필요
- **Refresh Token**: 미구현, Access Token만 제공
- **다중 서버**: 세션/OTP 공유 미지원 (Redis 등 외부 저장소 필요)
- **Apple Login**: API 구조만 준비, 실제 구현 미완료
- **Email OTP**: 이메일 전송 서비스 외부 의존성 (사용자가 직접 설정)

### 8.2 기술적 한계
- Node.js 환경 필수
- Express.js 의존성
- 동기식 세션 관리 (비동기 저장소 미지원)

## 9. 문서 및 예제

### 9.1 제공 문서
- `README.md`: 설치 및 사용 가이드
- `.env.example`: 환경변수 템플릿
- API 엔드포인트 명세
- TypeScript 타입 정의

### 9.2 예제 프로젝트
**위치**: `packages/social-auth/frontend` (참고용, 미배포)
- OAuth 연동 플로우 시연
- 환경변수 설정 예시
- 클라이언트 통합 방법 참고

## 10. 향후 로드맵

### Phase 1 (현재)
- ✅ Google, Kakao OAuth 구현
- ✅ JWT 인증
- ✅ Express 통합
- ✅ TypeScript 지원
- 🔄 Email OTP 인증 (진행 중)

### Phase 2 (단기)
- [ ] Email OTP 완성 (SMTP, SendGrid, SES 지원)
- [ ] Apple Login 완성
- [ ] Refresh Token 구현
- [ ] Redis 세션/OTP 저장소 옵션
- [ ] 전역 Rate Limiting

### Phase 3 (중기)
- [ ] 소셜 로그인 통계/로깅
- [ ] 다국어 에러 메시지
- [ ] OAuth 2.0 PKCE 지원
- [ ] 테스트 커버리지 100%

### Phase 4 (장기)
- [ ] GitHub, Microsoft 등 추가 Provider
- [ ] 2FA (Two-Factor Authentication)
- [ ] WebAuthn/Passkey 지원
- [ ] Admin Dashboard

## 11. 성공 지표

### 정량적 지표
- NPM 다운로드 수
- GitHub Stars
- 이슈 해결 시간
- 테스트 커버리지

### 정성적 지표
- 사용자 피드백 긍정도
- 문서 완성도
- 커뮤니티 기여도
- 실제 프로덕션 사용 사례

## 12. 의존성 관리

### 핵심 의존성
- express: ^4.18.2
- jsonwebtoken: ^9.0.2
- axios: ^1.6.0
- cors: ^2.8.5

### 개발 의존성
- typescript: ^5.3.3
- @types/express: ^4.17.21
- @types/jsonwebtoken: ^9.0.5

### Peer 의존성
- Node.js >= 18

## 13. 라이선스 및 배포

- **라이선스**: MIT (예정)
- **배포 위치**: GitHub Packages
- **패키지명**: @miracle380301/social-auth-backend
- **현재 버전**: 1.0.0
- **스코프**: @miracle380301 (Private Organization)

---

## 부록 A: 환경변수 예시

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Kakao OAuth
KAKAO_CLIENT_ID=abcdef1234567890
KAKAO_CLIENT_SECRET=xxxxxxxxxxx
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

# JWT
JWT_SECRET=super-secret-key-change-in-production

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 부록 B: 관련 패키지

- **@miracle380301/common**: 프론트엔드 UI 컴포넌트 라이브러리
  - LoginForm 컴포넌트 제공 (소셜 로그인 UI)
  - 이 백엔드 패키지와 함께 사용 가능
- **@miracle380301/social-auth-backend**: 이 패키지
