"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBLoggerAdapter = exports.DatabaseLoggerAdapter = void 0;
class DatabaseLoggerAdapter {
    constructor(config = {}) {
        this.buffer = [];
        this.config = {
            connectionString: config.connectionString || '',
            tableName: config.tableName || 'logs',
            batchSize: config.batchSize || 100,
            flushInterval: config.flushInterval || 5000,
            createTableIfNotExists: config.createTableIfNotExists !== false
        };
        this.startFlushTimer();
    }
    startFlushTimer() {
        if (this.config.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
                this.flush();
            }, this.config.flushInterval);
        }
    }
    async log(entry) {
        this.buffer.push(entry);
        if (this.buffer.length >= this.config.batchSize) {
            await this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0)
            return;
        const entries = [...this.buffer];
        this.buffer = [];
        try {
            await this.insertBatch(entries);
        }
        catch (error) {
            // 실패한 엔트리는 버퍼에 다시 추가
            this.buffer.unshift(...entries);
            throw error;
        }
    }
    async insertBatch(entries) {
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
    async close() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flush();
        // await this.db.close();
    }
}
exports.DatabaseLoggerAdapter = DatabaseLoggerAdapter;
// MongoDB 어댑터 예시
class MongoDBLoggerAdapter {
    constructor(config) {
        this.buffer = [];
        this.collection = config.collection;
        this.config = {
            batchSize: config.batchSize || 100
        };
    }
    async log(entry) {
        this.buffer.push(entry);
        if (this.buffer.length >= this.config.batchSize) {
            await this.flush();
        }
    }
    async flush() {
        if (this.buffer.length === 0)
            return;
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
        }
        catch (error) {
            // 실패 시 버퍼 복원
            this.buffer.unshift(...documents);
            throw error;
        }
    }
}
exports.MongoDBLoggerAdapter = MongoDBLoggerAdapter;
