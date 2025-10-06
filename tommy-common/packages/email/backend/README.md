# @miracle380301/email-service

재사용 가능한 이메일 전송 모듈. Email Provider를 Adapter 패턴으로 추상화하여 쉽게 교체 가능합니다.

## 설치

```bash
npm install @miracle380301/email-service
```

## 빠른 시작

### 1. Resend Adapter

```typescript
import { EmailService, ResendAdapter } from '@miracle380301/email-service';

const adapter = new ResendAdapter({
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: 'noreply@yourapp.com',
  checkLimits: true // 무료 한도 체크 활성화 (100/일, 3,000/월)
});

const emailService = new EmailService({ adapter });

await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello World!</h1>'
});
```

### 2. Nodemailer Adapter (Gmail SMTP)

```typescript
import { EmailService, NodemailerAdapter } from '@miracle380301/email-service';

const adapter = new NodemailerAdapter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS! // Gmail 앱 비밀번호
  },
  defaultFrom: 'noreply@yourapp.com',
  checkLimits: true // 무료 한도 체크 활성화 (500/일, 15,000/월)
});

const emailService = new EmailService({ adapter });
```

### 3. Custom Adapter (테스트용)

```typescript
import { EmailService, CustomAdapter } from '@miracle380301/email-service';

const emailService = new EmailService({
  adapter: new CustomAdapter(async (options) => {
    console.log('📧 Email sent to:', options.to);
    console.log('Subject:', options.subject);
  }),
  defaultFrom: 'noreply@yourapp.com'
});
```

### 4. OTP 이메일 전송

```typescript
await emailService.sendOTP('user@example.com', '123456');
```

## API

### EmailService

#### Constructor

```typescript
new EmailService(config: EmailServiceConfig)
```

- `config.adapter`: EmailAdapter 인스턴스
- `config.defaultFrom`: 기본 발신자 주소 (옵션)

#### Methods

- `send(options: EmailOptions): Promise<EmailResult>` - 이메일 전송
- `sendOTP(email: string, code: string): Promise<EmailResult>` - OTP 이메일 전송
- `getProviderInfo(): ProviderInfo` - Provider 정보 조회

### EmailOptions

```typescript
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}
```

### EmailResult

```typescript
interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}
```

## social-auth와 통합

```typescript
import { startOAuthServer } from '@miracle380301/social-auth-backend';
import { EmailService, CustomAdapter } from '@miracle380301/email-service';

// Email 서비스 생성
const emailService = new EmailService({
  adapter: new CustomAdapter(async (options) => {
    // 실제 이메일 전송 로직 (nodemailer, SendGrid 등)
    console.log('Sending email:', options);
  }),
  defaultFrom: 'noreply@myapp.com'
});

// Social Auth 서버 시작
startOAuthServer({
  jwt: { secret: 'your-secret' },
  email: {
    enabled: true,
    emailService: {
      provider: 'custom',
      config: {
        sendFunction: async (options) => {
          await emailService.send(options);
        }
      }
    }
  }
});
```

## 테스트

### Backend 서버 실행

```bash
cd packages/email/backend
npm install
npm run dev
```

### Frontend 테스트 UI

```bash
cd packages/email/frontend
npm install
npm run dev
```

브라우저에서 http://localhost:5174 접속

## 라이선스

MIT
