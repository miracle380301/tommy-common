import BaseError, { type ErrorContext } from '../base/BaseErrors.ts';

export interface ServerErrorHandlerConfig {
  serviceName?: string;
  environment?: 'development' | 'staging' | 'production';
  onError?: (error: BaseError, context: ErrorContext) => void | Promise<void>;
}

export default class ServerErrorHandler {
  private config: ServerErrorHandlerConfig;

  constructor(config: ServerErrorHandlerConfig = {}) {
    this.config = {
      serviceName: config.serviceName || 'server-app',
      environment: config.environment || (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      onError: config.onError
    };
  }

  async handleError(error: BaseError, context: ErrorContext = {}): Promise<void> {
    const serverContext = this.createServerContext(context);

    if (this.config.onError) {
      await this.config.onError(error, serverContext);
    }
  }

  private createServerContext(context: ErrorContext = {}): ErrorContext {
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
    return (err: any, req: any, res: any, next: any) => {
      const error = err instanceof BaseError ? err : new BaseError(
        err.message || 'Internal Server Error',
        err.statusCode || 500,
        'SERVER_ERROR',
        err
      );

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

  setupGlobalHandlers(): void {
    process.on('uncaughtException', (err) => {
      const error = new BaseError(
        `Uncaught Exception: ${err.message}`,
        500,
        'UNCAUGHT_EXCEPTION',
        { stack: err.stack }
      );
      this.handleError(error);
    });

    process.on('unhandledRejection', (reason) => {
      const error = new BaseError(
        'Unhandled Promise Rejection',
        500,
        'UNHANDLED_REJECTION',
        { reason }
      );
      this.handleError(error);
    });
  }
}