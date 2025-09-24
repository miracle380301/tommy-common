import BaseError, { type ErrorContext } from '../base/BaseErrors';
import { type ClientErrorHandlerConfig } from '../client/ClientHandler';
import { type ServerErrorHandlerConfig } from '../server/ServerHandler';
export interface UnifiedErrorHandlerConfig {
    serviceName?: string;
    environment?: 'development' | 'staging' | 'production';
    client?: ClientErrorHandlerConfig;
    server?: ServerErrorHandlerConfig;
    autoDetect?: boolean;
}
export default class UnifiedErrorHandler {
    private config;
    private clientHandler?;
    private serverHandler?;
    private isClient;
    private isServer;
    constructor(config?: UnifiedErrorHandlerConfig);
    private setupHandlers;
    handleError(error: BaseError, context?: ErrorContext): Promise<void>;
    private selectHandler;
    expressMiddleware(): (err: any, req: any, res: any, next: any) => void;
    setupGlobalHandlers(): void;
}
