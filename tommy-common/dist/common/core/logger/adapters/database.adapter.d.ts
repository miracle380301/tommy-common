import { LoggerAdapter, LogEntry } from '../logger.interface';
export interface DatabaseLoggerConfig {
    connectionString?: string;
    tableName?: string;
    batchSize?: number;
    flushInterval?: number;
    createTableIfNotExists?: boolean;
}
export declare class DatabaseLoggerAdapter implements LoggerAdapter {
    private config;
    private buffer;
    private flushTimer?;
    private db;
    constructor(config?: DatabaseLoggerConfig);
    private startFlushTimer;
    log(entry: LogEntry): Promise<void>;
    flush(): Promise<void>;
    private insertBatch;
    close(): Promise<void>;
}
export declare class MongoDBLoggerAdapter implements LoggerAdapter {
    private config;
    private collection;
    private buffer;
    constructor(config: {
        collection: any;
        batchSize?: number;
    });
    log(entry: LogEntry): Promise<void>;
    flush(): Promise<void>;
}
