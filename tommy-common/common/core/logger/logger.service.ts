import { LoggerAdapter, LogEntry, LogLevel } from './logger.interface';

export interface LoggerConfig {
  minLevel?: LogLevel;
  adapters?: LoggerAdapter[];
  defaultContext?: any;
}

export class LoggerService {
  private adapters: LoggerAdapter[] = [];
  private defaultContext: any = {};
  private minLevel: LogLevel;
  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor(config: LoggerConfig = {}) {
    this.minLevel = config.minLevel || 'info';
    this.adapters = config.adapters || [];
    this.defaultContext = config.defaultContext || {};
  }

  addAdapter(adapter: LoggerAdapter) {
    this.adapters.push(adapter);
    return this;
  }

  setContext(context: any) {
    this.defaultContext = { ...this.defaultContext, ...context };
    return this;
  }

  setMinLevel(level: LogLevel) {
    this.minLevel = level;
    return this;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private async log(level: LogLevel, message: string, context?: any, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: { ...this.defaultContext, ...context },
      error
    };

    await Promise.all(
      this.adapters.map(adapter => adapter.log(entry))
    );
  }

  debug(message: string, context?: any) {
    return this.log('debug', message, context);
  }

  info(message: string, context?: any) {
    return this.log('info', message, context);
  }

  warn(message: string, context?: any) {
    return this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: any) {
    return this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: any) {
    return this.log('fatal', message, context, error);
  }

  async flush() {
    await Promise.all(
      this.adapters
        .filter(adapter => adapter.flush)
        .map(adapter => adapter.flush!())
    );
  }

  async close() {
    await Promise.all(
      this.adapters
        .filter(adapter => adapter.close)
        .map(adapter => adapter.close!())
    );
  }
}

export const createLogger = (config?: LoggerConfig) => {
  return new LoggerService(config);
};