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
  public readonly uuid: string;
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: ErrorDetails;
  public readonly source: ErrorSource;
  public readonly timestamp: string;
  public context?: ErrorContext;
  public cause?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'UNKNOWN_ERROR',
    details: ErrorDetails = {},
    source: ErrorSource = 'unknown'
  ) {
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
  getUserMessage(): string {
    return this.message;
  }

  /**
   * 에러 심각도 반환
   */
  getSeverity(): ErrorSeverity {
    if (this.statusCode >= 500) return 'critical';
    if (this.statusCode >= 400) return 'warning';
    return 'info';
  }

  /**
   * 로깅 필요 여부
   */
  shouldLog(): boolean {
    return true;
  }

  /**
   * 사용자 알림 필요 여부
   */
  shouldNotifyUser(): boolean {
    return this.statusCode < 500;
  }

  /**
   * 관리자 알림 필요 여부
   */
  shouldAlertAdmin(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * 상세 정보 추가
   */
  withDetails(additionalDetails: ErrorDetails): this {
    Object.assign(this.details, additionalDetails);
    return this;
  }

  /**
   * 컨텍스트 추가
   */
  withContext(context: ErrorContext): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * 원인 에러 추가
   */
  causedBy(error: Error | BaseError): this {
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
  private generateUUID(): string {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 문자열 표현
   */
  toString(): string {
    return `${this.name} [${this.errorCode}]: ${this.message}`;
  }
}