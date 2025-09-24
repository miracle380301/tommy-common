import BaseError, { type ErrorDetails } from '../base/BaseErrors';
/**
 * 서버 에러 기본 클래스
 */
export declare class ServerError extends BaseError {
    constructor(message: string, statusCode?: number, errorCode?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldNotifyUser(): boolean;
    shouldAlertAdmin(): boolean;
}
/**
 * 데이터베이스 관련 에러
 */
export declare class DatabaseError extends ServerError {
    constructor(message?: string, details?: ErrorDetails);
    shouldAlertAdmin(): boolean;
    static connectionFailed(details?: ErrorDetails): DatabaseError;
    static queryFailed(query: string, error: Error, details?: ErrorDetails): DatabaseError;
    static transactionFailed(details?: ErrorDetails): DatabaseError;
}
/**
 * 외부 서비스 연동 에러
 */
export declare class ExternalServiceError extends ServerError {
    constructor(serviceName: string, message?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldAlertAdmin(): boolean;
    static timeout(serviceName: string, timeout: number, details?: ErrorDetails): ExternalServiceError;
    static unavailable(serviceName: string, statusCode: number, details?: ErrorDetails): ExternalServiceError;
}
/**
 * 설정 관련 에러
 */
export declare class ConfigurationError extends ServerError {
    constructor(message?: string, details?: ErrorDetails);
    shouldAlertAdmin(): boolean;
    static missingEnvVar(varName: string): ConfigurationError;
    static invalidConfig(configKey: string, value: any): ConfigurationError;
}
/**
 * 파일 시스템 에러
 */
export declare class FileSystemError extends ServerError {
    constructor(message?: string, details?: ErrorDetails);
    static fileNotFound(filePath: string): FileSystemError;
    static permissionDenied(filePath: string, operation: string): FileSystemError;
    static diskFull(availableSpace: number): FileSystemError;
}
/**
 * 메모리/리소스 부족 에러
 */
export declare class ResourceError extends ServerError {
    constructor(message?: string, details?: ErrorDetails);
    shouldAlertAdmin(): boolean;
    static memoryExhausted(currentUsage: number, limit: number): ResourceError;
    static cpuThrottled(currentLoad: number, threshold: number): ResourceError;
}
/**
 * 비즈니스 로직 에러
 */
export declare class BusinessLogicError extends ServerError {
    constructor(message: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldNotifyUser(): boolean;
    shouldAlertAdmin(): boolean;
}
/**
 * 보안 관련 에러
 */
export declare class SecurityError extends ServerError {
    constructor(message?: string, details?: ErrorDetails);
    getUserMessage(): string;
    shouldAlertAdmin(): boolean;
    static suspiciousActivity(activityType: string, details?: ErrorDetails): SecurityError;
    static rateLimitExceeded(identifier: string, limit: number, details?: ErrorDetails): SecurityError;
}
