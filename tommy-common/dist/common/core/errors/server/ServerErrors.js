"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityError = exports.BusinessLogicError = exports.ResourceError = exports.FileSystemError = exports.ConfigurationError = exports.ExternalServiceError = exports.DatabaseError = exports.ServerError = void 0;
const BaseErrors_1 = __importDefault(require("../base/BaseErrors"));
/**
 * 서버 에러 기본 클래스
 */
class ServerError extends BaseErrors_1.default {
    constructor(message, statusCode = 500, errorCode = 'SERVER_ERROR', details = {}) {
        super(message, statusCode, errorCode, details, 'server');
    }
    getUserMessage() {
        // 서버 에러는 내부 정보를 숨기고 일반적인 메시지 표시
        return '서버에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    shouldNotifyUser() {
        return this.statusCode < 500; // 4xx 에러만 사용자에게 알림
    }
    shouldAlertAdmin() {
        return true; // 서버 에러는 기본적으로 관리자 알림
    }
}
exports.ServerError = ServerError;
/**
 * 데이터베이스 관련 에러
 */
class DatabaseError extends ServerError {
    constructor(message = 'DB 오류가 발생했습니다', details = {}) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
    shouldAlertAdmin() {
        return true; // DB 에러는 항상 심각
    }
    static connectionFailed(details = {}) {
        return new DatabaseError('데이터베이스 연결에 실패했습니다', {
            ...details,
            type: 'connection_failed'
        });
    }
    static queryFailed(query, error, details = {}) {
        return new DatabaseError('데이터베이스 쿼리 실행에 실패했습니다', {
            query,
            originalError: error.message,
            ...details,
            type: 'query_failed'
        });
    }
    static transactionFailed(details = {}) {
        return new DatabaseError('데이터베이스 트랜잭션에 실패했습니다', {
            ...details,
            type: 'transaction_failed'
        });
    }
}
exports.DatabaseError = DatabaseError;
/**
 * 외부 서비스 연동 에러
 */
class ExternalServiceError extends ServerError {
    constructor(serviceName, message = '외부 서비스 오류', details = {}) {
        super(`${serviceName}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', {
            serviceName,
            ...details
        });
    }
    getUserMessage() {
        const serviceNames = {
            'PaymentGateway': '결제 서비스',
            'EmailService': '이메일 서비스',
            'SMSService': '문자 서비스',
            'CloudStorage': '파일 저장 서비스'
        };
        const friendlyName = serviceNames[this.details.serviceName] || '외부 서비스';
        return `${friendlyName}에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
    }
    shouldAlertAdmin() {
        return true; // 외부 서비스 에러는 항상 알림
    }
    static timeout(serviceName, timeout, details = {}) {
        return new ExternalServiceError(serviceName, `서비스 응답 시간 초과 (${timeout}ms)`, {
            timeout,
            type: 'timeout',
            ...details
        });
    }
    static unavailable(serviceName, statusCode, details = {}) {
        return new ExternalServiceError(serviceName, '서비스를 사용할 수 없습니다', {
            statusCode,
            type: 'unavailable',
            ...details
        });
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * 설정 관련 에러
 */
class ConfigurationError extends ServerError {
    constructor(message = '서버 설정 오류가 발생했습니다', details = {}) {
        super(message, 500, 'CONFIGURATION_ERROR', details);
    }
    shouldAlertAdmin() {
        return true; // 설정 에러는 즉시 수정 필요
    }
    static missingEnvVar(varName) {
        return new ConfigurationError(`필수 환경변수가 설정되지 않았습니다: ${varName}`, {
            envVar: varName,
            type: 'missing_env_var'
        });
    }
    static invalidConfig(configKey, value) {
        return new ConfigurationError(`잘못된 설정값입니다: ${configKey}`, {
            configKey,
            value,
            type: 'invalid_config'
        });
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * 파일 시스템 에러
 */
class FileSystemError extends ServerError {
    constructor(message = '파일 시스템 오류가 발생했습니다', details = {}) {
        super(message, 500, 'FILESYSTEM_ERROR', details);
    }
    static fileNotFound(filePath) {
        return new FileSystemError(`파일을 찾을 수 없습니다: ${filePath}`, {
            filePath,
            type: 'file_not_found'
        });
    }
    static permissionDenied(filePath, operation) {
        return new FileSystemError(`파일 ${operation} 권한이 없습니다: ${filePath}`, {
            filePath,
            operation,
            type: 'permission_denied'
        });
    }
    static diskFull(availableSpace) {
        return new FileSystemError('디스크 공간이 부족합니다', {
            availableSpace,
            type: 'disk_full'
        });
    }
}
exports.FileSystemError = FileSystemError;
/**
 * 메모리/리소스 부족 에러
 */
class ResourceError extends ServerError {
    constructor(message = '서버 리소스가 부족합니다', details = {}) {
        super(message, 507, 'INSUFFICIENT_RESOURCES', details);
    }
    shouldAlertAdmin() {
        return true; // 리소스 부족은 긴급 대응 필요
    }
    static memoryExhausted(currentUsage, limit) {
        return new ResourceError('메모리가 부족합니다', {
            currentUsage,
            limit,
            type: 'memory_exhausted'
        });
    }
    static cpuThrottled(currentLoad, threshold) {
        return new ResourceError('CPU 사용량이 한계에 도달했습니다', {
            currentLoad,
            threshold,
            type: 'cpu_throttled'
        });
    }
}
exports.ResourceError = ResourceError;
/**
 * 비즈니스 로직 에러
 */
class BusinessLogicError extends ServerError {
    constructor(message, details = {}) {
        super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
    }
    getUserMessage() {
        // 비즈니스 로직 에러는 사용자에게 구체적인 메시지 전달 가능
        return this.message;
    }
    shouldNotifyUser() {
        return true;
    }
    shouldAlertAdmin() {
        return false; // 비즈니스 로직 에러는 일반적으로 관리자 알림 불필요
    }
}
exports.BusinessLogicError = BusinessLogicError;
/**
 * 보안 관련 에러
 */
class SecurityError extends ServerError {
    constructor(message = '보안 위반이 감지되었습니다', details = {}) {
        super(message, 403, 'SECURITY_VIOLATION', details);
    }
    getUserMessage() {
        return '보안상의 이유로 요청이 차단되었습니다.';
    }
    shouldAlertAdmin() {
        return true; // 보안 에러는 항상 중요
    }
    static suspiciousActivity(activityType, details = {}) {
        return new SecurityError(`의심스러운 활동이 감지되었습니다: ${activityType}`, {
            activityType,
            type: 'suspicious_activity',
            ...details
        });
    }
    static rateLimitExceeded(identifier, limit, details = {}) {
        return new SecurityError('요청 한도를 초과했습니다', {
            identifier,
            limit,
            type: 'rate_limit_exceeded',
            ...details
        });
    }
}
exports.SecurityError = SecurityError;
