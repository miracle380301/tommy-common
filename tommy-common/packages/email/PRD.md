# Email Module PRD v1.0
*tommy-common Backend Module*

## 1. 제품의 목적과 비전

### 1.1 목적
재사용 가능한 이메일 전송 모듈을 구축하여, 다양한 Email Provider를 통합 관리하고 무료 한도 내에서 안정적인 이메일 전송 서비스를 제공한다.

### 1.2 핵심 가치
- **Provider 독립성**: DB Adapter처럼 Email Provider도 설정만으로 교체 가능
- **비용 관리**: 무료 한도 자동 관리로 예상치 못한 과금 방지
- **안정성**: 전송 실패 시 자동 재시도 및 큐 시스템
- **통합성**: tommy-common의 다른 모듈(auth, queue)과 완벽 통합

---

## 2. 타겟 사용자

**풀스택 개발자 & 스타트업**
- 이메일 전송 기능이 필요한 개발자
- 초기 비용 없이 MVP를 만들고 싶은 스타트업
- 여러 Email Provider를 비교하고 싶은 개발자
- 무료 한도 관리가 필요한 프로젝트

---

## 3. 핵심 기능 목록

### 3.1 Email Provider Abstraction Layer

#### 3.1.1 공통 인터페이스 (EmailAdapter)
모든 Provider가 구현해야 하는 표준 인터페이스:

```javascript
interface EmailAdapter {
  // 기본 전송
  send(options: EmailOptions): Promise<EmailResult>
  
  // 대량 전송
  sendBatch(emails: EmailOptions[]): Promise<EmailResult[]>
  
  // 템플릿 전송
  sendTemplate(templateId: string, data: object): Promise<EmailResult>
  
  // 전송 상태 확인
  getStatus(messageId: string): Promise<EmailStatus>
  
  // Provider 정보
  getProviderInfo(): ProviderInfo
  
  // 월 사용량 조회
  getMonthlyUsage(): Promise<UsageStats>
}
```

#### 3.1.2 지원 Provider (5개)

**1. NodemailerAdapter (SMTP)**
```javascript
- 기술: Nodemailer + Gmail SMTP
- 무료 한도: 500통/일 (월 15,000통)
- 용도: 개발/테스트 환경
- 설정: Gmail App Password 필요
```

**2. SendGridAdapter** (Option)
```javascript
- 기술: SendGrid REST API
- 무료 한도: 100통/일 (월 3,000통)
- 용도: 프로덕션 (소규모)
- 설정: API Key 필요
```

**3. AWS SESAdapter** (Option)
```javascript
- 기술: AWS SDK (SES)
- 무료 한도: 62,000통/월 (EC2 호스팅 시)
- 용도: 프로덕션 (대규모)
- 설정: AWS Credentials 필요
```

**4. MailgunAdapter** (Option)
```javascript
- 기술: Mailgun REST API
- 무료 한도: 5,000통/월
- 용도: 프로덕션 (중규모)
- 설정: API Key + Domain 인증 필요
```

**5. ResendAdapter**
```javascript
- 기술: Resend REST API
- 무료 한도: 100통/일 (월 3,000통)
- 용도: 최신 개발 환경, React Email 통합
- 설정: API Key 필요
```

---

### 3.2 무료 한도 관리 시스템 (핵심!)

#### 3.2.1 한도 추적 (Rate Limiter)
```javascript
// Redis 기반 사용량 추적
class EmailRateLimiter {
  // 일일 한도 체크
  checkDailyLimit(provider: string): Promise<boolean>
  
  // 월간 한도 체크
  checkMonthlyLimit(provider: string): Promise<boolean>
  
  // 전송 카운트 증가
  incrementCount(provider: string): Promise<void>
  
  // 사용량 조회
  getUsage(provider: string): Promise<UsageStats>
  
  // 리셋 (매일 자동)
  resetDailyCount(): Promise<void>
  
  // 리셋 (매월 자동)
  resetMonthlyCount(): Promise<void>
}
```

#### 3.2.2 Provider별 한도 설정
```javascript
// config/email-limits.js
const EMAIL_LIMITS = {
  nodemailer: {
    daily: 500,
    monthly: 15000,
    provider: 'Gmail SMTP'
  },
  sendgrid: {
    daily: 100,
    monthly: 3000,
    provider: 'SendGrid Free Tier'
  },
  ses: {
    daily: 2000,
    monthly: 62000,
    provider: 'AWS SES (EC2 Free Tier)'
  },
  mailgun: {
    daily: 166,  // 5000/30
    monthly: 5000,
    provider: 'Mailgun Free Tier'
  },
  resend: {
    daily: 100,
    monthly: 3000,
    provider: 'Resend Free Tier'
  }
};
```

#### 3.2.3 한도 초과 처리
```javascript
// 전송 전 한도 체크
const canSend = await rateLimiter.checkDailyLimit('sendgrid');

if (!canSend) {
  throw new EmailLimitExceededError({
    provider: 'sendgrid',
    limit: 100,
    used: 100,
    resetAt: '2025-10-06T00:00:00Z'
  });
}

// 대안: 다른 Provider로 자동 전환 (옵션)
if (!canSend && config.autoFallback) {
  return await emailService.sendWithFallback(options);
}
```

---

### 3.3 템플릿 시스템

#### 3.3.1 템플릿 엔진 (Handlebars)
```javascript
/templates
  /otp.html              # OTP 인증 코드
  /welcome.html          # 회원가입 환영
  /reset-password.html   # 비밀번호 재설정
  /verification.html     # 이메일 인증
  /notification.html     # 일반 알림

// 사용 예시
await emailService.sendTemplate('otp', {
  code: '123456',
  name: 'Tommy',
  expiresIn: '5분'
});
```

#### 3.3.2 다국어 지원 (옵션)
```javascript
/templates
  /ko
    /otp.html
    /welcome.html
  /en
    /otp.html
    /welcome.html

// 사용
await emailService.sendTemplate('otp', data, { locale: 'ko' });
```

---

### 3.4 Queue 시스템 통합 (Bull)

#### 3.4.1 비동기 전송
```javascript
// 즉시 응답, 백그라운드 전송
await emailQueue.add('send-email', {
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'Tommy' }
});

// API 응답 속도 향상: 500ms → 50ms
```

#### 3.4.2 자동 재시도
```javascript
// 전송 실패 시 자동 재시도
emailQueue.add('send-email', data, {
  attempts: 3,           // 최대 3번 시도
  backoff: {
    type: 'exponential',
    delay: 5000          // 5초, 10초, 20초 간격
  }
});
```

#### 3.4.3 우선순위 큐
```javascript
// OTP는 우선 전송
await emailQueue.add('send-email', otpData, { priority: 1 });

// 마케팅 메일은 낮은 우선순위
await emailQueue.add('send-email', marketingData, { priority: 10 });
```

---

### 3.5 로깅 & 모니터링

#### 3.5.1 전송 로그
```javascript
// Winston/Pino 로거 통합
logger.info('Email sent', {
  provider: 'sendgrid',
  to: 'user@example.com',
  template: 'otp',
  messageId: 'msg_123',
  duration: '234ms'
});

logger.error('Email failed', {
  provider: 'sendgrid',
  error: 'Rate limit exceeded',
  retryCount: 2
});
```

#### 3.5.2 사용량 대시보드 데이터
```javascript
// 실시간 사용량 조회 API
GET /api/email/usage
{
  "sendgrid": {
    "today": 45,
    "dailyLimit": 100,
    "thisMonth": 1234,
    "monthlyLimit": 3000,
    "resetAt": "2025-11-01T00:00:00Z"
  },
  "nodemailer": {
    "today": 0,
    "dailyLimit": 500,
    ...
  }
}
```

#### 3.5.3 알림 시스템
```javascript
// 한도 80% 도달 시 알림
if (usage.percentage > 80) {
  await notifyAdmin({
    type: 'EMAIL_LIMIT_WARNING',
    provider: 'sendgrid',
    usage: '80/100',
    message: 'SendGrid 일일 한도 80% 도달'
  });
}
```

---

### 3.6 검증 & 보안

#### 3.6.1 이메일 주소 검증
```javascript
// 형식 검증
validateEmailFormat('user@example.com')  // true

// 도메인 검증 (MX 레코드 확인)
await validateEmailDomain('user@fake-domain.com')  // false

// 일회용 이메일 차단
isDisposableEmail('temp@guerrillamail.com')  // true
```

#### 3.6.2 스팸 방지
```javascript
// 동일 수신자 중복 전송 방지
const recentlySent = await checkRecentSend('user@example.com', '5m');
if (recentlySent) {
  throw new Error('이미 최근에 전송된 이메일입니다');
}

// Rate Limiting (수신자별)
const recipientLimit = await rateLimiter.checkRecipient('user@example.com');
```

#### 3.6.3 API 키 보호
```javascript
// 환경변수 필수
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required');
}

// API 키 마스킹 (로그)
logger.info('Using SendGrid API Key: SG.****abc')
```

---

### 3.7 에러 처리

#### 3.7.1 커스텀 에러 클래스
```javascript
class EmailError extends Error {
  constructor(message, code, provider) {
    super(message);
    this.code = code;
    this.provider = provider;
  }
}

class EmailLimitExceededError extends EmailError {
  constructor(details) {
    super('Email limit exceeded', 'RATE_LIMIT', details.provider);
    this.limit = details.limit;
    this.used = details.used;
    this.resetAt = details.resetAt;
  }
}

class EmailValidationError extends EmailError {}
class EmailProviderError extends EmailError {}
```

#### 3.7.2 Graceful Degradation
```javascript
// Provider 장애 시 자동 전환
try {
  await sendgridAdapter.send(options);
} catch (error) {
  if (config.autoFallback) {
    logger.warn('SendGrid failed, trying SES');
    await sesAdapter.send(options);
  }
}
```

---

## 4. 기술 스택

### 4.1 Core
- **Runtime**: Node.js (v18+)
- **Email Libraries**:
  - Nodemailer (SMTP)
  - @sendgrid/mail (SendGrid)
  - aws-sdk (AWS SES)
  - mailgun.js (Mailgun)
  - resend (Resend)

### 4.2 템플릿 & 검증
- **Template Engine**: Handlebars
- **Validation**: validator.js, email-validator
- **HTML**: mjml (반응형 이메일)

### 4.3 인프라 (tommy-common 활용)
- **Queue**: Bull (Redis)
- **Logging**: Winston
- **Rate Limiting**: Redis
- **Storage**: Redis (사용량 추적)

---

## 5. 프로젝트 구조

```
tommy-common/
└── backend/
    └── modules/
        └── email/
            ├── index.js                 # EmailService 메인
            ├── config/
            │   ├── limits.js            # Provider별 한도
            │   └── providers.js         # Provider 설정
            │
            ├── adapters/
            │   ├── EmailAdapter.js      # 추상 클래스
            │   ├── NodemailerAdapter.js
            │   ├── SendGridAdapter.js
            │   ├── SESAdapter.js
            │   ├── MailgunAdapter.js
            │   └── ResendAdapter.js
            │
            ├── core/
            │   ├── RateLimiter.js       # 한도 관리
            │   ├── TemplateEngine.js    # 템플릿 렌더링
            │   ├── Validator.js         # 이메일 검증
            │   └── Queue.js             # 이메일 큐
            │
            ├── templates/
            │   ├── otp.html
            │   ├── welcome.html
            │   ├── reset-password.html
            │   ├── verification.html
            │   └── layouts/
            │       └── base.html        # 공통 레이아웃
            │
            ├── utils/
            │   ├── errors.js            # 커스텀 에러
            │   ├── logger.js            # 로깅 유틸
            │   └── formatter.js         # 데이터 포맷
            │
            └── tests/
                ├── adapters.test.js
                ├── rate-limiter.test.js
                └── templates.test.js
```

---

## 6. API 설계

### 6.1 초기화
```javascript
// tommy-common/backend/modules/email/index.js
const EmailService = require('tommy-common/backend/modules/email');

const emailService = new EmailService({
  provider: 'sendgrid',        // 기본 Provider
  fallbackProviders: ['ses', 'mailgun'],  // 장애 시 대체
  enableQueue: true,           // Queue 사용
  autoFallback: true,          // 자동 전환
  checkLimits: true,           // 한도 체크
  redis: {                     // Redis 설정
    host: 'localhost',
    port: 6379
  }
});
```

### 6.2 기본 전송
```javascript
// 단일 전송
const result = await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello</h1>',
  from: 'noreply@myapp.com'  // 선택
});

// 결과
{
  success: true,
  provider: 'sendgrid',
  messageId: 'msg_123',
  sentAt: '2025-10-05T10:00:00Z'
}
```

### 6.3 템플릿 전송
```javascript
await emailService.sendTemplate('otp', {
  to: 'user@example.com',
  data: {
    code: '123456',
    name: 'Tommy',
    expiresIn: '5분'
  }
});
```

### 6.4 대량 전송
```javascript
await emailService.sendBatch([
  { to: 'user1@example.com', subject: '...', html: '...' },
  { to: 'user2@example.com', subject: '...', html: '...' },
  // ... 최대 100개
]);
```

### 6.5 사용량 조회
```javascript
const usage = await emailService.getUsage();
// 또는 특정 Provider
const sendgridUsage = await emailService.getUsage('sendgrid');

{
  provider: 'sendgrid',
  daily: { used: 45, limit: 100, remaining: 55 },
  monthly: { used: 1234, limit: 3000, remaining: 1766 },
  resetAt: {
    daily: '2025-10-06T00:00:00Z',
    monthly: '2025-11-01T00:00:00Z'
  }
}
```

### 6.6 Provider 전환
```javascript
// 런타임에 Provider 변경
await emailService.switchProvider('ses');

// 일회성 Provider 지정
await emailService.send(options, { provider: 'mailgun' });
```

---

## 7. 환경 변수

```bash
# .env

# 기본 설정
EMAIL_PROVIDER=sendgrid          # nodemailer|sendgrid|ses|mailgun|resend
EMAIL_FROM=noreply@myapp.com
EMAIL_ENABLE_QUEUE=true
EMAIL_AUTO_FALLBACK=true
EMAIL_CHECK_LIMITS=true

# Nodemailer (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SendGrid
SENDGRID_API_KEY=SG.xxxxx

# AWS SES
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_SES_FROM=noreply@myapp.com

# Mailgun
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=mg.myapp.com

# Resend
RESEND_API_KEY=re_xxxxx

# Redis (Rate Limiting & Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 한도 설정 (커스텀 - 선택)
EMAIL_DAILY_LIMIT_SENDGRID=100
EMAIL_MONTHLY_LIMIT_SENDGRID=3000
```

---

## 8. 사용 시나리오

### 8.1 OTP 인증 (소셜 로그인)
```javascript
// tommy-social-auth에서 사용
const emailService = require('tommy-common/backend/modules/email');

// OTP 발송
await emailService.sendTemplate('otp', {
  to: user.email,
  data: {
    code: generateOTP(),
    name: user.name,
    expiresIn: '5분'
  }
});

// 사용량 체크
const usage = await emailService.getUsage();
if (usage.daily.remaining < 10) {
  // 관리자 알림
  await notifyAdmin('SendGrid 일일 한도 거의 소진');
}
```

### 8.2 회원가입 환영 메일
```javascript
// 회원가입 완료 후
await emailService.sendTemplate('welcome', {
  to: newUser.email,
  data: {
    name: newUser.name,
    verificationLink: generateVerificationLink(newUser)
  }
});
```

### 8.3 비밀번호 재설정
```javascript
await emailService.sendTemplate('reset-password', {
  to: user.email,
  data: {
    resetLink: generateResetLink(user),
    expiresIn: '1시간'
  }
});
```

### 8.4 한도 초과 시 대응
```javascript
try {
  await emailService.send(options);
} catch (error) {
  if (error instanceof EmailLimitExceededError) {
    // 사용자에게 안내
    res.status(429).json({
      error: '일일 이메일 전송 한도를 초과했습니다',
      resetAt: error.resetAt,
      message: '내일 다시 시도해주세요'
    });
  }
}
```

---

## 9. 비기능적 요구사항

### 9.1 성능
- 이메일 전송: 비동기 처리 (Queue)
- API 응답 시간: < 100ms (Queue 사용 시)
- 대량 전송: 초당 10건 처리
- Redis 캐싱으로 사용량 조회 최적화

### 9.2 보안
- API 키 환경변수 관리
- 이메일 주소 검증 (형식, 도메인)
- 스팸 방지 (중복 전송, Rate Limiting)
- 로그에서 민감정보 마스킹

### 9.3 신뢰성
- Provider 장애 시 자동 Fallback
- 전송 실패 시 3회 자동 재시도
- 트랜잭션 기반 사용량 관리
- 한도 초과 시 안전한 에러 처리

### 9.4 확장성
- 새 Provider 추가 쉬움 (Adapter 구현)
- 템플릿 추가 간단 (HTML 파일)
- Queue로 대량 전송 가능
- 수평 확장 가능 (Redis 공유)

### 9.5 모니터링
- 전송 성공/실패율 추적
- Provider별 사용량 실시간 모니터링
- 한도 80% 도달 시 자동 알림
- 에러 로그 상세 기록

---

## 10. 제약사항과 가정사항

### 10.1 제약사항
**개발 기간**: 3일
- Day 1: Adapter 구현 (5개)
- Day 2: Rate Limiter + Queue + 템플릿
- Day 3: 테스트 + 문서화

**환경 제약**:
- Redis 필수 (Rate Limiting, Queue)
- Node.js v18+
- tommy-common 의존

**범위 제약**:
- 첨부파일 10MB 제한
- HTML 이메일만 (Plain Text는 자동 생성)
- 템플릿 5개까지 (추가 확장 가능)

### 10.2 가정사항
**사용 환경**:
- 무료 티어로 시작 (월 3,000~62,000통)
- Redis 서버 사용 가능
- 각 Provider 계정 보유

**사용자**:
- Email Provider 기본 개념 이해
- 환경변수 설정 가능
- tommy-common 사용 중

---

## 11. 성공 기준

### 11.1 정량적 지표
✅ 5개 Provider Adapter 완성  
✅ 무료 한도 자동 관리 기능  
✅ 5개 이메일 템플릿  
✅ Queue 시스템 통합  
✅ 전송 성공률 > 99%  
✅ API 응답 시간 < 100ms  
✅ 3일 내 완료

### 11.2 정성적 지표
✅ Provider 전환 시 코드 변경 없음 (설정만)  
✅ 한도 초과 시 안전한 에러 처리  
✅ 문서만 보고 사용 가능  
✅ tommy-social-auth에 바로 통합 가능  
✅ 실제 프로젝트에 즉시 적용 가능

---

## 12. 개발 일정

### Day 1: Provider Adapters
- ✅ EmailAdapter 추상 클래스 설계
- ✅ NodemailerAdapter 구현
- ✅ SendGridAdapter 구현
- ✅ SESAdapter 구현
- ✅ MailgunAdapter 구현
- ✅ ResendAdapter 구현

### Day 2: 핵심 기능
- ✅ RateLimiter 구현 (Redis)
- ✅ 한도 설정 및 체크 로직
- ✅ Queue 시스템 통합 (Bull)
- ✅ TemplateEngine 구현
- ✅ 5개 템플릿 작성

### Day 3: 완성
- ✅ Validator 구현
- ✅ 에러 처리 및 로깅
- ✅ 통합 테스트
- ✅ 문서화 (README, 예제)
- ✅ tommy-social-auth 통합 예제

---

## 13. 위험 요소 & 대응

| 위험 | 대응 방안 |
|------|----------|
| Provider API 변경 | Adapter Pattern으로 격리, 영향 최소화 |
| 한도 추적 오류 | Redis Transaction + 보수적 카운팅 |
| Redis 장애 | 메모리 Fallback (일시적) + 알림 |
| 대량 전송 실패 | Queue + 자동 재시도 + 로깅 |
| 스팸 신고 | 수신자 검증 + Rate Limiting 강화 |

---

## 14. 향후 확장 계획

### Phase 2
- ✅ 첨부파일 지원 (S3 통합)
- ✅ React Email 통합 (JSX 템플릿)
- ✅ 이메일 추적 (Open, Click Tracking)
- ✅ Webhook 처리 (Bounce, Spam 알림)

### Phase 3
- ✅ 사용량 대시보드 UI
- ✅ A/B 테스트 기능
- ✅ 템플릿 에디터
- ✅ 더 많은 Provider (Postmark, Mailtrap 등)

---

## 15. 측정 지표

### 개발 효율
- 이메일 기능 추가: 1일 → 10분
- Provider 전환: 1주 → 1분 (.env 수정)
- 템플릿 작성: 2시간 → 20분

### 비용 절감
- 초기 비용: $0 (무료 티어)
- 월 3,000~62,000통 무료
- 유료 전환 시점 명확히 파악 가능

### 안정성
- 전송 성공률: > 99%
- 한도 초과 사고: 0건
- Provider 장애 대응: 자동 Fallback

---

## 16. 참고 자료

**유사 라이브러리**:
- NestJS Mailer Module
- Laravel Mail
- Rails ActionMailer

**우리 모듈의 차이점**:
- ✅ **무료 한도 자동 관리** (핵심 차별화!)
- ✅ 5개 Provider 즉시 사용 가능
- ✅ tommy-common 생태계 통합
- ✅ Express 기반 (학습 곡선 낮음)

---

## 17. 결론

**Email Module의 핵심 가치:**
1. **비용 관리**: 무료 한도 자동 추적으로 예상치 못한 과금 방지
2. **유연성**: 5개 Provider 자유롭게 전환
3. **안정성**: Queue + 재시도 + Fallback
4. **생산성**: tommy-common과 완벽 통합
