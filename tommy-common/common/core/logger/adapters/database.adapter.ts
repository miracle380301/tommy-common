import { LoggerAdapter, LogEntry } from '../logger.interface';

export interface DatabaseLoggerConfig {
  connectionString?: string;
  tableName?: string;
  batchSize?: number;
  flushInterval?: number; // ms
  createTableIfNotExists?: boolean;
}

export class DatabaseLoggerAdapter implements LoggerAdapter {
  private config: Required<DatabaseLoggerConfig>;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private db: any; // 실제 사용 시 적절한 DB 클라이언트로 교체

  constructor(config: DatabaseLoggerConfig = {}) {
    this.config = {
      connectionString: config.connectionString || '',
      tableName: config.tableName || 'logs',
      batchSize: config.batchSize || 100,
      flushInterval: config.flushInterval || 5000,
      createTableIfNotExists: config.createTableIfNotExists !== false
    };

    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  async log(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);

    if (this.buffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await this.insertBatch(entries);
    } catch (error) {
      // 실패한 엔트리는 버퍼에 다시 추가
      this.buffer.unshift(...entries);
      throw error;
    }
  }

  private async insertBatch(entries: LogEntry[]): Promise<void> {
    // 실제 구현 시 사용할 DB에 맞춰 구현
    // 예시: PostgreSQL
    const query = `
      INSERT INTO ${this.config.tableName}
      (timestamp, level, message, context, error)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const entry of entries) {
      const values = [
        entry.timestamp,
        entry.level,
        entry.message,
        JSON.stringify(entry.context || {}),
        entry.error ? JSON.stringify({
          message: entry.error.message,
          stack: entry.error.stack
        }) : null
      ];

      // await this.db.query(query, values);
    }
  }

  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
    // await this.db.close();
  }
}

// MongoDB 어댑터 예시
export class MongoDBLoggerAdapter implements LoggerAdapter {
  private config: any;
  private collection: any;
  private buffer: LogEntry[] = [];

  constructor(config: { collection: any; batchSize?: number }) {
    this.collection = config.collection;
    this.config = {
      batchSize: config.batchSize || 100
    };
  }

  async log(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);

    if (this.buffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const documents = this.buffer.map(entry => ({
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      context: entry.context,
      error: entry.error
    }));

    this.buffer = [];

    try {
      await this.collection.insertMany(documents);
    } catch (error) {
      // 실패 시 버퍼 복원
      this.buffer.unshift(...documents);
      throw error;
    }
  }
}