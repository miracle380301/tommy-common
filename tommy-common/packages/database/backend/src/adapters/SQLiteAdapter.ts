import Database from 'better-sqlite3';
import { DatabaseAdapter } from './DatabaseAdapter';
import { BaseEntity, FindOptions, ProviderInfo, DatabaseConfig } from '../types';

/**
 * SQLite Database Adapter
 * Uses better-sqlite3 for synchronous SQLite operations
 */
export class SQLiteAdapter<T extends BaseEntity> extends DatabaseAdapter<T> {
  protected db: Database.Database;

  constructor(db: Database.Database, tableName: string) {
    super(tableName);
    this.db = db;
    this.configureSQLite();
  }

  /**
   * Configure SQLite for optimal performance
   */
  private configureSQLite(): void {
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  /**
   * Find all records
   */
  async findAll(options: FindOptions = {}): Promise<T[]> {
    const { where, limit, offset, orderBy } = options;

    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    // WHERE clause
    if (where && Object.keys(where).length > 0) {
      const conditions = Object.entries(where).map(([key]) => `${key} = ?`);
      query += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(where));
    }

    // ORDER BY clause
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    // LIMIT and OFFSET
    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }
    if (offset) {
      query += ` OFFSET ?`;
      params.push(offset);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as T[];
  }

  /**
   * Find one record by ID
   */
  async findById(id: number | string): Promise<T | null> {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.get(id) as T | undefined;
    return result || null;
  }

  /**
   * Find one record by conditions
   */
  async findOne(where: Record<string, any>): Promise<T | null> {
    const conditions = Object.entries(where).map(([key]) => `${key} = ?`);
    const values = Object.values(where);

    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`
    );
    const result = stmt.get(...values) as T | undefined;
    return result || null;
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date().toISOString();
    const dataWithTimestamps = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    const keys = Object.keys(dataWithTimestamps);
    const values = Object.values(dataWithTimestamps);
    const placeholders = keys.map(() => '?').join(', ');

    const stmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`
    );

    const result = stmt.run(...values);
    return this.findById(result.lastInsertRowid as number) as Promise<T>;
  }

  /**
   * Update a record by ID
   */
  async update(
    id: number | string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<T | null> {
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    const keys = Object.keys(dataWithTimestamp);
    const values = Object.values(dataWithTimestamp);
    const setClause = keys.map(key => `${key} = ?`).join(', ');

    const stmt = this.db.prepare(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`
    );

    const result = stmt.run(...values, id);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number | string): Promise<boolean> {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Count records
   */
  async count(where?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.entries(where).map(([key]) => `${key} = ?`);
      query += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(where));
    }

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }

  /**
   * Get provider information
   */
  getProviderInfo(): ProviderInfo {
    return {
      name: 'SQLite',
      type: 'sqlite',
      version: this.db.prepare('SELECT sqlite_version() as version').get() as any
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    this.db.close();
  }

  /**
   * Static method to create a SQLite connection
   */
  static createConnection(config: DatabaseConfig): Database.Database {
    const filename = config.filename || './database.sqlite';
    const db = new Database(filename, {
      verbose: config.verbose ? console.log : undefined
    });

    return db;
  }
}
