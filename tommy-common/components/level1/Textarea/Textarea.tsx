import React, { useState, useId } from 'react';
import { cn } from '../../utils/classNames';
import { Theme, ResizeType } from '../../utils/types';
import './Textarea.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Theme to apply */
  theme?: Theme;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width textarea */
  fullWidth?: boolean;
  /** Resize direction */
  resize?: ResizeType;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      theme = 'minimal',
      label,
      error,
      helperText,
      disabled = false,
      required = false,
      fullWidth = false,
      resize = 'vertical',
      rows = 4,
      maxLength,
      value,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const textareaId = props.id || id;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div
        className={cn(
          'textarea-wrapper',
          fullWidth && 'textarea-wrapper--full-width',
          className
        )}
        data-theme={theme}
      >
        {label && (
          <label htmlFor={textareaId} className="textarea-label">
            {label}
            {required && <span className="textarea-label__required">*</span>}
          </label>
        )}
        <div
          className={cn(
            'textarea-container',
            `textarea-container--${theme}`,
            isFocused && 'textarea-container--focused',
            error && 'textarea-container--error',
            disabled && 'textarea-container--disabled'
          )}
        >
          <textarea
            ref={ref}
            id={textareaId}
            className={cn('textarea', `textarea--resize-${resize}`)}
            disabled={disabled}
            required={required}
            rows={rows}
            maxLength={maxLength}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
        </div>
        <div className="textarea-footer">
          {error && (
            <p id={errorId} className="textarea-error">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={helperId} className="textarea-helper">
              {helperText}
            </p>
          )}
          {maxLength && (
            <span className="textarea-counter">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
