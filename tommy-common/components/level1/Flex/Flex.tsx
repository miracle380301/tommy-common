import React from 'react';
import { cn } from '../../utils/classNames';
import './Flex.css';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
  gap?: string | number;
  inline?: boolean;
  children: React.ReactNode;
}

const getGapValue = (gap: string | number | undefined): string => {
  if (gap === undefined) return '0';
  if (typeof gap === 'number') return `${gap}px`;
  const gapMap: { [key: string]: string } = {
    'sm': 'var(--spacing-sm)',
    'md': 'var(--spacing-md)',
    'lg': 'var(--spacing-lg)',
  };
  return gapMap[gap] || gap;
};

const getJustifyValue = (justify: string): string => {
  const justifyMap: { [key: string]: string } = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };
  return justifyMap[justify] || justify;
};

const getAlignValue = (align: string): string => {
  const alignMap: { [key: string]: string } = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };
  return alignMap[align] || align;
};

const getWrapValue = (wrap: boolean | string | undefined): string => {
  if (wrap === undefined || wrap === false) return 'nowrap';
  if (wrap === true) return 'wrap';
  return wrap;
};

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      justify = 'start',
      align = 'stretch',
      wrap = false,
      gap = 0,
      inline = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const flexStyle: React.CSSProperties = {
      display: inline ? 'inline-flex' : 'flex',
      flexDirection: direction,
      justifyContent: getJustifyValue(justify),
      alignItems: getAlignValue(align),
      flexWrap: getWrapValue(wrap) as React.CSSProperties['flexWrap'],
      gap: getGapValue(gap),
      ...style,
    };

    const classes = cn('flex', inline && 'flex--inline', className);

    return (
      <div ref={ref} className={classes} style={flexStyle} {...props}>
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';
