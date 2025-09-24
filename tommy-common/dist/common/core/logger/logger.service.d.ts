import { LoggerAdapter, LogLevel } from './logger.interface';
export interface LoggerConfig {
    minLevel?: LogLevel;
    adapters?: LoggerAdapter[];
    defaultContext?: any;
}
export declare class LoggerService {
    private adapters;
    private defaultContext;
    private minLevel;
    private readonly levelPriority;
    constructor(config?: LoggerConfig);
    addAdapter(adapter: LoggerAdapter): this;
    setContext(context: any): this;
    setMinLevel(level: LogLevel): this;
    private shouldLog;
    private log;
    debug(message: string, context?: any): Promise<void>;
    info(message: string, context?: any): Promise<void>;
    warn(message: string, context?: any): Promise<void>;
    error(message: string, error?: Error, context?: any): Promise<void>;
    fatal(message: string, error?: Error, context?: any): Promise<void>;
    flush(): Promise<void>;
    close(): Promise<void>;
}
export declare const createLogger: (config?: LoggerConfig) => LoggerService;
