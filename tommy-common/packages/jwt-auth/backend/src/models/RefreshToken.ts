import { RefreshToken } from '../types';

export const REFRESH_TOKEN_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    isRevoked INTEGER NOT NULL DEFAULT 0,
    deviceInfo TEXT,
    ipAddress TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_userId ON refresh_tokens(userId);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
`;

export function transformRefreshToken(row: any): RefreshToken | null {
  if (!row) return null;

  return {
    ...row,
    isRevoked: Boolean(row.isRevoked),
  };
}
