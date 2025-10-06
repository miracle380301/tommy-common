import { DatabaseConfig, DatabaseType } from '../types';
import { SQLiteAdapter } from '../adapters/SQLiteAdapter';
import { MongooseAdapter } from '../adapters/MongooseAdapter';
import { SequelizeAdapter } from '../adapters/SequelizeAdapter';
import Database from 'better-sqlite3';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

/**
 * Connection Manager
 * Manages database connections for different database types
 */
export class ConnectionManager {
  private static connections: Map<string, any> = new Map();

  /**
   * Connect to database based on config
   */
  static async connect(config: DatabaseConfig): Promise<any> {
    const key = this.getConnectionKey(config);

    // Return existing connection if available
    if (this.connections.has(key)) {
      console.log(`♻️  Reusing existing ${config.type} connection`);
      return this.connections.get(key);
    }

    console.log(`🔌 Connecting to ${config.type}...`);

    let connection: any;

    switch (config.type) {
      case 'sqlite':
        connection = SQLiteAdapter.createConnection(config);
        break;

      case 'mongodb':
        connection = await MongooseAdapter.createConnection(config);
        break;

      case 'postgresql':
      case 'mysql':
        connection = SequelizeAdapter.createConnection(config);
        await connection.authenticate();
        break;

      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }

    this.connections.set(key, connection);
    console.log(`✅ Connected to ${config.type}`);

    return connection;
  }

  /**
   * Disconnect from database
   */
  static async disconnect(config: DatabaseConfig): Promise<void> {
    const key = this.getConnectionKey(config);
    const connection = this.connections.get(key);

    if (!connection) {
      console.log(`⚠️  No active connection for ${config.type}`);
      return;
    }

    console.log(`🔌 Disconnecting from ${config.type}...`);

    switch (config.type) {
      case 'sqlite':
        (connection as Database.Database).close();
        break;

      case 'mongodb':
        await mongoose.connection.close();
        break;

      case 'postgresql':
      case 'mysql':
        await (connection as Sequelize).close();
        break;
    }

    this.connections.delete(key);
    console.log(`✅ Disconnected from ${config.type}`);
  }

  /**
   * Disconnect all active connections
   */
  static async disconnectAll(): Promise<void> {
    console.log(`🔌 Disconnecting all connections...`);

    const promises: Promise<void>[] = [];

    for (const [key, connection] of this.connections.entries()) {
      const config = this.parseConnectionKey(key);

      promises.push(
        (async () => {
          try {
            switch (config.type) {
              case 'sqlite':
                (connection as Database.Database).close();
                break;

              case 'mongodb':
                await mongoose.connection.close();
                break;

              case 'postgresql':
              case 'mysql':
                await (connection as Sequelize).close();
                break;
            }
            console.log(`✅ Disconnected ${config.type}`);
          } catch (error) {
            console.error(`❌ Error disconnecting ${config.type}:`, error);
          }
        })()
      );
    }

    await Promise.all(promises);
    this.connections.clear();
    console.log(`✅ All connections closed`);
  }

  /**
   * Health check for database connection
   */
  static async healthCheck(config: DatabaseConfig): Promise<{ healthy: boolean; message?: string }> {
    const key = this.getConnectionKey(config);
    const connection = this.connections.get(key);

    if (!connection) {
      return { healthy: false, message: 'Not connected' };
    }

    try {
      switch (config.type) {
        case 'sqlite':
          // Try a simple query
          (connection as Database.Database).prepare('SELECT 1').get();
          break;

        case 'mongodb':
          await mongoose.connection.db?.admin().ping();
          break;

        case 'postgresql':
        case 'mysql':
          await (connection as Sequelize).authenticate();
          break;
      }

      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get connection by config
   */
  static getConnection(config: DatabaseConfig): any | null {
    const key = this.getConnectionKey(config);
    return this.connections.get(key) || null;
  }

  /**
   * Check if connection exists
   */
  static hasConnection(config: DatabaseConfig): boolean {
    const key = this.getConnectionKey(config);
    return this.connections.has(key);
  }

  /**
   * Generate unique connection key from config
   */
  private static getConnectionKey(config: DatabaseConfig): string {
    switch (config.type) {
      case 'sqlite':
        return `sqlite:${config.filename || './database.sqlite'}`;

      case 'mongodb':
        return `mongodb:${config.uri || `${config.host}:${config.port}/${config.database}`}`;

      case 'postgresql':
      case 'mysql':
        return `${config.type}:${config.host}:${config.port}/${config.database}`;

      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  /**
   * Parse connection key back to config info
   */
  private static parseConnectionKey(key: string): { type: DatabaseType } {
    const type = key.split(':')[0] as DatabaseType;
    return { type };
  }
}
