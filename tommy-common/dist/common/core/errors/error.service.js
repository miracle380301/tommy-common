"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorService = exports.ErrorService = void 0;
class ErrorService {
    constructor(handler) {
        this.context = {};
        this.handler = handler;
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    async handle(error) {
        const errorInfo = this.normalizeError(error);
        await this.handler.handleError(errorInfo);
    }
    format(error) {
        if (this.handler.formatError) {
            const errorInfo = this.normalizeError(error);
            return this.handler.formatError(errorInfo);
        }
        return this.normalizeError(error);
    }
    normalizeError(error) {
        if ('code' in error) {
            return error;
        }
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || 'An unknown error occurred',
            statusCode: 500,
            details: {
                stack: error.stack,
                name: error.name,
                ...this.context
            }
        };
    }
}
exports.ErrorService = ErrorService;
const createErrorService = (handler) => {
    return new ErrorService(handler);
};
exports.createErrorService = createErrorService;
