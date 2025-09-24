"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
class ClientErrorHandler {
    constructor(config = {}) {
        this.config = {
            serviceName: config.serviceName || 'client-app',
            environment: config.environment || 'development',
            onError: config.onError
        };
    }
    async handleError(error, context = {}) {
        const clientContext = this.createClientContext(context);
        if (this.config.onError) {
            await this.config.onError(error, clientContext);
        }
        await this.handleRecovery(error);
    }
    createClientContext(context = {}) {
        return {
            source: 'client',
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: Date.now(),
            ...context
        };
    }
    async handleRecovery(error) {
        switch (error.errorCode) {
            case 'AUTHENTICATION_FAILED':
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                break;
        }
    }
    setupGlobalHandlers() {
        if (typeof window === 'undefined')
            return;
        window.addEventListener('error', async (event) => {
            const { ClientError } = await Promise.resolve().then(() => __importStar(require('./ClientErrors.js')));
            const error = new ClientError(event.message, 500, 'JAVASCRIPT_ERROR', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
            await this.handleError(error);
        });
        window.addEventListener('unhandledrejection', async (event) => {
            const { ClientError } = await Promise.resolve().then(() => __importStar(require('./ClientErrors.js')));
            const error = new ClientError('Unhandled Promise Rejection', 500, 'PROMISE_REJECTION', { reason: event.reason });
            await this.handleError(error);
        });
    }
}
exports.default = ClientErrorHandler;
