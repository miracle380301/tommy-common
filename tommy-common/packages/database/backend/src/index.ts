// Database Infrastructure Layer
// Multi-database support with Adapter Pattern

// Types
export type {
  DatabaseType,
  BaseEntity,
  FindOptions,
  DatabaseConfig,
  ProviderInfo,
  QueryResult
} from './types';

// Adapters
export { DatabaseAdapter } from './adapters/DatabaseAdapter';
export { SQLiteAdapter } from './adapters/SQLiteAdapter';
export { MongooseAdapter } from './adapters/MongooseAdapter';
export { SequelizeAdapter } from './adapters/SequelizeAdapter';

// Connection Manager
export { ConnectionManager } from './connection/ConnectionManager';

// Legacy exports (for backward compatibility)
export { DatabaseConnection } from './core/Database';
export { BaseRepository } from './core/BaseRepository';
export { createDatabaseConfig } from './config/database.config';

/**
 * Create database adapter based on config
 * This is a convenience function for simple use cases
 */
import { DatabaseConfig, BaseEntity } from './types';
import { DatabaseAdapter } from './adapters/DatabaseAdapter';
import { SQLiteAdapter } from './adapters/SQLiteAdapter';
import { MongooseAdapter } from './adapters/MongooseAdapter';
import { SequelizeAdapter } from './adapters/SequelizeAdapter';
import { ConnectionManager } from './connection/ConnectionManager';
import { Model, ModelCtor } from 'sequelize';
import { Model as MongooseModel } from 'mongoose';

export interface CreateAdapterOptions<T extends BaseEntity> {
  config: DatabaseConfig;
  tableName: string;
  model?: MongooseModel<any> | ModelCtor<Model>; // For MongoDB/SQL
  autoConnect?: boolean;
}

export async function createAdapter<T extends BaseEntity>(
  options: CreateAdapterOptions<T>
): Promise<DatabaseAdapter<T>> {
  const { config, tableName, model, autoConnect = true } = options;

  if (autoConnect && !ConnectionManager.hasConnection(config)) {
    await ConnectionManager.connect(config);
  }

  const connection = ConnectionManager.getConnection(config);

  switch (config.type) {
    case 'sqlite':
      return new SQLiteAdapter<T>(connection, tableName);

    case 'mongodb':
      if (!model) {
        throw new Error('MongoDB requires a Mongoose model');
      }
      return new MongooseAdapter<T>(model as MongooseModel<any>, tableName);

    case 'postgresql':
    case 'mysql':
      if (!model) {
        throw new Error('SQL databases require a Sequelize model');
      }
      return new SequelizeAdapter<T>(
        model as ModelCtor<Model>,
        tableName,
        config.type
      );

    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

/**
 * Simplified database configuration helpers
 */
export function createSQLiteConfig(filename: string = './database.sqlite', verbose?: boolean): DatabaseConfig {
  return {
    type: 'sqlite',
    filename,
    verbose
  };
}

export function createMongoDBConfig(uri: string, poolSize?: number): DatabaseConfig {
  return {
    type: 'mongodb',
    uri,
    poolSize
  };
}

export function createPostgreSQLConfig(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string,
  poolSize?: number
): DatabaseConfig {
  return {
    type: 'postgresql',
    host,
    port,
    database,
    username,
    password,
    poolSize
  };
}

export function createMySQLConfig(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string,
  poolSize?: number
): DatabaseConfig {
  return {
    type: 'mysql',
    host,
    port,
    database,
    username,
    password,
    poolSize
  };
}
