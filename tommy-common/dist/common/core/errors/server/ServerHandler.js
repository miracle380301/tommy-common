"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseErrors_1 = __importDefault(require("../base/BaseErrors"));
class ServerErrorHandler {
    constructor(config = {}) {
        this.config = {
            serviceName: config.serviceName || 'server-app',
            environment: config.environment || process.env.NODE_ENV || 'development',
            onError: config.onError
        };
    }
    async handleError(error, context = {}) {
        const serverContext = this.createServerContext(context);
        if (this.config.onError) {
            await this.config.onError(error, serverContext);
        }
    }
    createServerContext(context = {}) {
        return {
            source: 'server',
            nodeVersion: process.version,
            timestamp: Date.now(),
            environment: this.config.environment,
            serviceName: this.config.serviceName,
            ...context
        };
    }
    expressMiddleware() {
        return (err, req, res, next) => {
            const error = err instanceof BaseErrors_1.default ? err : new BaseErrors_1.default(err.message || 'Internal Server Error', err.statusCode || 500, 'SERVER_ERROR', err);
            this.handleError(error, {
                method: req.method,
                url: req.url,
                headers: req.headers,
                ip: req.ip
            });
            res.status(error.statusCode).json({
                error: {
                    code: error.errorCode,
                    message: error.message
                }
            });
        };
    }
    setupGlobalHandlers() {
        process.on('uncaughtException', (err) => {
            const error = new BaseErrors_1.default(`Uncaught Exception: ${err.message}`, 500, 'UNCAUGHT_EXCEPTION', { stack: err.stack });
            this.handleError(error);
        });
        process.on('unhandledRejection', (reason) => {
            const error = new BaseErrors_1.default('Unhandled Promise Rejection', 500, 'UNHANDLED_REJECTION', { reason });
            this.handleError(error);
        });
    }
}
exports.default = ServerErrorHandler;
