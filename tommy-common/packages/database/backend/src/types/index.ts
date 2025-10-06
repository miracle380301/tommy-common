/**
 * Database types supported
 */
export type DatabaseType = 'sqlite' | 'mongodb' | 'postgresql' | 'mysql';

/**
 * Base entity interface - all models should extend this
 */
export interface BaseEntity {
  id?: number | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Find options for queries
 */
export interface FindOptions {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  populate?: string[];
  include?: any[]; // For SQL joins
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  type: DatabaseType;

  // SQLite specific
  filename?: string;
  verbose?: boolean;

  // MongoDB specific
  uri?: string;

  // SQL specific (PostgreSQL, MySQL)
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;

  // Common options
  poolSize?: number;
  logging?: boolean;
}

/**
 * Database provider information
 */
export interface ProviderInfo {
  name: string;
  type: DatabaseType;
  version?: string;
}

/**
 * Query result wrapper
 */
export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
}
