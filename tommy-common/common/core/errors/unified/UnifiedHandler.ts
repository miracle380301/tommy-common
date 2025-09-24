import BaseError, { type ErrorContext } from '../base/BaseErrors';
import ClientErrorHandler, { type ClientErrorHandlerConfig } from '../client/ClientHandler';
import ServerErrorHandler, { type ServerErrorHandlerConfig } from '../server/ServerHandler';

export interface UnifiedErrorHandlerConfig {
  serviceName?: string;
  environment?: 'development' | 'staging' | 'production';
  client?: ClientErrorHandlerConfig;
  server?: ServerErrorHandlerConfig;
  autoDetect?: boolean;
}

export default class UnifiedErrorHandler {
  private config: UnifiedErrorHandlerConfig;
  private clientHandler?: ClientErrorHandler;
  private serverHandler?: ServerErrorHandler;
  private isClient: boolean;
  private isServer: boolean;

  constructor(config: UnifiedErrorHandlerConfig = {}) {
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

  private setupHandlers(): void {
    if (this.config.client && (this.isClient || !this.config.autoDetect)) {
      this.clientHandler = new ClientErrorHandler({
        serviceName: this.config.serviceName,
        environment: this.config.environment,
        ...this.config.client
      });
    }

    if (this.config.server && (this.isServer || !this.config.autoDetect)) {
      this.serverHandler = new ServerErrorHandler({
        serviceName: this.config.serviceName,
        environment: this.config.environment,
        ...this.config.server
      });
    }
  }

  async handleError(error: BaseError, context: ErrorContext = {}): Promise<void> {
    const handler = this.selectHandler(error, context);

    if (handler) {
      await handler.handleError(error, context);
    }
  }

  private selectHandler(error: BaseError, _context: ErrorContext): ClientErrorHandler | ServerErrorHandler | null {
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

  setupGlobalHandlers(): void {
    if (this.clientHandler && this.isClient) {
      this.clientHandler.setupGlobalHandlers();
    }
    if (this.serverHandler && this.isServer) {
      this.serverHandler.setupGlobalHandlers();
    }
  }
}