import Database from 'better-sqlite3';
import {
  USER_TABLE_SQL,
  REFRESH_TOKEN_TABLE_SQL,
  EMAIL_VERIFICATION_TOKEN_TABLE_SQL,
  PASSWORD_RESET_TOKEN_TABLE_SQL,
} from '../models';

const DB_FILENAME = process.env.DB_FILENAME || './auth.sqlite';
const DB_VERBOSE = process.env.DB_VERBOSE === 'true';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_FILENAME, {
      verbose: DB_VERBOSE ? console.log : undefined,
    });

    // Enable foreign keys and WAL mode
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    // Initialize tables
    db.exec(USER_TABLE_SQL);
    db.exec(REFRESH_TOKEN_TABLE_SQL);
    db.exec(EMAIL_VERIFICATION_TOKEN_TABLE_SQL);
    db.exec(PASSWORD_RESET_TOKEN_TABLE_SQL);

    console.log('✅ Database initialized');
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database closed');
  }
}
