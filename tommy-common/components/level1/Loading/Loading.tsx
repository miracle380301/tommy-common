import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Loading.css';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  theme?: Theme;
  fullScreen?: boolean;
  text?: string;
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      size = 'md',
      theme = 'minimal',
      fullScreen = false,
      text,
      className,
      ...props
    },
    ref
  ) => {
    const spinnerClasses = cn(
      'spinner',
      `spinner--${size}`,
      `spinner--${theme}`
    );

    if (fullScreen) {
      return (
        <div className="loading-overlay" data-theme={theme}>
          <div ref={ref} className={spinnerClasses} {...props} />
          {text && <div className="loading-overlay__text">{text}</div>}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('loading-inline', className)} {...props}>
        <div className={spinnerClasses} />
        {text && <span className="loading-text">{text}</span>}
      </div>
    );
  }
);

Loading.displayName = 'Loading';
