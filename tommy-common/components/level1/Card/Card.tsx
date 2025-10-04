import React from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, className, ...props }, ref) => {
    if (children) {
      return (
        <div ref={ref} className={cn('card-header', className)} {...props}>
          {children}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('card-header', className)} {...props}>
        <div className="card-header__content">
          {title && <div className="card-header__title">{title}</div>}
          {subtitle && <div className="card-header__subtitle">{subtitle}</div>}
        </div>
        {action && <div className="card-header__action">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'Card.Header';

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('card-body', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'Card.Body';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('card-footer', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'Card.Footer';

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      theme = 'minimal',
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'card',
      `card--${theme}`,
      `card--${variant}`,
      `card--padding-${padding}`,
      hoverable && 'card--hoverable',
      (clickable || onClick) && 'card--clickable',
      className
    );

    return (
      <div ref={ref} className={classes} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }
);

CardRoot.displayName = 'Card';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
