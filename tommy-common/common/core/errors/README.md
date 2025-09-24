# Errors Module

심플하고 확장 가능한 에러 처리 모듈입니다. 필요한 기능만 선택적으로 사용할 수 있습니다.

## 📁 구조

```
errors/
├── base/
│   └── BaseErrors.ts        # 기본 에러 클래스
├── client/
│   ├── ClientErrors.ts      # 클라이언트 에러 타입들
│   └── ClientHandler.ts     # 클라이언트 에러 핸들러
├── server/
│   ├── ServerErrors.ts      # 서버 에러 타입들
│   └── ServerHandler.ts     # 서버 에러 핸들러
├── unified/
│   └── UnifiedHandler.ts    # 통합 핸들러 (자동 환경 감지)
├── error.interface.ts       # 에러 인터페이스
└── error.service.ts         # 에러 서비스
```

## 🚀 기본 사용법

### 1. 심플한 에러 처리

```typescript
import UnifiedErrorHandler from './errors/unified/UnifiedHandler';

// 가장 심플한 설정
const errorHandler = new UnifiedErrorHandler({
  serviceName: 'my-app',
  environment: 'production'
});

// 에러 처리
try {
  // 코드 실행
} catch (error) {
  await errorHandler.handleError(error);
}
```

### 2. 커스텀 에러 처리

```typescript
const errorHandler = new UnifiedErrorHandler({
  client: {
    onError: async (error, context) => {
      // 클라이언트 에러 처리
      console.error('Client Error:', error.message);
    }
  },
  server: {
    onError: async (error, context) => {
      // 서버 에러 처리
      console.error('Server Error:', error.message);
    }
  }
});
```

### 3. 환경별 핸들러 직접 사용

```typescript
// 클라이언트 전용
import ClientErrorHandler from './errors/client/ClientHandler';

const clientHandler = new ClientErrorHandler({
  onError: (error, context) => {
    // 에러 처리 로직
  }
});

// 서버 전용
import ServerErrorHandler from './errors/server/ServerHandler';

const serverHandler = new ServerErrorHandler({
  onError: (error, context) => {
    // 에러 처리 로직
  }
});
```

## 🧩 로그 기능 추가 (별도 모듈)

로그가 필요한 경우 별도 logger 모듈을 조합해서 사용합니다:

```typescript
import { createLogger } from '../logger/logger.service';
import { ConsoleLoggerAdapter } from '../logger/adapters/console.adapter';
import UnifiedErrorHandler from './errors/unified/UnifiedHandler';

// 로거 생성
const logger = createLogger(new ConsoleLoggerAdapter());

// 에러 핸들러에 로그 추가
const errorHandler = new UnifiedErrorHandler({
  client: {
    onError: (error, context) => {
      logger.error(`Client Error: ${error.message}`, error, context);
      // UI 알림 등 추가 처리
    }
  },
  server: {
    onError: (error, context) => {
      logger.error(`Server Error: ${error.message}`, error, context);
      // 모니터링 시스템 연동 등
    }
  }
});
```

## 🎯 에러 타입 사용

### 클라이언트 에러

```typescript
import {
  ValidationError,
  AuthenticationError,
  NetworkError
} from './errors/client/ClientErrors';

// 유효성 검증 에러
throw new ValidationError('이메일 형식이 올바르지 않습니다');

// 인증 에러
throw AuthenticationError.tokenExpired();

// 네트워크 에러
throw NetworkError.offline();
```

### 서버 에러

```typescript
import {
  DatabaseError,
  ExternalServiceError,
  ConfigurationError
} from './errors/server/ServerErrors';

// 데이터베이스 에러
throw DatabaseError.connectionFailed();

// 외부 서비스 에러
throw new ExternalServiceError('Payment gateway timeout');

// 설정 에러
throw new ConfigurationError('Missing API key');
```

## 🔧 Express 미들웨어

```typescript
import express from 'express';
import UnifiedErrorHandler from './errors/unified/UnifiedHandler';

const app = express();
const errorHandler = new UnifiedErrorHandler({
  server: {
    onError: (error, context) => {
      // 로그, 모니터링 등
    }
  }
});

// 라우트 설정...

// 에러 핸들링 미들웨어 (맨 마지막에 추가)
app.use(errorHandler.expressMiddleware());
```

## 🌐 글로벌 에러 핸들링

```typescript
const errorHandler = new UnifiedErrorHandler({
  // 설정...
});

// 글로벌 핸들러 설정 (앱 시작 시 한 번만 호출)
errorHandler.setupGlobalHandlers();

// 이제 처리되지 않은 에러들도 자동으로 캐치됩니다
```

## 📊 에러 모니터링 추가

외부 모니터링 서비스와 연동:

```typescript
import * as Sentry from '@sentry/node';

const errorHandler = new UnifiedErrorHandler({
  server: {
    onError: (error, context) => {
      // Sentry로 에러 전송
      Sentry.captureException(error, {
        extra: context
      });
    }
  }
});
```

## ⚡ 장점

1. **심플함** - 핵심 기능만 포함, 불필요한 복잡성 제거
2. **확장 가능** - 필요한 기능만 선택적으로 추가
3. **레고블록 방식** - 로그, 모니터링 등을 별도 모듈로 조합
4. **타입 안전** - TypeScript 완벽 지원
5. **환경 자동 감지** - 클라이언트/서버 자동 구분

## 💡 팁

- 로그가 필요없으면 logger 모듈을 사용하지 마세요
- 심플한 프로젝트는 UnifiedHandler만 사용하세요
- 복잡한 요구사항은 onError 콜백에서 처리하세요
- 각 모듈은 독립적으로 사용 가능합니다