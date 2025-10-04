import React from 'react';
import { useFormContext } from '../Form/FormContext';
import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Checkbox } from '../Checkbox';
import { Radio } from '../Radio';
import { Toggle } from '../Toggle';
import { cn } from '../../utils/classNames';
import './FormField.css';

// 컴포넌트 매핑
const componentMap = {
  input: Input,
  select: Select,
  textarea: Textarea,
  checkbox: Checkbox,
  radio: Radio,
  toggle: Toggle
};

type ComponentType = keyof typeof componentMap | React.ComponentType<any>;

export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  label?: string;
  component?: ComponentType;
  type?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validate?: (value: any, allValues?: any) => string | undefined | Promise<string | undefined>;
  rows?: number;
  [key: string]: any;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      name,
      label,
      component = 'input',
      validate,
      required,
      helperText,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const {
      values,
      errors,
      touched,
      setFieldValue,
      setFieldTouched,
      validateField
    } = useFormContext();

    const value = values[name] || '';
    const error = touched[name] ? errors[name] : '';
    const hasError = Boolean(error);

    const handleChange = (e: any) => {
      const newValue = e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value;

      setFieldValue(name, newValue);

      if (validate) {
        validateField(name, newValue, validate);
      }
    };

    const handleBlur = () => {
      setFieldTouched(name, true);
    };

    // 컴포넌트 결정
    const Component = typeof component === 'string'
      ? componentMap[component as keyof typeof componentMap]
      : component;

    const fieldClasses = cn(
      'form-field',
      hasError && 'form-field--error',
      className
    );

    // Checkbox와 Toggle은 다른 레이아웃 사용
    const isCheckboxLike = component === 'checkbox' || component === 'toggle';

    return (
      <div ref={ref} className={fieldClasses}>
        {!isCheckboxLike && label && (
          <label htmlFor={name} className="form-field__label">
            {label}
            {required && <span className="form-field__required">*</span>}
          </label>
        )}

        <Component
          id={name}
          name={name}
          value={value}
          checked={component === 'checkbox' || component === 'toggle' ? value : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          error={error}
          label={isCheckboxLike ? label : undefined}
          {...props}
        >
          {children}
        </Component>

        {hasError && (
          <span className="form-field__error" role="alert">{error}</span>
        )}

        {!hasError && helperText && (
          <span className="form-field__helper">{helperText}</span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
