import React, { useId, useEffect, useRef } from 'react';
import { cn } from '../../utils/classNames';
import { Theme } from '../../utils/types';
import './Checkbox.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Theme to apply */
  theme?: Theme;
  /** Label text */
  label?: string;
  /** Indeterminate state (partial selection) */
  indeterminate?: boolean;
}

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IndeterminateIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 6H10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      theme = 'minimal',
      label,
      indeterminate = false,
      disabled = false,
      checked,
      className,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const checkboxId = props.id || id;
    const inputRef = useRef<HTMLInputElement>(null);

    // Set indeterminate property on the DOM element
    useEffect(() => {
      const input = inputRef.current || (ref as any)?.current;
      if (input) {
        input.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div
        className={cn('checkbox-wrapper', disabled && 'checkbox-wrapper--disabled', className)}
        data-theme={theme}
      >
        <label htmlFor={checkboxId} className="checkbox-label">
          <input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
              }
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            id={checkboxId}
            type="checkbox"
            className="checkbox-input"
            disabled={disabled}
            checked={checked}
            {...props}
          />
          <span
            className={cn(
              'checkbox-box',
              `checkbox-box--${theme}`,
              checked && 'checkbox-box--checked',
              indeterminate && 'checkbox-box--indeterminate',
              disabled && 'checkbox-box--disabled'
            )}
          >
            {indeterminate ? <IndeterminateIcon /> : checked && <CheckIcon />}
          </span>
          {label && <span className="checkbox-text">{label}</span>}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
