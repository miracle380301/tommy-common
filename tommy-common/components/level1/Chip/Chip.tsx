import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Chip.css';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  avatar?: React.ReactNode;
  theme?: Theme;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md';
  onDelete?: () => void;
  clickable?: boolean;
  disabled?: boolean;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      avatar,
      theme = 'minimal',
      variant = 'filled',
      size = 'md',
      onDelete,
      onClick,
      clickable = false,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && (clickable || onClick)) {
        onClick?.(e);
      }
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        onDelete?.();
      }
    };

    const isClickable = clickable || onClick;

    const chipClasses = cn(
      'chip',
      `chip--${variant}`,
      `chip--${size}`,
      `chip--${theme}`,
      isClickable && 'chip--clickable',
      disabled && 'chip--disabled',
      className
    );

    return (
      <div ref={ref} className={chipClasses} onClick={handleClick} {...props}>
        {avatar && <div className="chip__avatar">{avatar}</div>}
        <span className="chip__label">{label}</span>
        {onDelete && (
          <button
            className="chip__delete"
            onClick={handleDelete}
            disabled={disabled}
            type="button"
            aria-label="Delete chip"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';
