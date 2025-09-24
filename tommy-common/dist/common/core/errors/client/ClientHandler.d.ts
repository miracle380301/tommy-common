import BaseError, { type ErrorContext } from '../base/BaseErrors';
export interface ClientErrorHandlerConfig {
    serviceName?: string;
    environment?: 'development' | 'staging' | 'production';
    onError?: (error: BaseError, context: ErrorContext) => void | Promise<void>;
}
export default class ClientErrorHandler {
    private config;
    constructor(config?: ClientErrorHandlerConfig);
    handleError(error: BaseError, context?: ErrorContext): Promise<void>;
    private createClientContext;
    private handleRecovery;
    setupGlobalHandlers(): void;
}
