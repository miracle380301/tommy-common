# Day 8: 입력 검증 (Validation)

## 📋 목표
Joi를 활용한 체계적인 입력 검증 시스템 구축 및 공통 validation 미들웨어 개발

## 📁 디렉토리 구조
```
src/modules/validation/
├── schemas/
│   ├── user.schema.js      # User 관련 스키마
│   ├── auth.schema.js      # 인증 관련 스키마
│   └── common.schema.js    # 공통 스키마
├── middlewares/
│   └── validate.js         # Validation 미들웨어
├── rules/
│   └── customRules.js      # 커스텀 validation 규칙
└── index.js
```

## 🎯 구현 모듈

### 8.1 Validation 미들웨어

**파일 위치:** `src/modules/validation/middlewares/validate.js`

**목적:** 요청 데이터(body, query, params)를 Joi 스키마로 검증

```javascript
const Joi = require('joi');
const { ValidationError } = require('../../core/errors');

/**
 * Validation 미들웨어 생성
 * @param {Object} schema - Joi 스키마 객체
 * @param {string} source - 검증 대상 ('body', 'query', 'params')
 * @returns {Function} Express 미들웨어
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        const field = detail.path.join('.');
        acc[field] = detail.message;
        return acc;
      }, {});

      return next(new ValidationError('Validation failed', errors));
    }

    req[source] = value;
    next();
  };
}
```

### 8.2 공통 스키마

**파일 위치:** `src/modules/validation/schemas/common.schema.js`

- objectId: MongoDB ObjectId 검증
- pagination: 페이지네이션 파라미터
- email: 이메일 검증
- password: 비밀번호 강도 검증
- phoneNumber: 전화번호 검증

### 8.3 User Validation 스키마

**파일 위치:** `src/modules/validation/schemas/user.schema.js`

- create: User 생성 스키마
- update: User 업데이트 스키마
- idParam: ID 파라미터 검증
- list: 목록 조회 쿼리 검증

## ✅ 완료 기준

- [ ] validate 미들웨어 구현
- [ ] 공통 스키마 정의
- [ ] User CRUD 스키마 정의
- [ ] Auth 관련 스키마 정의
- [ ] 커스텀 validation 규칙 추가
- [ ] 모든 API 엔드포인트에 validation 적용
