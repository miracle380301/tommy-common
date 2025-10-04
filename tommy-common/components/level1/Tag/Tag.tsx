import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Tag.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  theme?: Theme;
  size?: 'sm' | 'md';
  onClose?: () => void;
  closable?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      variant = 'default',
      theme = 'minimal',
      size = 'md',
      onClose,
      closable = true,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose?.();
    };

    const tagClasses = cn(
      'tag',
      `tag--${variant}`,
      `tag--${size}`,
      `tag--${theme}`,
      className
    );

    return (
      <span ref={ref} className={tagClasses} {...props}>
        {icon && <span className="tag__icon">{icon}</span>}
        <span className="tag__label">{children}</span>
        {closable && onClose && (
          <button
            className="tag__close"
            onClick={handleClose}
            aria-label="Remove tag"
            type="button"
          >
            ×
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
