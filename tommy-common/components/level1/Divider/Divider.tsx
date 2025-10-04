import React from 'react';
import { cn } from '../../utils/classNames';
import './Divider.css';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
  label?: string | React.ReactNode;
  labelPosition?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

const spacingMap: { [key: string]: string } = {
  none: '0',
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
};

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      spacing = 'md',
      variant = 'solid',
      thickness = 1,
      color,
      label,
      labelPosition = 'center',
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const hasLabel = label || children;
    const spacingValue = spacingMap[spacing] || spacing;

    if (hasLabel && orientation === 'horizontal') {
      // Divider with label
      const classes = cn(
        'divider',
        'divider--with-label',
        `divider--label-${labelPosition}`,
        className
      );

      const lineStyle: React.CSSProperties = {
        borderTop: `${thickness}px ${variant} ${color || 'var(--border-color)'}`,
      };

      return (
        <div
          ref={ref}
          className={classes}
          style={{
            marginTop: spacingValue,
            marginBottom: spacingValue,
            ...style,
          }}
          {...props}
        >
          <div className="divider__line" style={lineStyle} />
          <div className="divider__label">{label || children}</div>
          <div className="divider__line" style={lineStyle} />
        </div>
      );
    }

    // Simple divider without label
    const classes = cn(
      'divider',
      `divider--${orientation}`,
      `divider--${variant}`,
      className
    );

    const dividerStyle: React.CSSProperties = {
      ...(orientation === 'horizontal' && {
        borderTop: `${thickness}px ${variant} ${color || 'var(--border-color)'}`,
        marginTop: spacingValue,
        marginBottom: spacingValue,
      }),
      ...(orientation === 'vertical' && {
        borderLeft: `${thickness}px ${variant} ${color || 'var(--border-color)'}`,
        marginLeft: spacingValue,
        marginRight: spacingValue,
      }),
      ...style,
    };

    return <div ref={ref} className={classes} style={dividerStyle} {...props} />;
  }
);

Divider.displayName = 'Divider';
