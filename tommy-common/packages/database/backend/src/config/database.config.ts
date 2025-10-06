export interface DatabaseConfig {
  filename: string;
  verbose?: boolean;
}

export function createDatabaseConfig(filename?: string): DatabaseConfig {
  return {
    filename: filename || process.env.DB_FILENAME || './database.sqlite',
    verbose: process.env.DB_VERBOSE === 'true'
  };
}
