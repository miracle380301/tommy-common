# Logger Module

독립적이고 확장 가능한 로깅 시스템입니다. 레고블록처럼 필요한 어댑터만 선택해서 조합할 수 있습니다.

## 📁 구조

```
logger/
├── logger.interface.ts      # 인터페이스 정의
├── logger.service.ts        # 핵심 로거 서비스
└── adapters/
    ├── console.adapter.ts   # 콘솔 출력
    ├── file.adapter.ts      # 파일 저장
    ├── database.adapter.ts  # DB 저장
    ├── slack.adapter.ts     # Slack 알림
    └── webhook.adapter.ts   # 웹훅 전송
```

## 🚀 기본 사용법

### 1. 심플한 콘솔 로깅

```typescript
import { createLogger } from './logger/logger.service';
import { ConsoleLoggerAdapter } from './logger/adapters/console.adapter';

const logger = createLogger({
  minLevel: 'info',
  adapters: [new ConsoleLoggerAdapter()]
});

logger.info('Application started');
logger.error('Something went wrong', new Error('Connection failed'));
```

### 2. 로그 레벨 설정

```typescript
const logger = createLogger({
  minLevel: 'warn' // debug, info는 무시됨
});

logger.debug('This will be ignored');
logger.info('This will also be ignored');
logger.warn('This will be logged');
logger.error('This will be logged');
logger.fatal('This will be logged');
```

## 📝 파일 로깅

### 기본 파일 로깅

```typescript
import { FileLoggerAdapter } from './logger/adapters/file.adapter';

const logger = createLogger({
  adapters: [
    new FileLoggerAdapter({
      logDir: './logs',
      filename: 'app.log',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      datePattern: true // app-2024-01-15.log
    })
  ]
});
```

### 파일 로테이션
- 최대 파일 크기 도달 시 자동 로테이션
- 날짜별 파일 분리 지원
- 오래된 로그 파일 자동 삭제

## 💾 데이터베이스 로깅

### PostgreSQL 예시

```typescript
import { DatabaseLoggerAdapter } from './logger/adapters/database.adapter';

const logger = createLogger({
  adapters: [
    new DatabaseLoggerAdapter({
      connectionString: 'postgresql://user:pass@localhost/db',
      tableName: 'logs',
      batchSize: 100, // 100개씩 배치 삽입
      flushInterval: 5000 // 5초마다 자동 저장
    })
  ]
});
```

### MongoDB 예시

```typescript
import { MongoDBLoggerAdapter } from './logger/adapters/database.adapter';

const logger = createLogger({
  adapters: [
    new MongoDBLoggerAdapter({
      collection: mongoCollection,
      batchSize: 50
    })
  ]
});
```

## 🔔 Slack 알림

### 에러 레벨만 Slack으로 전송

```typescript
import { SlackLoggerAdapter } from './logger/adapters/slack.adapter';

const logger = createLogger({
  adapters: [
    new ConsoleLoggerAdapter(), // 모든 로그는 콘솔에
    new SlackLoggerAdapter({
      webhookUrl: 'https://hooks.slack.com/services/...',
      minLevel: 'error', // 에러 이상만 Slack으로
      channel: '#alerts',
      username: 'Logger Bot',
      iconEmoji: ':robot_face:'
    })
  ]
});

// 이 로그는 콘솔에만 출력
logger.info('User logged in');

// 이 로그는 콘솔과 Slack 둘 다
logger.error('Payment failed', error);

// Fatal은 즉시 Slack으로 전송
logger.fatal('Database connection lost');
```

### Slack 메시지 커스터마이징

```typescript
new SlackLoggerAdapter({
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  minLevel: 'warn',
  includeContext: true, // 컨텍스트 정보 포함
  bufferSize: 10, // 10개씩 모아서 전송
  flushInterval: 5000 // 5초마다 전송
})
```

## 🌐 웹훅 전송

### 커스텀 웹훅 설정

```typescript
import { WebhookLoggerAdapter } from './logger/adapters/webhook.adapter';

const logger = createLogger({
  adapters: [
    new WebhookLoggerAdapter({
      url: 'https://api.example.com/logs',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      },
      minLevel: 'info',
      batchSize: 50,
      transformEntry: (entry) => ({
        // 커스텀 포맷
        timestamp: entry.timestamp.getTime(),
        severity: entry.level.toUpperCase(),
        msg: entry.message,
        metadata: entry.context
      })
    })
  ]
});
```

## 🎯 다중 어댑터 조합

```typescript
const logger = createLogger({
  minLevel: 'debug',
  adapters: [
    // 개발 환경: 콘솔
    new ConsoleLoggerAdapter(),

    // 모든 로그: 파일
    new FileLoggerAdapter({
      logDir: './logs',
      datePattern: true
    }),

    // 에러: Slack 알림
    new SlackLoggerAdapter({
      webhookUrl: process.env.SLACK_WEBHOOK,
      minLevel: 'error'
    }),

    // 모든 로그: 데이터베이스 (분석용)
    new DatabaseLoggerAdapter({
      connectionString: process.env.DB_URL,
      batchSize: 100
    })
  ]
});
```

## 🔧 컨텍스트 설정

```typescript
const logger = createLogger();

// 글로벌 컨텍스트
logger.setContext({
  serviceName: 'api-server',
  version: '1.0.0',
  environment: 'production'
});

// 로그별 컨텍스트
logger.info('User action', {
  userId: 123,
  action: 'login',
  ip: '192.168.1.1'
});
```

## 🎨 환경별 설정

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const adapters = [];

// 개발 환경
if (isDevelopment) {
  adapters.push(new ConsoleLoggerAdapter());
}

// 프로덕션 환경
if (isProduction) {
  adapters.push(
    new FileLoggerAdapter({
      logDir: '/var/log/app'
    }),
    new SlackLoggerAdapter({
      webhookUrl: process.env.SLACK_WEBHOOK,
      minLevel: 'error'
    })
  );
}

const logger = createLogger({
  minLevel: isDevelopment ? 'debug' : 'info',
  adapters
});
```

## 🔄 리소스 정리

```typescript
// 앱 종료 시
async function shutdown() {
  await logger.flush(); // 버퍼된 로그 모두 전송
  await logger.close(); // 연결 종료
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

## ⚡ 특징

1. **독립적** - 각 어댑터는 독립적으로 작동
2. **조합 가능** - 여러 어댑터를 자유롭게 조합
3. **레벨 필터링** - 어댑터별로 다른 로그 레벨 설정
4. **배치 처리** - 성능을 위한 배치 로깅
5. **비동기** - 논블로킹 로깅
6. **타입 안전** - TypeScript 완벽 지원

## 💡 사용 팁

- **개발 환경**: ConsoleLoggerAdapter만 사용
- **프로덕션**: File + Slack 조합 추천
- **분석이 필요한 경우**: Database 어댑터 추가
- **Fatal 에러**: 즉시 알림을 위해 Slack 사용
- **성능 최적화**: 배치 크기와 플러시 간격 조정

## 🚨 에러 핸들링과 함께 사용

```typescript
import UnifiedErrorHandler from '../errors/unified/UnifiedHandler';

const logger = createLogger({
  adapters: [new ConsoleLoggerAdapter()]
});

const errorHandler = new UnifiedErrorHandler({
  server: {
    onError: (error, context) => {
      // 에러를 로거로 기록
      logger.error(`Error occurred: ${error.message}`, error, context);
    }
  }
});
```