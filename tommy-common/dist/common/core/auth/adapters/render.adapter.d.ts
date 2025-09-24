import { AuthAdapter } from '../auth.interface';
interface RenderAuthConfig {
    renderServerUrl: string;
    frontendUrl?: string;
}
export declare const createRenderAdapter: (config: RenderAuthConfig) => AuthAdapter;
export {};
