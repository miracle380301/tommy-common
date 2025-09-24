import { ErrorHandler, ErrorInfo, ErrorContext } from './error.interface';

export class ErrorService {
  private handler: ErrorHandler;
  private context: ErrorContext = {};

  constructor(handler: ErrorHandler) {
    this.handler = handler;
  }

  setContext(context: ErrorContext) {
    this.context = { ...this.context, ...context };
  }

  async handle(error: Error | ErrorInfo): Promise<void> {
    const errorInfo = this.normalizeError(error);
    await this.handler.handleError(errorInfo);
  }

  format(error: Error | ErrorInfo): any {
    if (this.handler.formatError) {
      const errorInfo = this.normalizeError(error);
      return this.handler.formatError(errorInfo);
    }
    return this.normalizeError(error);
  }

  private normalizeError(error: Error | ErrorInfo): ErrorInfo {
    if ('code' in error) {
      return error as ErrorInfo;
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

export const createErrorService = (handler: ErrorHandler) => {
  return new ErrorService(handler);
};