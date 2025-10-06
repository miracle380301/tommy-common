// Controllers
export { AuthController } from './controllers/AuthController';

// Services
export { AuthService } from './services/AuthService';

// Middlewares
export { authenticate, requireRole } from './middlewares/auth';

// Models
export * from './models';

// Utils
export * from './utils';

// Types
export * from './types';

// Routes
export { default as authRouter } from './routes/auth.routes';

// Database
export { getDatabase, closeDatabase } from './config/database';
