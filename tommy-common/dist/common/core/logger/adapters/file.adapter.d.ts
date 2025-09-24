import { LoggerAdapter, LogEntry } from '../logger.interface';
export interface FileLoggerConfig {
    logDir?: string;
    filename?: string;
    maxFileSize?: number;
    maxFiles?: number;
    datePattern?: boolean;
}
export declare class FileLoggerAdapter implements LoggerAdapter {
    private config;
    private currentFileSize;
    private fileStream?;
    constructor(config?: FileLoggerConfig);
    private ensureLogDir;
    private getLogFilePath;
    private openFileStream;
    private rotateIfNeeded;
    private rotate;
    log(entry: LogEntry): Promise<void>;
    private formatLogEntry;
    flush(): Promise<void>;
    close(): Promise<void>;
}
