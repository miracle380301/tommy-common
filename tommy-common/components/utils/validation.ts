export interface ValidationRule {
  value?: any;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: {
    required?: boolean | string;
    minLength?: ValidationRule;
    maxLength?: ValidationRule;
    min?: ValidationRule;
    max?: ValidationRule;
    pattern?: ValidationRule & { value: RegExp };
    email?: boolean | string;
    url?: boolean | string;
    phone?: boolean | string;
    validate?: (value: any, allValues?: any) => string | undefined | Promise<string | undefined>;
  } | ((value: any, allValues?: any) => string | undefined | Promise<string | undefined>);
}

// 내장 validators
export const validators = {
  required: (value: any, message = '필수 입력 항목입니다'): string | undefined => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return undefined;
  },

  minLength: (value: any, { value: min, message }: ValidationRule): string | undefined => {
    if (value && value.length < min) {
      return message || `최소 ${min}자 이상 입력하세요`;
    }
    return undefined;
  },

  maxLength: (value: any, { value: max, message }: ValidationRule): string | undefined => {
    if (value && value.length > max) {
      return message || `최대 ${max}자까지 입력 가능합니다`;
    }
    return undefined;
  },

  min: (value: any, { value: min, message }: ValidationRule): string | undefined => {
    if (value != null && Number(value) < min) {
      return message || `${min} 이상이어야 합니다`;
    }
    return undefined;
  },

  max: (value: any, { value: max, message }: ValidationRule): string | undefined => {
    if (value != null && Number(value) > max) {
      return message || `${max} 이하여야 합니다`;
    }
    return undefined;
  },

  pattern: (value: any, { value: regex, message }: ValidationRule & { value: RegExp }): string | undefined => {
    if (value && !regex.test(value)) {
      return message || '형식이 올바르지 않습니다';
    }
    return undefined;
  },

  email: (value: any, message?: string): string | undefined => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (value && !emailRegex.test(value)) {
      return message || '올바른 이메일 주소를 입력하세요';
    }
    return undefined;
  },

  url: (value: any, message?: string): string | undefined => {
    try {
      new URL(value);
      return undefined;
    } catch {
      return message || '올바른 URL을 입력하세요';
    }
  },

  phone: (value: any, message?: string): string | undefined => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (value && !phoneRegex.test(value)) {
      return message || '올바른 전화번호를 입력하세요';
    }
    return undefined;
  }
};

// 스키마 기반 검증 함수
export async function validateWithSchema(
  value: any,
  schema: ValidationSchema[string]
): Promise<string | undefined> {
  // 커스텀 함수인 경우
  if (typeof schema === 'function') {
    return await schema(value);
  }

  // required 체크
  if (schema.required) {
    const message = typeof schema.required === 'string'
      ? schema.required
      : '필수 입력 항목입니다';
    const error = validators.required(value, message);
    if (error) return error;
  }

  // 값이 없으면 나머지 검증 스킵
  if (!value && value !== 0) return undefined;

  // minLength
  if (schema.minLength) {
    const error = validators.minLength(value, schema.minLength);
    if (error) return error;
  }

  // maxLength
  if (schema.maxLength) {
    const error = validators.maxLength(value, schema.maxLength);
    if (error) return error;
  }

  // min
  if (schema.min) {
    const error = validators.min(value, schema.min);
    if (error) return error;
  }

  // max
  if (schema.max) {
    const error = validators.max(value, schema.max);
    if (error) return error;
  }

  // pattern
  if (schema.pattern) {
    const error = validators.pattern(value, schema.pattern);
    if (error) return error;
  }

  // email (shorthand)
  if (schema.email) {
    const message = typeof schema.email === 'string' ? schema.email : undefined;
    const error = validators.email(value, message);
    if (error) return error;
  }

  // url (shorthand)
  if (schema.url) {
    const message = typeof schema.url === 'string' ? schema.url : undefined;
    const error = validators.url(value, message);
    if (error) return error;
  }

  // phone (shorthand)
  if (schema.phone) {
    const message = typeof schema.phone === 'string' ? schema.phone : undefined;
    const error = validators.phone(value, message);
    if (error) return error;
  }

  // 커스텀 validate 함수
  if (schema.validate) {
    const error = await schema.validate(value);
    if (error) return error;
  }

  return undefined;
}
