"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 기본 에러 클래스
 * 모든 커스텀 에러의 부모 클래스
 */
class BaseError extends Error {
    constructor(message, statusCode = 500, errorCode = 'UNKNOWN_ERROR', details = {}, source = 'unknown') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.source = source;
        this.timestamp = new Date().toISOString();
        this.uuid = this.generateUUID();
        // 스택 트레이스 정리
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * JSON으로 직렬화
     */
    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            errorCode: this.errorCode,
            details: this.details,
            source: this.source,
            timestamp: this.timestamp,
            stack: this.stack,
            context: this.context,
            cause: this.cause
        };
    }
    /**
     * 사용자에게 보여줄 메시지
     */
    getUserMessage() {
        return this.message;
    }
    /**
     * 에러 심각도 반환
     */
    getSeverity() {
        if (this.statusCode >= 500)
            return 'critical';
        if (this.statusCode >= 400)
            return 'warning';
        return 'info';
    }
    /**
     * 로깅 필요 여부
     */
    shouldLog() {
        return true;
    }
    /**
     * 사용자 알림 필요 여부
     */
    shouldNotifyUser() {
        return this.statusCode < 500;
    }
    /**
     * 관리자 알림 필요 여부
     */
    shouldAlertAdmin() {
        return this.statusCode >= 500;
    }
    /**
     * 상세 정보 추가
     */
    withDetails(additionalDetails) {
        Object.assign(this.details, additionalDetails);
        return this;
    }
    /**
     * 컨텍스트 추가
     */
    withContext(context) {
        this.context = { ...this.context, ...context };
        return this;
    }
    /**
     * 원인 에러 추가
     */
    causedBy(error) {
        this.cause = error instanceof BaseError ? error.toJSON() : {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
        return this;
    }
    /**
     * UUID 생성
     */
    generateUUID() {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    /**
     * 문자열 표현
     */
    toString() {
        return `${this.name} [${this.errorCode}]: ${this.message}`;
    }
}
exports.default = BaseError;
