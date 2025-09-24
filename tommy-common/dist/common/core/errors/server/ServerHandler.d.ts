import BaseError, { type ErrorContext } from '../base/BaseErrors';
export interface ServerErrorHandlerConfig {
    serviceName?: string;
    environment?: 'development' | 'staging' | 'production';
    onError?: (error: BaseError, context: ErrorContext) => void | Promise<void>;
}
export default class ServerErrorHandler {
    private config;
    constructor(config?: ServerErrorHandlerConfig);
    handleError(error: BaseError, context?: ErrorContext): Promise<void>;
    private createServerContext;
    expressMiddleware(): (err: any, req: any, res: any, next: any) => void;
    setupGlobalHandlers(): void;
}
