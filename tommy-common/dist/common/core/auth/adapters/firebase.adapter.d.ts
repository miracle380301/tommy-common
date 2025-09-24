import { AuthAdapter } from '../auth.interface';
interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
}
export declare const createFirebaseAdapter: (config: FirebaseConfig) => AuthAdapter;
export {};
