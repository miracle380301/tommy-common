import { AuthAdapter } from '../auth.interface';
interface CustomOAuthConfig {
    authUrl: string;
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope?: string;
}
export declare const createCustomOAuthAdapter: (config: CustomOAuthConfig) => AuthAdapter;
export {};
