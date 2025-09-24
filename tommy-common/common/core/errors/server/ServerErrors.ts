import BaseError, { type ErrorDetails } from '../base/BaseErrors';

/**
 * 서버 에러 기본 클래스
 */
export class ServerError extends BaseError {
  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'SERVER_ERROR',
    details: ErrorDetails = {}
  ) {
    super(message, statusCode, errorCode, details, 'server');
  }

  getUserMessage(): string {
    // 서버 에러는 내부 정보를 숨기고 일반적인 메시지 표시
    return '서버에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  shouldNotifyUser(): boolean {
    return this.statusCode < 500; // 4xx 에러만 사용자에게 알림
  }

  shouldAlertAdmin(): boolean {
    return true; // 서버 에러는 기본적으로 관리자 알림
  }
}

/**
 * 데이터베이스 관련 에러
 */
export class DatabaseError extends ServerError {
  constructor(message: string = 'DB 오류가 발생했습니다', details: ErrorDetails = {}) {
    super(message, 500, 'DATABASE_ERROR', details);
  }

  shouldAlertAdmin(): boolean {
    return true; // DB 에러는 항상 심각
  }

  static connectionFailed(details: ErrorDetails = {}): DatabaseError {
    return new DatabaseError('데이터베이스 연결에 실패했습니다', {
      ...details,
      type: 'connection_failed'
    });
  }

  static queryFailed(query: string, error: Error, details: ErrorDetails = {}): DatabaseError {
    return new DatabaseError('데이터베이스 쿼리 실행에 실패했습니다', {
      query,
      originalError: error.message,
      ...details,
      type: 'query_failed'
    });
  }

  static transactionFailed(details: ErrorDetails = {}): DatabaseError {
    return new DatabaseError('데이터베이스 트랜잭션에 실패했습니다', {
      ...details,
      type: 'transaction_failed'
    });
  }
}

/**
 * 외부 서비스 연동 에러
 */
export class ExternalServiceError extends ServerError {
  constructor(serviceName: string, message: string = '외부 서비스 오류', details: ErrorDetails = {}) {
    super(`${serviceName}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', {
      serviceName,
      ...details
    });
  }

  getUserMessage(): string {
    const serviceNames: Record<string, string> = {
      'PaymentGateway': '결제 서비스',
      'EmailService': '이메일 서비스',
      'SMSService': '문자 서비스',
      'CloudStorage': '파일 저장 서비스'
    };

    const friendlyName = serviceNames[this.details.serviceName] || '외부 서비스';
    return `${friendlyName}에서 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
  }

  shouldAlertAdmin(): boolean {
    return true; // 외부 서비스 에러는 항상 알림
  }

  static timeout(serviceName: string, timeout: number, details: ErrorDetails = {}): ExternalServiceError {
    return new ExternalServiceError(serviceName, `서비스 응답 시간 초과 (${timeout}ms)`, {
      timeout,
      type: 'timeout',
      ...details
    });
  }

  static unavailable(serviceName: string, statusCode: number, details: ErrorDetails = {}): ExternalServiceError {
    return new ExternalServiceError(serviceName, '서비스를 사용할 수 없습니다', {
      statusCode,
      type: 'unavailable',
      ...details
    });
  }
}

/**
 * 설정 관련 에러
 */
export class ConfigurationError extends ServerError {
  constructor(message: string = '서버 설정 오류가 발생했습니다', details: ErrorDetails = {}) {
    super(message, 500, 'CONFIGURATION_ERROR', details);
  }

  shouldAlertAdmin(): boolean {
    return true; // 설정 에러는 즉시 수정 필요
  }

  static missingEnvVar(varName: string): ConfigurationError {
    return new ConfigurationError(`필수 환경변수가 설정되지 않았습니다: ${varName}`, {
      envVar: varName,
      type: 'missing_env_var'
    });
  }

  static invalidConfig(configKey: string, value: any): ConfigurationError {
    return new ConfigurationError(`잘못된 설정값입니다: ${configKey}`, {
      configKey,
      value,
      type: 'invalid_config'
    });
  }
}

/**
 * 파일 시스템 에러
 */
export class FileSystemError extends ServerError {
  constructor(message: string = '파일 시스템 오류가 발생했습니다', details: ErrorDetails = {}) {
    super(message, 500, 'FILESYSTEM_ERROR', details);
  }

  static fileNotFound(filePath: string): FileSystemError {
    return new FileSystemError(`파일을 찾을 수 없습니다: ${filePath}`, {
      filePath,
      type: 'file_not_found'
    });
  }

  static permissionDenied(filePath: string, operation: string): FileSystemError {
    return new FileSystemError(`파일 ${operation} 권한이 없습니다: ${filePath}`, {
      filePath,
      operation,
      type: 'permission_denied'
    });
  }

  static diskFull(availableSpace: number): FileSystemError {
    return new FileSystemError('디스크 공간이 부족합니다', {
      availableSpace,
      type: 'disk_full'
    });
  }
}

/**
 * 메모리/리소스 부족 에러
 */
export class ResourceError extends ServerError {
  constructor(message: string = '서버 리소스가 부족합니다', details: ErrorDetails = {}) {
    super(message, 507, 'INSUFFICIENT_RESOURCES', details);
  }

  shouldAlertAdmin(): boolean {
    return true; // 리소스 부족은 긴급 대응 필요
  }

  static memoryExhausted(currentUsage: number, limit: number): ResourceError {
    return new ResourceError('메모리가 부족합니다', {
      currentUsage,
      limit,
      type: 'memory_exhausted'
    });
  }

  static cpuThrottled(currentLoad: number, threshold: number): ResourceError {
    return new ResourceError('CPU 사용량이 한계에 도달했습니다', {
      currentLoad,
      threshold,
      type: 'cpu_throttled'
    });
  }
}

/**
 * 비즈니스 로직 에러
 */
export class BusinessLogicError extends ServerError {
  constructor(message: string, details: ErrorDetails = {}) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', details);
  }

  getUserMessage(): string {
    // 비즈니스 로직 에러는 사용자에게 구체적인 메시지 전달 가능
    return this.message;
  }

  shouldNotifyUser(): boolean {
    return true;
  }

  shouldAlertAdmin(): boolean {
    return false; // 비즈니스 로직 에러는 일반적으로 관리자 알림 불필요
  }
}

/**
 * 보안 관련 에러
 */
export class SecurityError extends ServerError {
  constructor(message: string = '보안 위반이 감지되었습니다', details: ErrorDetails = {}) {
    super(message, 403, 'SECURITY_VIOLATION', details);
  }

  getUserMessage(): string {
    return '보안상의 이유로 요청이 차단되었습니다.';
  }

  shouldAlertAdmin(): boolean {
    return true; // 보안 에러는 항상 중요
  }

  static suspiciousActivity(activityType: string, details: ErrorDetails = {}): SecurityError {
    return new SecurityError(`의심스러운 활동이 감지되었습니다: ${activityType}`, {
      activityType,
      type: 'suspicious_activity',
      ...details
    });
  }

  static rateLimitExceeded(identifier: string, limit: number, details: ErrorDetails = {}): SecurityError {
    return new SecurityError('요청 한도를 초과했습니다', {
      identifier,
      limit,
      type: 'rate_limit_exceeded',
      ...details
    });
  }
}