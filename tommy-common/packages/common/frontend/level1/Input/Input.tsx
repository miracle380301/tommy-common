import React, { useState, useId } from 'react';
import { cn } from '../../utils/classNames';
import { Theme, InputType, Size, IconPosition } from '../../utils/types';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input type */
  type?: InputType;
  /** Theme to apply */
  theme?: Theme;
  /** Input size */
  size?: Size;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width input */
  fullWidth?: boolean;
  /** Icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: IconPosition;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      theme = 'minimal',
      size = 'md',
      label,
      error,
      helperText,
      disabled = false,
      required = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const inputId = props.id || id;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div
        className={cn(
          'input-wrapper',
          fullWidth && 'input-wrapper--full-width',
          className
        )}
        data-theme={theme}
      >
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-label__required">*</span>}
          </label>
        )}
        <div
          className={cn(
            'input-container',
            `input-container--${size}`,
            `input-container--${theme}`,
            isFocused && 'input-container--focused',
            error && 'input-container--error',
            disabled && 'input-container--disabled',
            !!icon && `input-container--with-icon-${iconPosition}`
          )}
        >
          {icon && iconPosition === 'left' && (
            <span className="input-icon input-icon--left">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn('input', `input--${size}`)}
            disabled={disabled}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="input-icon input-icon--right">{icon}</span>
          )}
        </div>
        {error && (
          <p id={errorId} className="input-error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="input-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
