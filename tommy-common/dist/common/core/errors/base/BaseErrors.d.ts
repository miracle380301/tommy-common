/**
 * 에러 소스 타입
 */
export type ErrorSource = 'client' | 'server' | 'unknown';
/**
 * 에러 심각도 타입
 */
export type ErrorSeverity = 'critical' | 'warning' | 'info';
/**
 * 에러 상세 정보 타입
 */
export interface ErrorDetails {
    [key: string]: any;
}
/**
 * 에러 컨텍스트 타입
 */
export interface ErrorContext {
    [key: string]: any;
}
/**
 * 기본 에러 클래스
 * 모든 커스텀 에러의 부모 클래스
 */
export default class BaseError extends Error {
    readonly uuid: string;
    readonly statusCode: number;
    readonly errorCode: string;
    readonly details: ErrorDetails;
    readonly source: ErrorSource;
    readonly timestamp: string;
    context?: ErrorContext;
    cause?: any;
    constructor(message: string, statusCode?: number, errorCode?: string, details?: ErrorDetails, source?: ErrorSource);
    /**
     * JSON으로 직렬화
     */
    toJSON(): {
        uuid: string;
        name: string;
        message: string;
        statusCode: number;
        errorCode: string;
        details: ErrorDetails;
        source: ErrorSource;
        timestamp: string;
        stack: string | undefined;
        context: ErrorContext | undefined;
        cause: any;
    };
    /**
     * 사용자에게 보여줄 메시지
     */
    getUserMessage(): string;
    /**
     * 에러 심각도 반환
     */
    getSeverity(): ErrorSeverity;
    /**
     * 로깅 필요 여부
     */
    shouldLog(): boolean;
    /**
     * 사용자 알림 필요 여부
     */
    shouldNotifyUser(): boolean;
    /**
     * 관리자 알림 필요 여부
     */
    shouldAlertAdmin(): boolean;
    /**
     * 상세 정보 추가
     */
    withDetails(additionalDetails: ErrorDetails): this;
    /**
     * 컨텍스트 추가
     */
    withContext(context: ErrorContext): this;
    /**
     * 원인 에러 추가
     */
    causedBy(error: Error | BaseError): this;
    /**
     * UUID 생성
     */
    private generateUUID;
    /**
     * 문자열 표현
     */
    toString(): string;
}
