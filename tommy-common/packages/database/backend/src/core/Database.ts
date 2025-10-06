import Database from 'better-sqlite3';
import { DatabaseConfig } from '../config/database.config';

export class DatabaseConnection {
  private db: Database.Database | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  connect(): Database.Database {
    if (!this.db) {
      this.db = new Database(this.config.filename, {
        verbose: this.config.verbose ? console.log : undefined
      });

      // SQLite 최적화 설정
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      console.log(`✅ Database connected: ${this.config.filename}`);
    }
    return this.db;
  }

  getConnection(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  /**
   * 테이블 초기화 헬퍼
   */
  initializeTable(createTableSQL: string): void {
    const db = this.getConnection();
    db.exec(createTableSQL);
  }
}
