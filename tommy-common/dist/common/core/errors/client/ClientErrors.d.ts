import BaseError, { type ErrorDetails } from '../base/BaseErrors';
/**
 * 클라이언트 에러 기본 클래스
 */
export declare class ClientError extends BaseError {
    constructor(message: string, statusCode?: number, errorCode?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldNotifyUser(): boolean;
    shouldAlertAdmin(): boolean;
}
/**
 * 유효성 검증 실패 에러
 */
export declare class ValidationError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
    static required(field: string): ValidationError;
    static invalid(field: string, value: any): ValidationError;
    static tooShort(field: string, minLength: number): ValidationError;
    static tooLong(field: string, maxLength: number): ValidationError;
}
/**
 * 인증 실패 에러
 */
export declare class AuthenticationError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldAlertAdmin(): boolean;
    static tokenExpired(): AuthenticationError;
    static invalidCredentials(): AuthenticationError;
}
/**
 * 권한 없음 에러
 */
export declare class AuthorizationError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldAlertAdmin(): boolean;
}
/**
 * 리소스를 찾을 수 없음 에러
 */
export declare class NotFoundError extends ClientError {
    constructor(resource?: string, details?: ErrorDetails);
    getUserMessage(): string;
}
/**
 * 네트워크 연결 에러
 */
export declare class NetworkError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldAlertAdmin(): boolean;
    static offline(): NetworkError;
}
/**
 * 타임아웃 에러
 */
export declare class TimeoutError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
}
/**
 * 중복 요청 에러
 */
export declare class ConflictError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
}
/**
 * 사용량 한도 초과 에러
 */
export declare class RateLimitError extends ClientError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
}
