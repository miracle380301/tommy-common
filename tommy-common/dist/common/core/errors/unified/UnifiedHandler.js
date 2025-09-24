"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ClientHandler_1 = __importDefault(require("../client/ClientHandler"));
const ServerHandler_1 = __importDefault(require("../server/ServerHandler"));
class UnifiedErrorHandler {
    constructor(config = {}) {
        this.config = {
            serviceName: config.serviceName || 'unified-app',
            environment: config.environment || 'development',
            autoDetect: config.autoDetect !== false,
            ...config
        };
        this.isClient = typeof window !== 'undefined';
        this.isServer = typeof process !== 'undefined' && process.versions?.node != null;
        this.setupHandlers();
    }
    setupHandlers() {
        if (this.config.client && (this.isClient || !this.config.autoDetect)) {
            this.clientHandler = new ClientHandler_1.default({
                serviceName: this.config.serviceName,
                environment: this.config.environment,
                ...this.config.client
            });
        }
        if (this.config.server && (this.isServer || !this.config.autoDetect)) {
            this.serverHandler = new ServerHandler_1.default({
                serviceName: this.config.serviceName,
                environment: this.config.environment,
                ...this.config.server
            });
        }
    }
    async handleError(error, context = {}) {
        const handler = this.selectHandler(error, context);
        if (handler) {
            await handler.handleError(error, context);
        }
    }
    selectHandler(error, _context) {
        if (error.source === 'client' && this.clientHandler) {
            return this.clientHandler;
        }
        if (error.source === 'server' && this.serverHandler) {
            return this.serverHandler;
        }
        if (this.config.autoDetect) {
            if (this.isClient && this.clientHandler) {
                return this.clientHandler;
            }
            if (this.isServer && this.serverHandler) {
                return this.serverHandler;
            }
        }
        return this.clientHandler || this.serverHandler || null;
    }
    expressMiddleware() {
        if (!this.serverHandler) {
            throw new Error('Server handler not available');
        }
        return this.serverHandler.expressMiddleware();
    }
    setupGlobalHandlers() {
        if (this.clientHandler && this.isClient) {
            this.clientHandler.setupGlobalHandlers();
        }
        if (this.serverHandler && this.isServer) {
            this.serverHandler.setupGlobalHandlers();
        }
    }
}
exports.default = UnifiedErrorHandler;
