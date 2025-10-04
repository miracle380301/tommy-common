import React, { useId } from 'react';
import { cn } from '../../utils/classNames';
import { Theme } from '../../utils/types';
import './Radio.css';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Theme to apply */
  theme?: Theme;
  /** Label text */
  label?: string;
  /** Radio button value */
  value: string;
}

const RadioDot = () => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      theme = 'minimal',
      label,
      value,
      disabled = false,
      checked,
      className,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const radioId = props.id || id;

    return (
      <div
        className={cn('radio-wrapper', disabled && 'radio-wrapper--disabled', className)}
        data-theme={theme}
      >
        <label htmlFor={radioId} className="radio-label">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            className="radio-input"
            disabled={disabled}
            checked={checked}
            value={value}
            role="radio"
            aria-checked={checked}
            {...props}
          />
          <span
            className={cn(
              'radio-circle',
              `radio-circle--${theme}`,
              checked && 'radio-circle--checked',
              disabled && 'radio-circle--disabled'
            )}
          >
            {checked && <RadioDot />}
          </span>
          {label && <span className="radio-text">{label}</span>}
        </label>
      </div>
    );
  }
);

Radio.displayName = 'Radio';
