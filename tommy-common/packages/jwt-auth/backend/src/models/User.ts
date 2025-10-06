import { User } from '../types';

export const USER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    isEmailVerified INTEGER NOT NULL DEFAULT 0,
    emailVerifiedAt TEXT,
    lastLoginAt TEXT,
    loginAttempts INTEGER NOT NULL DEFAULT 0,
    lockedUntil TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

export function transformUser(row: any): User | null {
  if (!row) return null;

  return {
    ...row,
    isEmailVerified: Boolean(row.isEmailVerified),
    loginAttempts: Number(row.loginAttempts) || 0,
  };
}
