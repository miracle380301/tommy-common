// Services
export { EmailService } from './services/EmailService';
export type { EmailServiceConfig } from './services/EmailService';

// Adapters
export { EmailAdapter } from './adapters/EmailAdapter';
export { CustomAdapter } from './adapters/CustomAdapter';
export { ResendAdapter } from './adapters/ResendAdapter';
export { NodemailerAdapter } from './adapters/NodemailerAdapter';

// Adapter Configs
export type { ResendConfig } from './adapters/ResendAdapter';
export type { NodemailerConfig } from './adapters/NodemailerAdapter';

// Types
export type { EmailOptions, EmailResult, ProviderInfo } from './types';
