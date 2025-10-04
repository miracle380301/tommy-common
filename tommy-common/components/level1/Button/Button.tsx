import React from 'react';
import { cn } from '../../utils/classNames';
import { Theme, ButtonVariant, Size, IconPosition } from '../../utils/types';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Theme to apply */
  theme?: Theme;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: Size;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: IconPosition;
  /** Button content */
  children: React.ReactNode;
}

const Spinner = () => (
  <svg
    className="btn__spinner"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="30"
      strokeDashoffset="0"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      theme = 'minimal',
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      children,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          `btn--${variant}`,
          `btn--${size}`,
          `btn--${theme}`,
          disabled && 'btn--disabled',
          loading && 'btn--loading',
          fullWidth && 'btn--full-width',
          className
        )}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        onClick={handleClick}
        data-theme={theme}
        {...props}
      >
        {loading && <Spinner />}
        {!loading && icon && iconPosition === 'left' && (
          <span className="btn__icon btn__icon--left">{icon}</span>
        )}
        <span className="btn__text">{children}</span>
        {!loading && icon && iconPosition === 'right' && (
          <span className="btn__icon btn__icon--right">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
