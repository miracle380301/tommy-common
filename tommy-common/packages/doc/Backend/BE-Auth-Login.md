Day 5: 인증 시스템 (2) - 로그인 & 미들웨어
📋 목표
로그인/로그아웃 API 구현 및 인증/권한 미들웨어 개발
📁 디렉토리 구조
src/modules/auth/
├── controllers/
│   └── authController.js  # 업데이트 (login, logout, refresh 추가)
├── services/
│   └── authService.js     # 업데이트
├── middlewares/
│   ├── authenticate.js    # 인증 미들웨어
│   ├── authorize.js       # 권한 미들웨어
│   └── index.js
└── index.js
🎯 구현 모듈
5.1 Auth Service 추가 기능
파일 위치: src/modules/auth/services/authService.js (업데이트)
추가 메서드:

login(email, password, meta)

입력: email, password, { ipAddress, userAgent }
프로세스:

이메일로 사용자 조회 (password 포함)
사용자 없음 → 401 에러
비밀번호 검증 (comparePassword)
실패 → 401 에러
Token Pair 생성 (generateTokenPair)
lastLoginAt 업데이트


반환:



javascript   {
     user: { id, name, email, role },
     tokens: { accessToken, refreshToken, expiresIn }
   }

logout(refreshToken)

Refresh Token 삭제
deleteRefreshToken(refreshToken) 호출
반환: boolean (성공 여부)


refreshAccessToken(refreshToken)

입력: Refresh Token
프로세스:

Refresh Token 검증 (verifyRefreshToken)
DB에서 토큰 조회 (findRefreshToken)
없거나 만료 → 401 에러
새 Access Token 생성
(선택) Refresh Token도 갱신 (Refresh Token Rotation)


반환:



javascript   {
     accessToken: '...',
     refreshToken: '...',  // 선택적 (Rotation 시)
     expiresIn: '7d'
   }

getUserById(userId)

ID로 사용자 조회
password 필드 제외
반환: 사용자 객체



5.2 Auth Controller 추가 엔드포인트
파일 위치: src/modules/auth/controllers/authController.js (업데이트)
1. POST /auth/login
javascript// 요청
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// 응답 (200)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "expiresIn": "7d"
    }
  }
}
구현:
javascriptasync login(req, res, next) {
  try {
    const { email, password } = req.body;
    const meta = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };
    
    const result = await authService.login(email, password, meta);
    
    successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}
Validation:
javascriptconst loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
2. POST /auth/logout
javascript// 요청
{
  "refreshToken": "eyJhbG..."
}

// 응답 (200)
{
  "success": true,
  "message": "Logout successful"
}
3. POST /auth/refresh
javascript// 요청
{
  "refreshToken": "eyJhbG..."
}

// 응답 (200)
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": "7d"
  }
}
4. GET /auth/me
javascript// 헤더: Authorization: Bearer <accessToken>

// 응답 (200)
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
구현:
javascriptasync getMe(req, res, next) {
  try {
    // req.user는 authenticate 미들웨어에서 설정됨
    const user = await authService.getUserById(req.user.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    successResponse(res, user);
  } catch (error) {
    next(error);
  }
}
5.3 인증 미들웨어
파일 위치: src/modules/auth/middlewares/authenticate.js
목적: JWT 토큰을 검증하고 사용자 정보를 req에 추가
미들웨어 종류:
1. authenticate (필수 인증)
javascriptasync function authenticate(req, res, next) {
  try {
    // 1. Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }
    
    // 2. 토큰 추출
    const token = authHeader.split(' ')[1];
    
    // 3. 토큰 검증
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      throw new AppError('Invalid token', 401);
    }
    
    // 4. req.user에 정보 추가
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}
2. optionalAuth (선택적 인증)
javascriptasync function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }
    }
    
    // 토큰이 없거나 유효하지 않아도 계속 진행
    next();
  } catch (error) {
    // 에러 무시하고 계속
    next();
  }
}
사용 시나리오:

게시글 조회: 로그인 없이도 가능하지만, 로그인하면 추가 정보 표시
좋아요 여부 확인: 사용자 정보가 있으면 좋아요 여부 표시

5.4 권한 미들웨어
파일 위치: src/modules/auth/middlewares/authorize.js
목적: 특정 역할이나 권한을 가진 사용자만 접근 허용
미들웨어 종류:
1. requireRole(...roles)
javascriptfunction requireRole(...roles) {
  return (req, res, next) => {
    // authenticate 미들웨어가 먼저 실행되어야 함
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    next();
  };
}

// 사용 예
app.delete('/users/:id', authenticate, requireRole('admin'), deleteUser);
2. requirePermission(...permissions)
javascript// User 모델에 permissions 배열 추가 필요
// permissions: ['post:create', 'post:edit', 'post:delete', 'user:manage']

function requirePermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    // DB에서 사용자 권한 조회
    const user = await userRepo.findById(req.user.userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // 필요한 권한이 모두 있는지 확인
    const hasPermission = permissions.every(p => 
      user.permissions.includes(p)
    );
    
    if (!hasPermission) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    next();
  };
}

// 사용 예
app.post('/posts', authenticate, requirePermission('post:create'), createPost);
3. resourceOwner(resourceGetter)
javascript// 리소스 소유자만 접근 허용 (자신의 게시글만 수정/삭제)

function resourceOwner(resourceGetter) {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    // 리소스 조회
    const resource = await resourceGetter(req);
    
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }
    
    // 소유자 확인 (또는 admin)
    const isOwner = resource.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return next(new AppError('You can only modify your own resources', 403));
    }
    
    // req에 리소스 추가 (중복 조회 방지)
    req.resource = resource;
    
    next();
  };
}

// 사용 예
app.put('/posts/:id', 
  authenticate, 
  resourceOwner(async (req) => {
    return await postRepo.findById(req.params.id);
  }),
  updatePost
);
5.5 미들웨어 내보내기
파일 위치: src/modules/auth/middlewares/index.js
javascriptconst { authenticate, optionalAuth } = require('./authenticate');
const { requireRole, requirePermission, resourceOwner } = require('./authorize');

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  resourceOwner,
};
📦 패키지 의존성
(Day 4와 동일)
📝 사용 예제
파일 위치: examples/day5-auth-complete.js
javascriptconst express = require('express');
const { authController, authMiddleware } = require('../src/modules/auth');

const app = express();
app.use(express.json());

// 공개 엔드포인트
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);

// 인증 필요
app.post('/auth/logout', authMiddleware.authenticate, authController.logout);
app.get('/auth/me', authMiddleware.authenticate, authController.getMe);

// 권한 필요
app.get('/admin/users', 
  authMiddleware.authenticate,
  authMiddleware.requireRole('admin'),
  getAllUsers
);

// 리소스 소유자만
app.put('/posts/:id',
  authMiddleware.authenticate,
  authMiddleware.resourceOwner(async (req) => {
    return await postRepo.findById(req.params.id);
  }),
  updatePost
);

app.listen(3000);
✅ 완료 기준

 로그인 API 정상 동작 (토큰 발급)
 로그아웃 API 정상 동작 (토큰 삭제)
 Refresh Token으로 Access Token 갱신
 authenticate 미들웨어가 유효한 토큰 검증
 만료된 토큰 → 401 에러
 requireRole이 역할별 접근 제한
 resourceOwner가 소유자만 접근 허용
 /auth/me 엔드포인트 동작