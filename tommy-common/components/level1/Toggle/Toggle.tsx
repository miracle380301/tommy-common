import React, { useId } from 'react';
import { cn } from '../../utils/classNames';
import { Theme } from '../../utils/types';
import './Toggle.css';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Theme to apply */
  theme?: Theme;
  /** Label text */
  label?: string;
  /** Toggle size */
  size?: 'sm' | 'md';
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      theme = 'minimal',
      label,
      size = 'md',
      disabled = false,
      checked,
      className,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const toggleId = props.id || id;

    return (
      <div
        className={cn(
          'toggle-wrapper',
          disabled && 'toggle-wrapper--disabled',
          className
        )}
        data-theme={theme}
      >
        <label htmlFor={toggleId} className="toggle-label">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            className="toggle-input"
            disabled={disabled}
            checked={checked}
            role="switch"
            aria-checked={checked}
            {...props}
          />
          <span
            className={cn(
              'toggle-track',
              `toggle-track--${size}`,
              `toggle-track--${theme}`,
              checked && 'toggle-track--checked',
              disabled && 'toggle-track--disabled'
            )}
          >
            <span
              className={cn(
                'toggle-handle',
                `toggle-handle--${size}`,
                checked && 'toggle-handle--checked'
              )}
            />
          </span>
          {label && <span className="toggle-text">{label}</span>}
        </label>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
