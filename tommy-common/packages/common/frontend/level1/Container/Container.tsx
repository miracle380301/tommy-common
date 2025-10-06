import React from 'react';
import { cn } from '../../utils/classNames';
import './Container.css';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | string;
  padding?: boolean | string;
  centered?: boolean;
  children: React.ReactNode;
}

const maxWidthMap: { [key: string]: string } = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      maxWidth = 'lg',
      padding = true,
      centered = true,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const getMaxWidth = () => {
      if (maxWidth in maxWidthMap) {
        return maxWidthMap[maxWidth];
      }
      return maxWidth;
    };

    const getPadding = () => {
      if (padding === false) return '0';
      if (typeof padding === 'string') return padding;
      return 'var(--spacing-md)';
    };

    const containerStyle: React.CSSProperties = {
      width: '100%',
      maxWidth: getMaxWidth(),
      paddingLeft: getPadding(),
      paddingRight: getPadding(),
      ...(centered && { marginLeft: 'auto', marginRight: 'auto' }),
      ...style,
    };

    const classes = cn(
      'container',
      `container--${maxWidth}`,
      !padding && 'container--no-padding',
      className
    );

    return (
      <div ref={ref} className={classes} style={containerStyle} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
