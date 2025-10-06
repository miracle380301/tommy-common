import dotenv from 'dotenv';
import path from 'path';
import { startDatabaseServer } from './index';
import { DatabaseType } from '../src/types';

// 환경변수 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database 서버 시작
(async () => {
  try {
    await startDatabaseServer({
      dbType: (process.env.DB_TYPE as DatabaseType) || 'sqlite',
      filename: process.env.DB_FILENAME || './database.sqlite',
      verbose: process.env.DB_VERBOSE === 'true',
      uri: process.env.DB_URI,
      host: process.env.DB_HOST,
      dbPort: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      poolSize: process.env.DB_POOL_SIZE ? Number(process.env.DB_POOL_SIZE) : undefined,
      port: process.env.PORT ? Number(process.env.PORT) : 3001,
      corsOrigin: process.env.CORS_ORIGIN || '*'
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
