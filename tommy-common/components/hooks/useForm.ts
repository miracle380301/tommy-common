import { useState, useCallback } from 'react';
import { ValidationSchema, validateWithSchema } from '../utils/validation';

export interface UseFormOptions {
  initialValues?: Record<string, any>;
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export interface UseFormReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setFieldValue: (name: string, value: any) => void;
  setFieldTouched: (name: string, isTouched?: boolean) => void;
  setValues: (values: Record<string, any>) => void;
  setErrors: (errors: Record<string, string>) => void;
  validateField: (name: string, value?: any, customValidator?: any) => Promise<string | undefined>;
  validateForm: () => Promise<Record<string, string>>;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  getFieldProps: (name: string) => {
    name: string;
    value: any;
    onChange: (e: any) => void;
    onBlur: () => void;
  };
  getFieldMeta: (name: string) => {
    error: string | undefined;
    touched: boolean;
    value: any;
  };
}

export function useForm(options: UseFormOptions = {}): UseFormReturn {
  const {
    initialValues = {},
    validationSchema = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit
  } = options;

  // 상태
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 값 변경
  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    if (validateOnChange && validationSchema[name]) {
      // 비동기 검증을 위해 즉시 실행하지 않고 setTimeout 사용
      setTimeout(() => {
        validateField(name, value);
      }, 0);
    }
  }, [validateOnChange, validationSchema]);

  const setFieldTouched = useCallback((name: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));

    if (validateOnBlur && isTouched && validationSchema[name]) {
      setTimeout(() => {
        validateField(name, values[name]);
      }, 0);
    }
  }, [validateOnBlur, validationSchema, values]);

  // 검증
  const validateField = useCallback(async (name: string, value?: any, customValidator?: any): Promise<string | undefined> => {
    const fieldValue = value !== undefined ? value : values[name];
    const fieldSchema = validationSchema[name];
    const validator = customValidator || fieldSchema;

    if (!validator) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      return undefined;
    }

    let error: string | undefined;

    // 커스텀 함수 검증
    if (typeof validator === 'function') {
      error = await validator(fieldValue, values);
    }
    // 스키마 기반 검증
    else {
      error = await validateWithSchema(fieldValue, validator);
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error! }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    return error;
  }, [values, validationSchema]);

  const validateForm = useCallback(async (): Promise<Record<string, string>> => {
    const validationPromises = Object.keys(validationSchema).map(
      name => validateField(name, values[name])
    );

    const results = await Promise.all(validationPromises);
    const newErrors: Record<string, string> = {};

    Object.keys(validationSchema).forEach((name, index) => {
      if (results[index]) {
        newErrors[name] = results[index]!;
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [values, validationSchema, validateField]);

  // 제출
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    // 모든 필드를 touched로 설정
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // 유효성 검사
    const validationErrors = await validateForm();

    if (Object.keys(validationErrors).length === 0) {
      try {
        await onSubmit?.(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [values, validateForm, onSubmit]);

  // 초기화
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 유틸리티
  const getFieldProps = useCallback((name: string) => ({
    name,
    value: values[name] || '',
    onChange: (e: any) => {
      const newValue = e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value;
      setFieldValue(name, newValue);
    },
    onBlur: () => setFieldTouched(name, true)
  }), [values, setFieldValue, setFieldTouched]);

  const getFieldMeta = useCallback((name: string) => ({
    error: errors[name],
    touched: touched[name],
    value: values[name]
  }), [values, errors, touched]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setFieldValue,
    setFieldTouched,
    setValues,
    setErrors,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldProps,
    getFieldMeta
  };
}
