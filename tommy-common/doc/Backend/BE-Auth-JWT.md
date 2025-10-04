Day 4: 인증 시스템 (1) - JWT & 비밀번호 관리
📋 목표
JWT 기반 인증 시스템의 핵심 유틸리티 구현 (토큰 생성/검증, 비밀번호 암호화, 회원가입)
📁 디렉토리 구조
src/modules/auth/
├── utils/
│   ├── jwt.js           # JWT 토큰 생성/검증
│   ├── password.js      # 비밀번호 암호화/검증
│   └── token.js         # Refresh Token 관리
├── controllers/
│   └── authController.js  # 인증 컨트롤러
├── services/
│   └── authService.js     # 인증 비즈니스 로직
├── models/
│   ├── User.mongoose.js   # Mongoose User 모델
│   └── User.sequelize.js  # Sequelize User 모델
└── index.js
🎯 구현 모듈
4.1 JWT 유틸리티
파일 위치: src/modules/auth/utils/jwt.js
기능:

generateAccessToken(payload)

jsonwebtoken.sign() 사용
payload: { userId, email, role }
옵션:



javascript   {
     secret: config.JWT_SECRET,
     expiresIn: config.JWT_EXPIRES_IN,  // 7d
     algorithm: 'HS256'
   }

반환: JWT 문자열


generateRefreshToken(payload)

Refresh Token 생성
옵션:



javascript   {
     secret: config.JWT_REFRESH_SECRET,
     expiresIn: config.JWT_REFRESH_EXPIRES_IN,  // 30d
   }

verifyAccessToken(token)

jsonwebtoken.verify() 사용
성공: decoded payload 반환
실패: null 또는 에러 던지기
에러 처리:

TokenExpiredError → 401 (만료됨)
JsonWebTokenError → 401 (유효하지 않음)




verifyRefreshToken(token)

Refresh Token 검증
verifyAccessToken과 동일하지만 다른 secret 사용


decodeToken(token)

검증 없이 토큰 디코드
jsonwebtoken.decode() 사용
디버깅/로깅 용도



환경 변수:
JWT_SECRET=your-very-secure-secret-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d
4.2 비밀번호 유틸리티
파일 위치: src/modules/auth/utils/password.js
기능:

hashPassword(password)

bcrypt.hash() 사용
salt rounds: 10 (기본값)
반환: 해시된 비밀번호 문자열
시간: 약 100ms


comparePassword(password, hashedPassword)

bcrypt.compare() 사용
반환: boolean (일치 여부)


validatePasswordStrength(password)

비밀번호 강도 검사
최소 요구사항:

길이: 8자 이상
대문자 1개 이상
소문자 1개 이상
숫자 1개 이상
특수문자 1개 이상 (선택)


반환: { valid: boolean, errors: string[] }



예제:
javascriptconst errors = [];
if (password.length < 8) errors.push('최소 8자 이상');
if (!/[A-Z]/.test(password)) errors.push('대문자 1개 이상');
if (!/[a-z]/.test(password)) errors.push('소문자 1개 이상');
if (!/[0-9]/.test(password)) errors.push('숫자 1개 이상');

return {
  valid: errors.length === 0,
  errors
};
4.3 Refresh Token 관리
파일 위치: src/modules/auth/utils/token.js
목적: Refresh Token을 DB에 저장하고 관리
스키마/테이블: RefreshToken
javascript{
  userId: ObjectId | Integer (참조),
  token: String (인덱스),
  expiresAt: Date,
  createdAt: Date,
  ipAddress: String (선택),
  userAgent: String (선택)
}
기능:

saveRefreshToken(userId, token, expiresAt, meta)

새 Refresh Token을 DB에 저장
meta: { ipAddress, userAgent }
기존 토큰이 있으면 삭제 후 저장 (1 user = 1 token)


findRefreshToken(token)

토큰으로 DB 조회
만료 체크: expiresAt > now
반환: token 문서 또는 null


deleteRefreshToken(token)

로그아웃 시 토큰 삭제
where: { token }


deleteUserTokens(userId)

특정 사용자의 모든 토큰 삭제
where: { userId }


cleanExpiredTokens()

만료된 토큰 정리 (Cron Job으로 실행)
where: { expiresAt: { $lt: now } }



4.4 User 모델
4.4.1 Mongoose 버전
파일 위치: src/modules/auth/models/User.mongoose.js
javascript{
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  
  // 소셜 로그인 (Day 6-7에서 사용)
  googleId: String,
  kakaoId: String,
  appleId: String,
  
  // 메타 정보
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
인덱스:

email (unique)
googleId, kakaoId, appleId (sparse)

4.4.2 Sequelize 버전
파일 위치: src/modules/auth/models/User.sequelize.js
javascript{
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: { isEmail: true }
  },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM('user', 'admin'), 
    defaultValue: 'user' 
  },
  isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  googleId: DataTypes.STRING,
  kakaoId: DataTypes.STRING,
  appleId: DataTypes.STRING,
  lastLoginAt: DataTypes.DATE,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}
4.5 Auth Service
파일 위치: src/modules/auth/services/authService.js
목적: 인증 관련 비즈니스 로직
기능:

register(userData)

입력: { name, email, password }
프로세스:

이메일 중복 확인 (userRepo.exists({ email }))
비밀번호 강도 검사 (validatePasswordStrength)
비밀번호 해시 (hashPassword)
사용자 생성 (userRepo.create)
민감 정보 제외 (password 제외)


반환: 생성된 사용자 객체 (password 제외)
에러:

이메일 중복 → 409
비밀번호 약함 → 400




generateTokenPair(userId, email, role)

Access Token과 Refresh Token 생성
Refresh Token을 DB에 저장
반환:



javascript   {
     accessToken: '...',
     refreshToken: '...',
     expiresIn: '7d'
   }

verifyPassword(email, password)

이메일로 사용자 조회 (password 필드 포함)
비밀번호 검증 (comparePassword)
반환: 사용자 객체 또는 null



4.6 Auth Controller
파일 위치: src/modules/auth/controllers/authController.js
목적: HTTP 요청/응답 처리
엔드포인트:

POST /auth/register

요청 본문:



json   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123!"
   }

프로세스:

입력 검증 (Joi 스키마)
authService.register() 호출
성공 응답 (201)


응답:

json   {
     "success": true,
     "message": "User registered successfully",
     "data": {
       "id": "...",
       "name": "John Doe",
       "email": "john@example.com",
       "role": "user"
     }
   }
Validation 스키마 (Joi):
javascriptconst registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});
📦 패키지 의존성
json"dependencies": {
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "joi": "^17.11.0"
}
📝 사용 예제
파일 위치: examples/day4-auth-register.js
javascriptconst express = require('express');
const { authController } = require('../src/modules/auth');

const app = express();
app.use(express.json());

// 회원가입
app.post('/auth/register', authController.register);

app.listen(3000);

// 테스트:
// curl -X POST http://localhost:3000/auth/register \
//   -H "Content-Type: application/json" \
//   -d '{"name":"John","email":"john@example.com","password":"SecurePass123!"}'
✅ 완료 기준

 JWT 토큰 생성/검증 정상 동작
 비밀번호 해시/검증 정상 동작
 비밀번호 강도 검사 구현
 Refresh Token DB 저장/조회
 회원가입 API 동작 (MongoDB & PostgreSQL)
 이메일 중복 체크
 입력 검증 (Joi)