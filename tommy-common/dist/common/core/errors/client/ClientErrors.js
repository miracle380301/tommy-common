"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.ConflictError = exports.TimeoutError = exports.NetworkError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ClientError = void 0;
const BaseErrors_1 = __importDefault(require("../base/BaseErrors"));
/**
 * 클라이언트 에러 기본 클래스
 */
class ClientError extends BaseErrors_1.default {
    constructor(message, statusCode = 400, errorCode = 'CLIENT_ERROR', details = {}) {
        super(message, statusCode, errorCode, details, 'client');
    }
    getUserMessage() {
        return this.message;
    }
    shouldNotifyUser() {
        return true;
    }
    shouldAlertAdmin() {
        return false;
    }
}
exports.ClientError = ClientError;
/**
 * 유효성 검증 실패 에러
 */
class ValidationError extends ClientError {
    constructor(message = '입력값이 올바르지 않습니다', details = {}) {
        super(message, 400, 'VALIDATION_FAILED', details);
    }
    getUserMessage() {
        const fieldMessages = {
            email: '올바른 이메일 주소를 입력해주세요',
            password: '비밀번호를 확인해주세요',
            phone: '올바른 전화번호를 입력해주세요',
            name: '이름을 입력해주세요'
        };
        if (this.details.field && fieldMessages[this.details.field]) {
            return fieldMessages[this.details.field];
        }
        return this.message;
    }
    static required(field) {
        return new ValidationError(`${field}은(는) 필수 항목입니다`, {
            field,
            type: 'required'
        });
    }
    static invalid(field, value) {
        return new ValidationError(`${field} 형식이 올바르지 않습니다`, {
            field,
            value,
            type: 'invalid'
        });
    }
    static tooShort(field, minLength) {
        return new ValidationError(`${field}은(는) 최소 ${minLength}자 이상이어야 합니다`, {
            field,
            minLength,
            type: 'tooShort'
        });
    }
    static tooLong(field, maxLength) {
        return new ValidationError(`${field}은(는) 최대 ${maxLength}자까지 입력 가능합니다`, {
            field,
            maxLength,
            type: 'tooLong'
        });
    }
}
exports.ValidationError = ValidationError;
/**
 * 인증 실패 에러
 */
class AuthenticationError extends ClientError {
    constructor(message = '로그인이 필요합니다', details = {}) {
        super(message, 401, 'AUTHENTICATION_FAILED', details);
    }
    getUserMessage() {
        return '로그인이 필요한 서비스입니다. 다시 로그인해주세요.';
    }
    shouldAlertAdmin() {
        return this.details.attemptCount && this.details.attemptCount > 5;
    }
    static tokenExpired() {
        return new AuthenticationError('인증 토큰이 만료되었습니다', {
            type: 'token_expired'
        });
    }
    static invalidCredentials() {
        return new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다', {
            type: 'invalid_credentials'
        });
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * 권한 없음 에러
 */
class AuthorizationError extends ClientError {
    constructor(message = '접근 권한이 없습니다', details = {}) {
        super(message, 403, 'AUTHORIZATION_FAILED', details);
    }
    getUserMessage() {
        return '접근 권한이 없습니다. 관리자에게 문의하세요.';
    }
    shouldAlertAdmin() {
        return true;
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * 리소스를 찾을 수 없음 에러
 */
class NotFoundError extends ClientError {
    constructor(resource = '페이지', details = {}) {
        const message = `요청하신 ${resource}를 찾을 수 없습니다`;
        super(message, 404, 'RESOURCE_NOT_FOUND', { resource, ...details });
    }
    getUserMessage() {
        return `${this.details.resource || '페이지'}를 찾을 수 없습니다.`;
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 네트워크 연결 에러
 */
class NetworkError extends ClientError {
    constructor(message = '네트워크 연결에 실패했습니다', details = {}) {
        super(message, 0, 'NETWORK_ERROR', details);
    }
    getUserMessage() {
        return '네트워크 연결을 확인하고 다시 시도해주세요.';
    }
    shouldAlertAdmin() {
        return this.details.retryCount && this.details.retryCount > 3;
    }
    static offline() {
        return new NetworkError('인터넷 연결을 확인해주세요', {
            type: 'offline'
        });
    }
}
exports.NetworkError = NetworkError;
/**
 * 타임아웃 에러
 */
class TimeoutError extends ClientError {
    constructor(message = '요청 시간이 초과되었습니다', details = {}) {
        super(message, 408, 'REQUEST_TIMEOUT', details);
    }
    getUserMessage() {
        return '요청 처리에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
    }
}
exports.TimeoutError = TimeoutError;
/**
 * 중복 요청 에러
 */
class ConflictError extends ClientError {
    constructor(message = '이미 존재하는 데이터입니다', details = {}) {
        super(message, 409, 'RESOURCE_CONFLICT', details);
    }
    getUserMessage() {
        return '이미 등록된 정보입니다. 다른 정보로 시도해주세요.';
    }
}
exports.ConflictError = ConflictError;
/**
 * 사용량 한도 초과 에러
 */
class RateLimitError extends ClientError {
    constructor(message = '요청 한도를 초과했습니다', details = {}) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    }
    getUserMessage() {
        const retryAfter = this.details.retryAfter || 60;
        return `너무 많은 요청을 보내셨습니다. ${retryAfter}초 후 다시 시도해주세요.`;
    }
}
exports.RateLimitError = RateLimitError;
