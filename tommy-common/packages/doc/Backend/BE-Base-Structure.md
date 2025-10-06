Day 1: 프로젝트 구조 & 기본 설정
📋 목표
Express 기반 프로젝트의 기본 골격과 공통 인프라(로거, 에러 핸들러, 환경 설정)를 구축한다.
📁 디렉토리 구조
backend-modules/
├── src/
│   ├── config/           # 환경 설정 파일
│   ├── core/             # 핵심 유틸리티
│   │   ├── logger/       # Winston 로거
│   │   ├── errors/       # 에러 클래스 & 핸들러
│   │   └── response/     # 응답 포맷터
│   ├── modules/          # 기능 모듈 (Day 2부터 추가)
│   ├── middlewares/      # 미들웨어 (Day 9부터 추가)
│   └── utils/            # 유틸리티 (Day 9부터 추가)
├── tests/
├── examples/
├── docs/
├── .env.example
├── package.json
└── README.md
🎯 구현 모듈
1.1 Express 앱 초기화
파일 위치: src/config/express.js
기능:

Express 앱 생성 함수 createApp(options)
기본 미들웨어 설정

helmet (보안 헤더)
cors (CORS 설정)
express.json() (JSON 파싱)
express.urlencoded() (URL 인코딩 파싱)
compression (응답 압축)



설정 옵션:

corsOrigin: CORS 허용 도메인 (기본값: '*')
corsCredentials: CORS 자격증명 (기본값: true)
jsonLimit: JSON 바디 크기 제한 (기본값: '10mb')
csp: Content Security Policy 설정

1.2 환경 설정 관리
파일 위치: src/config/index.js
환경 변수:
서버 설정:
- NODE_ENV (development | production)
- PORT (기본값: 3000)

데이터베이스:
- DB_TYPE (mongodb | postgresql | mysql)
- DB_URI

JWT:
- JWT_SECRET
- JWT_EXPIRES_IN (기본값: 7d)
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRES_IN (기본값: 30d)

로깅:
- LOG_LEVEL (error | warn | info | debug)

Rate Limiting:
- RATE_LIMIT_WINDOW (기본값: 15분)
- RATE_LIMIT_MAX (기본값: 100)
기능:

dotenv로 .env 파일 로드
환경 변수 검증 및 기본값 설정
타입 변환 (문자열 → 숫자)

1.3 로거 (Winston)
파일 위치: src/core/logger/index.js
로그 레벨:

error (0) - 에러만
warn (1) - 경고 + 에러
info (2) - 정보 + 경고 + 에러
http (3) - HTTP 요청 로그
debug (4) - 모든 로그

출력 형식:
[YYYY-MM-DD HH:mm:ss] LEVEL: message
파일 저장:

logs/error.log - 에러 로그만
logs/all.log - 모든 로그

색상:

error: 빨강
warn: 노랑
info: 초록
http: 마젠타
debug: 흰색

1.4 에러 처리
파일 위치: src/core/errors/
AppError 클래스:
javascriptnew AppError(message, statusCode, isOperational)

message: 에러 메시지
statusCode: HTTP 상태 코드 (기본값: 500)
isOperational: 운영 에러 여부 (기본값: true)

에러 핸들러 미들웨어:

Development 모드: 스택 트레이스 포함
Production 모드:

운영 에러 → 상세 메시지
프로그래밍 에러 → "Something went wrong"



404 핸들러:

정의되지 않은 라우트 처리
Cannot find [URL] 메시지

1.5 응답 포맷터
파일 위치: src/core/response/index.js
함수:

successResponse(res, data, message, statusCode)

json{
  "success": true,
  "message": "Success",
  "data": { ... }
}

paginatedResponse(res, data, pagination, message)

json{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

errorResponse(res, message, statusCode, errors)

json{
  "success": false,
  "message": "Error message",
  "errors": { ... }  // 선택적
}
📦 패키지 의존성
json"dependencies": {
  "express": "^4.18.2",
  "dotenv": "^16.3.1",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "compression": "^1.7.4",
  "winston": "^3.11.0"
}
✅ 완료 기준

 Express 앱이 정상적으로 시작됨
 로그가 콘솔과 파일에 기록됨
 에러 발생 시 적절한 JSON 응답 반환
 .env 파일로 설정 변경 가능
 예제 서버(examples/server.js)가 동작함