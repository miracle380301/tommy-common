import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  theme?: Theme;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  children?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      theme = 'minimal',
      size = 'md',
      dot = false,
      pulse = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const badgeClasses = cn(
      'badge',
      `badge--${variant}`,
      `badge--${size}`,
      `badge--${theme}`,
      dot && 'badge--dot',
      pulse && 'badge--pulse',
      className
    );

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {!dot && children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
