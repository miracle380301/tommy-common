import { LoggerAdapter, LogEntry, LogLevel } from '../logger.interface';
export interface WebhookLoggerConfig {
    url: string;
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
    minLevel?: LogLevel;
    batchSize?: number;
    flushInterval?: number;
    transformEntry?: (entry: LogEntry) => any;
}
export declare class WebhookLoggerAdapter implements LoggerAdapter {
    private config;
    private buffer;
    private flushTimer?;
    private readonly levelPriority;
    constructor(config: WebhookLoggerConfig);
    private startFlushTimer;
    private shouldLog;
    log(entry: LogEntry): Promise<void>;
    flush(): Promise<void>;
    private preparePayload;
    private sendToWebhook;
    close(): Promise<void>;
}
