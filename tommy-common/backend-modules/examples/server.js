const {
  createApp,
  config,
  logger,
  httpLogger,
  notFoundHandler,
  errorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  paginatedResponse,
  BadRequestError,
  NotFoundError,
  asyncHandler,
  connect,
  createRepository,
  authController,
  socialController,
  authenticate,
  requireRole,
  UserMongoose,
} = require('../src');

// Upload module
const { uploadController, uploadSingle, uploadMultiple } = require('../src/modules/upload');

// Queue module
const { queueController, emailQueue, imageQueue } = require('../src/modules/queue');
const { setupSwagger } = require('../src/config/swagger');

// Use auth module's User model
const User = UserMongoose;

// Uncaught Exception 처리
handleUncaughtException();

// Database connection (auto-detect DB type from env)
let userRepository;
let app;

async function startServer() {
  try {
    // Connect to database (uses DB_TYPE from env)
    await connect();
    logger.info('Database connected successfully');

    // Repository 생성
    userRepository = createRepository(User);

    // Express 앱 생성
    app = createApp({
      corsOrigin: config.cors.origin,
      corsCredentials: config.cors.credentials,
    });

    // HTTP 요청 로깅
    app.use(httpLogger);

    // Swagger API Documentation 설정
    setupSwagger(app);

    /**
     * @swagger
     * /health:
     *   get:
     *     summary: Health check
     *     description: Check if the server and database are running
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Server is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Server is healthy
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       example: OK
     *                     database:
     *                       type: object
     *                       properties:
     *                         status:
     *                           type: string
     *                           example: connected
     *                         isConnected:
     *                           type: boolean
     *                           example: true
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     */
    app.get('/health', (req, res) => {
      const dbHealth = connection.healthCheck();
      successResponse(
        res,
        {
          status: 'OK',
          database: dbHealth,
          timestamp: new Date(),
        },
        'Server is healthy'
      );
    });

    // ========================================
    // Authentication Routes
    // ========================================

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     description: Create a new user account
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *               - password
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 example: John Doe
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john@example.com
     *               password:
     *                 type: string
     *                 minLength: 8
     *                 example: SecurePass123!
     *                 description: Must contain uppercase, lowercase, and number
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User registered successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: 507f1f77bcf86cd799439011
     *                     name:
     *                       type: string
     *                       example: John Doe
     *                     email:
     *                       type: string
     *                       example: john@example.com
     *                     role:
     *                       type: string
     *                       example: user
     *       400:
     *         description: Validation error or weak password
     *       409:
     *         description: Email already exists
     */
    app.post('/auth/register', authController.register);

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: User login
     *     description: Authenticate user and return tokens
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john@example.com
     *               password:
     *                 type: string
     *                 example: SecurePass123!
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Login successful
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         name:
     *                           type: string
     *                         email:
     *                           type: string
     *                         role:
     *                           type: string
     *                     tokens:
     *                       type: object
     *                       properties:
     *                         accessToken:
     *                           type: string
     *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                         refreshToken:
     *                           type: string
     *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                         expiresIn:
     *                           type: string
     *                           example: 7d
     *       401:
     *         description: Invalid credentials
     */
    app.post('/auth/login', authController.login);

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: User logout
     *     description: Invalidate refresh token
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Logout successful
     *       401:
     *         description: Unauthorized
     */
    app.post('/auth/logout', authenticate, authController.logout);

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     description: Get a new access token using refresh token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Token refreshed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Token refreshed
     *                 data:
     *                   type: object
     *                   properties:
     *                     accessToken:
     *                       type: string
     *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                     expiresIn:
     *                       type: string
     *                       example: 7d
     *       401:
     *         description: Invalid or expired refresh token
     */
    app.post('/auth/refresh', authController.refresh);

    /**
     * @swagger
     * /auth/me:
     *   get:
     *     summary: Get current user
     *     description: Get authenticated user's profile
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       example: 507f1f77bcf86cd799439011
     *                     name:
     *                       type: string
     *                       example: John Doe
     *                     email:
     *                       type: string
     *                       example: john@example.com
     *                     role:
     *                       type: string
     *                       example: user
     *                     isEmailVerified:
     *                       type: boolean
     *                       example: false
     *       401:
     *         description: Unauthorized
     */
    app.get('/auth/me', authenticate, authController.getMe);

    // ========================================
    // Social Authentication Routes
    // ========================================

    /**
     * @swagger
     * /auth/kakao:
     *   get:
     *     summary: Get Kakao OAuth URL
     *     description: Generate Kakao OAuth authorization URL for client redirect
     *     tags: [Social Authentication]
     *     parameters:
     *       - in: query
     *         name: redirectUri
     *         required: true
     *         schema:
     *           type: string
     *         description: The redirect URI after Kakao authentication
     *         example: http://localhost:3001/auth/kakao/callback
     *     responses:
     *       200:
     *         description: Kakao OAuth URL generated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Kakao auth URL generated
     *                 data:
     *                   type: object
     *                   properties:
     *                     authUrl:
     *                       type: string
     *                       example: https://kauth.kakao.com/oauth/authorize?client_id=...
     *       400:
     *         description: Missing redirectUri parameter
     */
    app.get('/auth/kakao', socialController.kakaoAuth);

    /**
     * @swagger
     * /auth/kakao/callback:
     *   post:
     *     summary: Kakao OAuth callback
     *     description: Complete Kakao OAuth flow and login/register user
     *     tags: [Social Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - code
     *               - redirectUri
     *             properties:
     *               code:
     *                 type: string
     *                 description: Authorization code from Kakao
     *                 example: abc123xyz789
     *               redirectUri:
     *                 type: string
     *                 description: The same redirect URI used in authorization request
     *                 example: http://localhost:3001/auth/kakao/callback
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Login successful
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                           example: 507f1f77bcf86cd799439011
     *                         name:
     *                           type: string
     *                           example: 홍길동
     *                         email:
     *                           type: string
     *                           example: user@example.com
     *                         role:
     *                           type: string
     *                           example: user
     *                         isEmailVerified:
     *                           type: boolean
     *                           example: true
     *                     tokens:
     *                       type: object
     *                       properties:
     *                         accessToken:
     *                           type: string
     *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                         refreshToken:
     *                           type: string
     *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                         expiresIn:
     *                           type: string
     *                           example: 7d
     *       400:
     *         description: Missing required parameters
     *       401:
     *         description: Kakao authentication failed
     *       409:
     *         description: Email already exists with different provider
     */
    app.post('/auth/kakao/callback', socialController.kakaoCallback);

    /**
     * @swagger
     * /auth/apple:
     *   post:
     *     summary: Apple Sign In
     *     description: Complete Apple Sign In and login/register user
     *     tags: [Social Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - idToken
     *             properties:
     *               idToken:
     *                 type: string
     *                 description: Apple ID token (JWT)
     *                 example: eyJraWQiOiJXNldjT0tCIiwiYWxnIjoiUlMyNTYifQ...
     *               user:
     *                 type: object
     *                 description: Optional user information (provided on first login only)
     *                 properties:
     *                   name:
     *                     type: object
     *                     properties:
     *                       firstName:
     *                         type: string
     *                         example: John
     *                       lastName:
     *                         type: string
     *                         example: Doe
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Login successful
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                           example: 507f1f77bcf86cd799439011
     *                         name:
     *                           type: string
     *                           example: John Doe
     *                         email:
     *                           type: string
     *                           example: user@privaterelay.appleid.com
     *                         role:
     *                           type: string
     *                           example: user
     *                         isEmailVerified:
     *                           type: boolean
     *                           example: true
     *                     tokens:
     *                       type: object
     *                       properties:
     *                         accessToken:
     *                           type: string
     *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                         refreshToken:
     *                           type: string
     *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                         expiresIn:
     *                           type: string
     *                           example: 7d
     *       400:
     *         description: Missing idToken
     *       401:
     *         description: Invalid Apple ID token
     *       409:
     *         description: Email already exists with different provider
     */
    app.post('/auth/apple', socialController.appleSignIn);

    // ========================================
    // User CRUD Routes
    // ========================================

    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Get all users
     *     description: Retrieve a paginated list of all users from the database
     *     tags: [Users]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Number of items per page
     *       - in: query
     *         name: sort
     *         schema:
     *           type: string
     *           default: -createdAt
     *         description: Sort field (prefix with - for descending)
     *     responses:
     *       200:
     *         description: Paginated list of users
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Users fetched successfully
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: 507f1f77bcf86cd799439011
     *                       name:
     *                         type: string
     *                         example: John Doe
     *                       email:
     *                         type: string
     *                         example: john@example.com
     *                       age:
     *                         type: number
     *                         example: 30
     *                       status:
     *                         type: string
     *                         example: active
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                       updatedAt:
     *                         type: string
     *                         format: date-time
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: number
     *                       example: 1
     *                     limit:
     *                       type: number
     *                       example: 10
     *                     total:
     *                       type: number
     *                       example: 50
     *                     totalPages:
     *                       type: number
     *                       example: 5
     */
    app.get('/api/users', asyncHandler(async (req, res) => {
      const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

      const result = await userRepository.paginate(
        {},
        parseInt(page),
        parseInt(limit),
        { sort }
      );

      paginatedResponse(res, result.data, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    }));

    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Get user by ID
     *     description: Retrieve a single user by their MongoDB ObjectId
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User MongoDB ObjectId
     *         example: 507f1f77bcf86cd799439011
     *     responses:
     *       200:
     *         description: User details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User fetched successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: 507f1f77bcf86cd799439011
     *                     name:
     *                       type: string
     *                       example: John Doe
     *                     email:
     *                       type: string
     *                       example: john@example.com
     *                     age:
     *                       type: number
     *                       example: 30
     *                     status:
     *                       type: string
     *                       example: active
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get('/api/users/:id', asyncHandler(async (req, res) => {
      const { id } = req.params;

      const user = await userRepository.findById(id);

      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      successResponse(res, user, 'User fetched successfully');
    }));

    /**
     * @swagger
     * /api/users:
     *   post:
     *     summary: Create a new user
     *     description: Create a new user in the database
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 example: Jane Smith
     *               email:
     *                 type: string
     *                 format: email
     *                 example: jane@example.com
     *               age:
     *                 type: number
     *                 minimum: 0
     *                 maximum: 150
     *                 example: 25
     *               status:
     *                 type: string
     *                 enum: [active, inactive, suspended]
     *                 default: active
     *                 example: active
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User created successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: 507f1f77bcf86cd799439011
     *                     name:
     *                       type: string
     *                       example: Jane Smith
     *                     email:
     *                       type: string
     *                       example: jane@example.com
     *                     age:
     *                       type: number
     *                       example: 25
     *                     status:
     *                       type: string
     *                       example: active
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       409:
     *         description: Duplicate email
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.post('/api/users', asyncHandler(async (req, res) => {
      const userData = req.body;

      const newUser = await userRepository.create(userData);

      createdResponse(res, newUser, 'User created successfully');
    }));

    /**
     * @swagger
     * /api/users/{id}:
     *   put:
     *     summary: Update user
     *     description: Update an existing user by ID
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User MongoDB ObjectId
     *         example: 507f1f77bcf86cd799439011
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 example: John Updated
     *               email:
     *                 type: string
     *                 format: email
     *                 example: updated@example.com
     *               age:
     *                 type: number
     *                 minimum: 0
     *                 maximum: 150
     *                 example: 35
     *               status:
     *                 type: string
     *                 enum: [active, inactive, suspended]
     *                 example: inactive
     *     responses:
     *       200:
     *         description: User updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User updated successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: 507f1f77bcf86cd799439011
     *                     name:
     *                       type: string
     *                       example: John Updated
     *                     email:
     *                       type: string
     *                       example: updated@example.com
     *                     age:
     *                       type: number
     *                       example: 35
     *                     status:
     *                       type: string
     *                       example: inactive
     *                     createdAt:
     *                       type: string
     *                       format: date-time
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *   delete:
     *     summary: Delete user
     *     description: Delete a user by ID
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User MongoDB ObjectId
     *         example: 507f1f77bcf86cd799439011
     *     responses:
     *       200:
     *         description: User deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: User deleted successfully
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.put('/api/users/:id', asyncHandler(async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const updatedUser = await userRepository.update(id, updateData);

      if (!updatedUser) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      updatedResponse(res, updatedUser, 'User updated successfully');
    }));

    app.delete('/api/users/:id', asyncHandler(async (req, res) => {
      const { id } = req.params;

      const deleted = await userRepository.delete(id);

      if (!deleted) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }

      deletedResponse(res, 'User deleted successfully');
    }));

    /**
     * @swagger
     * /api/error:
     *   get:
     *     summary: Test error endpoint
     *     description: Triggers an error for testing error handling
     *     tags: [Health]
     *     responses:
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    app.get('/api/error', asyncHandler(async (req, res) => {
      throw new Error('This is a test error');
    }));

    // ========================================
    // File Upload Routes
    // ========================================

    // Serve uploaded files statically
    app.use('/uploads', require('express').static('uploads'));

    /**
     * @swagger
     * /upload/single:
     *   post:
     *     summary: Upload single file
     *     description: Upload a single image file (max 5MB)
     *     tags: [File Upload]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - file
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Image file (jpeg, jpg, png, gif, webp)
     *     responses:
     *       201:
     *         description: File uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: File uploaded successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     filename:
     *                       type: string
     *                       example: 1234567890-abc123def456-myimage.jpg
     *                     originalname:
     *                       type: string
     *                       example: myimage.jpg
     *                     mimetype:
     *                       type: string
     *                       example: image/jpeg
     *                     size:
     *                       type: number
     *                       example: 102400
     *                     path:
     *                       type: string
     *                       example: uploads/1234567890-abc123def456-myimage.jpg
     *                     url:
     *                       type: string
     *                       example: http://localhost:3001/uploads/1234567890-abc123def456-myimage.jpg
     *       400:
     *         description: Invalid file or validation error
     */
    app.post('/upload/single', uploadSingle('file'), uploadController.uploadSingle);

    /**
     * @swagger
     * /upload/multiple:
     *   post:
     *     summary: Upload multiple files
     *     description: Upload multiple image files (max 10 files, 5MB each)
     *     tags: [File Upload]
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - files
     *             properties:
     *               files:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *                 description: Image files (jpeg, jpg, png, gif, webp)
     *                 maxItems: 10
     *     responses:
     *       201:
     *         description: Files uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: 3 files uploaded successfully
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       filename:
     *                         type: string
     *                       originalname:
     *                         type: string
     *                       mimetype:
     *                         type: string
     *                       size:
     *                         type: number
     *                       path:
     *                         type: string
     *                       url:
     *                         type: string
     *       400:
     *         description: Invalid files or validation error
     */
    app.post('/upload/multiple', uploadMultiple('files', 10), uploadController.uploadMultiple);

    /**
     * @swagger
     * /upload/{filename}:
     *   delete:
     *     summary: Delete uploaded file
     *     description: Delete a file from the uploads directory
     *     tags: [File Upload]
     *     parameters:
     *       - in: path
     *         name: filename
     *         required: true
     *         schema:
     *           type: string
     *         description: Name of the file to delete
     *         example: 1234567890-abc123def456-myimage.jpg
     *     responses:
     *       200:
     *         description: File deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: File deleted successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     filename:
     *                       type: string
     *                       example: 1234567890-abc123def456-myimage.jpg
     *       404:
     *         description: File not found
     */
    app.delete('/upload/:filename', uploadController.deleteFile);

    // ========================================
    // Queue Routes
    // ========================================

    /**
     * @swagger
     * /queue/email:
     *   post:
     *     summary: Send email via queue
     *     description: Add an email job to the queue for background processing
     *     tags: [Queue]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - to
     *               - subject
     *               - body
     *             properties:
     *               to:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *                 description: Recipient email address
     *               subject:
     *                 type: string
     *                 example: Welcome to our service
     *                 description: Email subject
     *               body:
     *                 type: string
     *                 example: Thank you for signing up!
     *                 description: Email body text
     *               priority:
     *                 type: number
     *                 example: 1
     *                 description: Job priority (lower is higher priority)
     *     responses:
     *       201:
     *         description: Email job added to queue
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Email job added to queue successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     jobId:
     *                       type: string
     *                       example: "123"
     *                     status:
     *                       type: string
     *                       example: queued
     *                     data:
     *                       type: object
     *                     timestamp:
     *                       type: number
     *       400:
     *         description: Invalid request data
     */
    app.post('/queue/email', queueController.sendEmail);

    /**
     * @swagger
     * /queue/image:
     *   post:
     *     summary: Process image via queue
     *     description: Add an image processing job to the queue for background processing
     *     tags: [Queue]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - filename
     *             properties:
     *               filename:
     *                 type: string
     *                 example: 1234567890-abc123def456-myimage.jpg
     *                 description: Name of the uploaded file
     *               width:
     *                 type: number
     *                 example: 800
     *                 description: Target width
     *               height:
     *                 type: number
     *                 example: 600
     *                 description: Target height
     *               quality:
     *                 type: number
     *                 example: 80
     *                 minimum: 1
     *                 maximum: 100
     *                 description: Image quality (1-100)
     *               format:
     *                 type: string
     *                 enum: [jpeg, jpg, png, webp]
     *                 example: jpeg
     *                 description: Output format
     *               priority:
     *                 type: number
     *                 example: 1
     *                 description: Job priority (lower is higher priority)
     *     responses:
     *       201:
     *         description: Image processing job added to queue
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Image processing job added to queue successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     jobId:
     *                       type: string
     *                     status:
     *                       type: string
     *                     data:
     *                       type: object
     *                     timestamp:
     *                       type: number
     *       400:
     *         description: Invalid request data
     */
    app.post('/queue/image', queueController.processImage);

    /**
     * @swagger
     * /queue/stats:
     *   get:
     *     summary: Get queue statistics
     *     description: Retrieve statistics for all queues or a specific queue
     *     tags: [Queue]
     *     parameters:
     *       - in: query
     *         name: queueName
     *         schema:
     *           type: string
     *           enum: [email, image-processing]
     *         description: Specific queue name (optional)
     *         example: email
     *     responses:
     *       200:
     *         description: Queue statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Queue statistics retrieved successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     email:
     *                       type: object
     *                       properties:
     *                         waiting:
     *                           type: number
     *                           example: 5
     *                         active:
     *                           type: number
     *                           example: 2
     *                         completed:
     *                           type: number
     *                           example: 100
     *                         failed:
     *                           type: number
     *                           example: 3
     *                         status:
     *                           type: string
     *                           example: active
     *                     imageProcessing:
     *                       type: object
     *                       properties:
     *                         waiting:
     *                           type: number
     *                         active:
     *                           type: number
     *                         completed:
     *                           type: number
     *                         failed:
     *                           type: number
     *                         status:
     *                           type: string
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     */
    app.get('/queue/stats', queueController.getStats);

    /**
     * @swagger
     * /queue/health:
     *   get:
     *     summary: Queue system health check
     *     description: Check the health status of the queue system
     *     tags: [Queue]
     *     responses:
     *       200:
     *         description: Queue system health status
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Queue system is healthy
     *                 data:
     *                   type: object
     *                   properties:
     *                     healthy:
     *                       type: boolean
     *                       example: true
     *                     queues:
     *                       type: object
     */
    app.get('/queue/health', queueController.healthCheck);

    // Initialize queues
    emailQueue.initEmailQueue();
    imageQueue.initImageQueue();

    // 404 핸들러
    app.use(notFoundHandler);

    // 전역 에러 핸들러
    app.use(errorHandler);

    // 서버 시작
    const PORT = config.server.port;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${config.server.env} mode`);
      logger.info(`📄 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
    });

    // Unhandled Rejection 처리
    handleUnhandledRejection(server);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
      });
    });

    return server;
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
