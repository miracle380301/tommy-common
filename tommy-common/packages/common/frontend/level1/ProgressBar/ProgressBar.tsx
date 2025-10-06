import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './ProgressBar.css';

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  value: number;
  max?: number;
  theme?: Theme;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'top';
  animated?: boolean;
  striped?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      theme = 'minimal',
      size = 'md',
      showLabel = false,
      labelPosition = 'inside',
      animated = true,
      striped = false,
      variant = 'default',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const containerClasses = cn(
      'progress-bar',
      `progress-bar--${size}`,
      `progress-bar--${theme}`,
      className
    );

    const fillClasses = cn(
      'progress-bar__fill',
      `progress-bar__fill--${variant}`,
      animated && 'progress-bar__fill--animated',
      striped && 'progress-bar__fill--striped'
    );

    const labelContent = `${Math.round(percentage)}%`;

    return (
      <div ref={ref} className="progress-bar-container">
        {showLabel && labelPosition === 'top' && (
          <div className="progress-bar__label progress-bar__label--top">
            {labelContent}
          </div>
        )}
        <div
          className={containerClasses}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          <div
            className={fillClasses}
            style={{ width: `${percentage}%`, ...style }}
          >
            {showLabel && labelPosition === 'inside' && percentage > 15 && (
              <span className="progress-bar__label">{labelContent}</span>
            )}
          </div>
          {showLabel && labelPosition === 'outside' && (
            <span className="progress-bar__label progress-bar__label--outside">
              {labelContent}
            </span>
          )}
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
