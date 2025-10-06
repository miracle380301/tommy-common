import express from 'express';
import cors from 'cors';
import {
  ConnectionManager,
  DatabaseConfig,
  DatabaseType,
  createSQLiteConfig
} from '../src';
import { UserRepository } from './repositories/UserRepository';
import { createUserRoutes } from './routes/user.routes';

export interface ServerConfig {
  dbType?: DatabaseType;
  filename?: string;
  verbose?: boolean;
  port?: number;
  corsOrigin?: string;

  // MongoDB specific
  uri?: string;

  // SQL specific
  host?: string;
  dbPort?: number;
  database?: string;
  username?: string;
  password?: string;
  poolSize?: number;
}

export async function startDatabaseServer(config: ServerConfig) {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Build database config from environment and options
  const dbConfig: DatabaseConfig = {
    type: config.dbType || 'sqlite',
    filename: config.filename,
    verbose: config.verbose,
    uri: config.uri,
    host: config.host,
    port: config.dbPort,
    database: config.database,
    username: config.username,
    password: config.password,
    poolSize: config.poolSize
  };

  try {
    // Connect to database
    const connection = await ConnectionManager.connect(dbConfig);
    console.log(`✅ Database connected: ${dbConfig.type}`);

    // Initialize repository with connection
    const userRepository = new UserRepository(connection, dbConfig.type);

    // Routes
    app.use('/api/users', createUserRoutes(userRepository));

    // Health check endpoint
    app.get('/health', async (req, res) => {
      const health = await ConnectionManager.healthCheck(dbConfig);
      const providerInfo = userRepository.getProviderInfo();

      res.json({
        status: health.healthy ? 'ok' : 'degraded',
        database: {
          type: dbConfig.type,
          provider: providerInfo.name,
          healthy: health.healthy
        },
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not found',
        path: req.path
      });
    });

    // Error handler
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    });

    // 서버 시작
    const port = config.port || 3001;
    const server = app.listen(port, () => {
      console.log(`🚀 Database Server running on http://localhost:${port}`);
      console.log(`   - Database: ${dbConfig.type}`);
      console.log(`   - API: http://localhost:${port}/api/users`);
      console.log(`   - Health: http://localhost:${port}/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down gracefully...');
      server.close(async () => {
        await ConnectionManager.disconnect(dbConfig);
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return { app, server, connection, userRepository };
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    throw error;
  }
}
