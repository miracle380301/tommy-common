export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: any;
    error?: Error;
}
export interface LoggerAdapter {
    log(entry: LogEntry): void | Promise<void>;
    flush?(): Promise<void>;
    close?(): Promise<void>;
}
