import BaseError, { type ErrorDetails } from '../base/BaseErrors';

/**
 * 클라이언트 에러 기본 클래스
 */
export class ClientError extends BaseError {
  constructor(
    message: string,
    statusCode: number = 400,
    errorCode: string = 'CLIENT_ERROR',
    details: ErrorDetails = {}
  ) {
    super(message, statusCode, errorCode, details, 'client');
  }

  getUserMessage(): string {
    return this.message;
  }

  shouldNotifyUser(): boolean {
    return true;
  }

  shouldAlertAdmin(): boolean {
    return false;
  }
}

/**
 * 유효성 검증 실패 에러
 */
export class ValidationError extends ClientError {
  constructor(message: string = '입력값이 올바르지 않습니다', details: ErrorDetails = {}) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }

  getUserMessage(): string {
    const fieldMessages: Record<string, string> = {
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

  static required(field: string): ValidationError {
    return new ValidationError(`${field}은(는) 필수 항목입니다`, { 
      field, 
      type: 'required' 
    });
  }

  static invalid(field: string, value: any): ValidationError {
    return new ValidationError(`${field} 형식이 올바르지 않습니다`, { 
      field, 
      value, 
      type: 'invalid' 
    });
  }

  static tooShort(field: string, minLength: number): ValidationError {
    return new ValidationError(`${field}은(는) 최소 ${minLength}자 이상이어야 합니다`, { 
      field, 
      minLength, 
      type: 'tooShort' 
    });
  }

  static tooLong(field: string, maxLength: number): ValidationError {
    return new ValidationError(`${field}은(는) 최대 ${maxLength}자까지 입력 가능합니다`, { 
      field, 
      maxLength, 
      type: 'tooLong' 
    });
  }
}

/**
 * 인증 실패 에러
 */
export class AuthenticationError extends ClientError {
  constructor(message: string = '로그인이 필요합니다', details: ErrorDetails = {}) {
    super(message, 401, 'AUTHENTICATION_FAILED', details);
  }

  getUserMessage(): string {
    return '로그인이 필요한 서비스입니다. 다시 로그인해주세요.';
  }

  shouldAlertAdmin(): boolean {
    return this.details.attemptCount && this.details.attemptCount > 5;
  }

  static tokenExpired(): AuthenticationError {
    return new AuthenticationError('인증 토큰이 만료되었습니다', {
      type: 'token_expired'
    });
  }

  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다', {
      type: 'invalid_credentials'
    });
  }
}

/**
 * 권한 없음 에러
 */
export class AuthorizationError extends ClientError {
  constructor(message: string = '접근 권한이 없습니다', details: ErrorDetails = {}) {
    super(message, 403, 'AUTHORIZATION_FAILED', details);
  }

  getUserMessage(): string {
    return '접근 권한이 없습니다. 관리자에게 문의하세요.';
  }

  shouldAlertAdmin(): boolean {
    return true;
  }
}

/**
 * 리소스를 찾을 수 없음 에러
 */
export class NotFoundError extends ClientError {
  constructor(resource: string = '페이지', details: ErrorDetails = {}) {
    const message = `요청하신 ${resource}를 찾을 수 없습니다`;
    super(message, 404, 'RESOURCE_NOT_FOUND', { resource, ...details });
  }

  getUserMessage(): string {
    return `${this.details.resource || '페이지'}를 찾을 수 없습니다.`;
  }
}

/**
 * 네트워크 연결 에러
 */
export class NetworkError extends ClientError {
  constructor(message: string = '네트워크 연결에 실패했습니다', details: ErrorDetails = {}) {
    super(message, 0, 'NETWORK_ERROR', details);
  }

  getUserMessage(): string {
    return '네트워크 연결을 확인하고 다시 시도해주세요.';
  }

  shouldAlertAdmin(): boolean {
    return this.details.retryCount && this.details.retryCount > 3;
  }

  static offline(): NetworkError {
    return new NetworkError('인터넷 연결을 확인해주세요', {
      type: 'offline'
    });
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends ClientError {
  constructor(message: string = '요청 시간이 초과되었습니다', details: ErrorDetails = {}) {
    super(message, 408, 'REQUEST_TIMEOUT', details);
  }

  getUserMessage(): string {
    return '요청 처리에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
  }
}

/**
 * 중복 요청 에러
 */
export class ConflictError extends ClientError {
  constructor(message: string = '이미 존재하는 데이터입니다', details: ErrorDetails = {}) {
    super(message, 409, 'RESOURCE_CONFLICT', details);
  }

  getUserMessage(): string {
    return '이미 등록된 정보입니다. 다른 정보로 시도해주세요.';
  }
}

/**
 * 사용량 한도 초과 에러
 */
export class RateLimitError extends ClientError {
  constructor(message: string = '요청 한도를 초과했습니다', details: ErrorDetails = {}) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }

  getUserMessage(): string {
    const retryAfter = this.details.retryAfter || 60;
    return `너무 많은 요청을 보내셨습니다. ${retryAfter}초 후 다시 시도해주세요.`;
  }
}