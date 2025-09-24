import BaseError, { type ErrorContext } from '../base/BaseErrors';

export interface ClientErrorHandlerConfig {
  serviceName?: string;
  environment?: 'development' | 'staging' | 'production';
  onError?: (error: BaseError, context: ErrorContext) => void | Promise<void>;
}

export default class ClientErrorHandler {
  private config: ClientErrorHandlerConfig;

  constructor(config: ClientErrorHandlerConfig = {}) {
    this.config = {
      serviceName: config.serviceName || 'client-app',
      environment: config.environment || 'development',
      onError: config.onError
    };
  }

  async handleError(error: BaseError, context: ErrorContext = {}): Promise<void> {
    const clientContext = this.createClientContext(context);

    if (this.config.onError) {
      await this.config.onError(error, clientContext);
    }

    await this.handleRecovery(error);
  }

  private createClientContext(context: ErrorContext = {}): ErrorContext {
    return {
      source: 'client',
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: Date.now(),
      ...context
    };
  }

  private async handleRecovery(error: BaseError): Promise<void> {
    switch (error.errorCode) {
      case 'AUTHENTICATION_FAILED':
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
    }
  }

  setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', async (event) => {
      const { ClientError } = await import('./ClientErrors.js');
      const error = new ClientError(
        event.message,
        500,
        'JAVASCRIPT_ERROR',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );

      await this.handleError(error);
    });

    window.addEventListener('unhandledrejection', async (event) => {
      const { ClientError } = await import('./ClientErrors.js');
      const error = new ClientError(
        'Unhandled Promise Rejection',
        500,
        'PROMISE_REJECTION',
        { reason: event.reason }
      );

      await this.handleError(error);
    });
  }
}