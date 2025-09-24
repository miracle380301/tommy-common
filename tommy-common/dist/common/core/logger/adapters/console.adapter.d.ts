import { LoggerAdapter, LogEntry } from '../logger.interface';
export declare class ConsoleLoggerAdapter implements LoggerAdapter {
    private colors;
    log(entry: LogEntry): void;
}
