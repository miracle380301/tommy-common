import React from 'react';
import { cn } from '../../utils/classNames';
import './Grid.css';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number | string | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  autoRows?: string;
  autoFlow?: 'row' | 'column' | 'dense';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode;
}

const getGapValue = (gap: string | number | undefined): string => {
  if (gap === undefined) return '';
  if (typeof gap === 'number') return `${gap}px`;
  const gapMap: { [key: string]: string } = {
    'sm': 'var(--spacing-sm)',
    'md': 'var(--spacing-md)',
    'lg': 'var(--spacing-lg)',
  };
  return gapMap[gap] || gap;
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 1,
      gap = 'md',
      rowGap,
      columnGap,
      autoRows = 'auto',
      autoFlow = 'row',
      alignItems = 'stretch',
      justifyItems = 'stretch',
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const getColumnsStyle = () => {
      if (columns === 'auto') {
        return 'repeat(auto-fit, minmax(250px, 1fr))';
      }
      if (typeof columns === 'number') {
        return `repeat(${columns}, 1fr)`;
      }
      if (typeof columns === 'object') {
        // For responsive columns, use the smallest breakpoint as default
        return `repeat(${columns.sm || columns.md || columns.lg || columns.xl || 1}, 1fr)`;
      }
      return columns;
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: getColumnsStyle(),
      gap: getGapValue(gap),
      ...(rowGap !== undefined && { rowGap: getGapValue(rowGap) }),
      ...(columnGap !== undefined && { columnGap: getGapValue(columnGap) }),
      gridAutoRows: autoRows,
      gridAutoFlow: autoFlow,
      alignItems,
      justifyItems,
      ...style,
    };

    const classes = cn('grid', columns === 'auto' && 'grid--auto', className);

    return (
      <div ref={ref} className={classes} style={gridStyle} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
