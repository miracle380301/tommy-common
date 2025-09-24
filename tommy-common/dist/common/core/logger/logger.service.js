"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.LoggerService = void 0;
class LoggerService {
    constructor(config = {}) {
        this.adapters = [];
        this.defaultContext = {};
        this.levelPriority = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4
        };
        this.minLevel = config.minLevel || 'info';
        this.adapters = config.adapters || [];
        this.defaultContext = config.defaultContext || {};
    }
    addAdapter(adapter) {
        this.adapters.push(adapter);
        return this;
    }
    setContext(context) {
        this.defaultContext = { ...this.defaultContext, ...context };
        return this;
    }
    setMinLevel(level) {
        this.minLevel = level;
        return this;
    }
    shouldLog(level) {
        return this.levelPriority[level] >= this.levelPriority[this.minLevel];
    }
    async log(level, message, context, error) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = {
            level,
            message,
            timestamp: new Date(),
            context: { ...this.defaultContext, ...context },
            error
        };
        await Promise.all(this.adapters.map(adapter => adapter.log(entry)));
    }
    debug(message, context) {
        return this.log('debug', message, context);
    }
    info(message, context) {
        return this.log('info', message, context);
    }
    warn(message, context) {
        return this.log('warn', message, context);
    }
    error(message, error, context) {
        return this.log('error', message, context, error);
    }
    fatal(message, error, context) {
        return this.log('fatal', message, context, error);
    }
    async flush() {
        await Promise.all(this.adapters
            .filter(adapter => adapter.flush)
            .map(adapter => adapter.flush()));
    }
    async close() {
        await Promise.all(this.adapters
            .filter(adapter => adapter.close)
            .map(adapter => adapter.close()));
    }
}
exports.LoggerService = LoggerService;
const createLogger = (config) => {
    return new LoggerService(config);
};
exports.createLogger = createLogger;
