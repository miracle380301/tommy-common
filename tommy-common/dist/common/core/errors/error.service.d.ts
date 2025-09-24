import { ErrorHandler, ErrorInfo, ErrorContext } from './error.interface';
export declare class ErrorService {
    private handler;
    private context;
    constructor(handler: ErrorHandler);
    setContext(context: ErrorContext): void;
    handle(error: Error | ErrorInfo): Promise<void>;
    format(error: Error | ErrorInfo): any;
    private normalizeError;
}
export declare const createErrorService: (handler: ErrorHandler) => ErrorService;
