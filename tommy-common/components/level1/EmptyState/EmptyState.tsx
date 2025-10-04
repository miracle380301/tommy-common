import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './EmptyState.css';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  theme?: Theme;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title = '데이터가 없습니다',
      description,
      action,
      theme = 'minimal',
      size = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const containerClasses = cn(
      'empty-state',
      `empty-state--${size}`,
      `empty-state--${theme}`,
      className
    );

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {icon && (
          <div className="empty-state__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        {title && <h3 className="empty-state__title">{title}</h3>}
        {description && <p className="empty-state__description">{description}</p>}
        {action && <div className="empty-state__action">{action}</div>}
        {children}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
