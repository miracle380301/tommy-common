export interface ErrorInfo {
    code: string;
    message: string;
    statusCode?: number;
    details?: any;
    source?: 'client' | 'server';
}
export interface ErrorHandler {
    handleError(error: ErrorInfo): Promise<void>;
    formatError?(error: ErrorInfo): any;
}
export interface ErrorContext {
    userId?: string;
    requestId?: string;
    url?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    timestamp?: number;
    [key: string]: any;
}
