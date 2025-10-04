import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Table.css';

export interface Column<T = any> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  data: T[];
  theme?: Theme;
  variant?: 'default' | 'striped' | 'bordered' | 'hover';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  emptyMessage?: string | React.ReactNode;
  onSort?: (sortConfig: SortConfig) => void;
  sortConfig?: SortConfig;
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedRows: (string | number)[]) => void;
  onRowClick?: (row: T, index: number) => void;
  stickyHeader?: boolean;
  responsive?: boolean;
}

export const Table = React.forwardRef<HTMLDivElement, TableProps>(
  (
    {
      columns,
      data,
      theme = 'minimal',
      variant = 'default',
      size = 'md',
      loading = false,
      emptyMessage = '데이터가 없습니다',
      onSort,
      sortConfig,
      selectable = false,
      selectedRows = [],
      onSelectionChange,
      onRowClick,
      stickyHeader = false,
      responsive = true,
      className,
      ...props
    },
    ref
  ) => {
    const [internalSortConfig, setInternalSortConfig] = useState<SortConfig | null>(null);
    const [internalSelectedRows, setInternalSelectedRows] = useState<(string | number)[]>([]);

    const currentSortConfig = sortConfig || internalSortConfig;
    const currentSelectedRows = selectedRows.length > 0 ? selectedRows : internalSelectedRows;

    const sortedData = useMemo(() => {
      if (!currentSortConfig) return data;

      return [...data].sort((a, b) => {
        const aVal = a[currentSortConfig.key];
        const bVal = b[currentSortConfig.key];

        if (aVal === bVal) return 0;

        const comparison = aVal > bVal ? 1 : -1;
        return currentSortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }, [data, currentSortConfig]);

    const handleSort = (columnKey: string) => {
      const column = columns.find((c) => c.key === columnKey);
      if (!column?.sortable) return;

      let newDirection: 'asc' | 'desc' = 'asc';

      if (currentSortConfig?.key === columnKey) {
        newDirection = currentSortConfig.direction === 'asc' ? 'desc' : 'asc';
      }

      const newSortConfig: SortConfig = { key: columnKey, direction: newDirection };

      if (onSort) {
        onSort(newSortConfig);
      } else {
        setInternalSortConfig(newSortConfig);
      }
    };

    const handleSelectAll = (checked: boolean) => {
      const newSelected = checked ? data.map((row: any) => row.id) : [];

      if (onSelectionChange) {
        onSelectionChange(newSelected);
      } else {
        setInternalSelectedRows(newSelected);
      }
    };

    const handleSelectRow = (rowId: string | number, checked: boolean) => {
      const newSelected = checked
        ? [...currentSelectedRows, rowId]
        : currentSelectedRows.filter((id) => id !== rowId);

      if (onSelectionChange) {
        onSelectionChange(newSelected);
      } else {
        setInternalSelectedRows(newSelected);
      }
    };

    const containerClasses = cn(
      'table-container',
      stickyHeader && 'table-container--sticky',
      className
    );

    const tableClasses = cn(
      'table',
      `table--${variant}`,
      `table--${size}`,
      `table--${theme}`
    );

    if (loading) {
      return (
        <div ref={ref} className={containerClasses} {...props}>
          <div className="table__loading">
            <div className="table__loading-spinner">⏳</div>
            <p>로딩 중...</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div ref={ref} className={containerClasses} {...props}>
          <div className="table__empty">
            {typeof emptyMessage === 'string' ? <p>{emptyMessage}</p> : emptyMessage}
          </div>
        </div>
      );
    }

    const allSelected = data.length > 0 && currentSelectedRows.length === data.length;
    const someSelected = currentSelectedRows.length > 0 && currentSelectedRows.length < data.length;

    return (
      <div ref={ref} className={containerClasses} {...props}>
        <table className={tableClasses}>
          <thead className="table__header">
            <tr>
              {selectable && (
                <th className="table__header-cell table__checkbox-cell" scope="col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'table__header-cell',
                    column.sortable && 'table__header-cell--sortable',
                    currentSortConfig?.key === column.key && 'table__header-cell--sorted'
                  )}
                  style={{
                    width: column.width,
                    textAlign: column.align || 'left',
                  }}
                  scope="col"
                  onClick={() => column.sortable && handleSort(column.key)}
                  aria-sort={
                    currentSortConfig?.key === column.key
                      ? currentSortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {column.headerRender ? column.headerRender() : column.label}
                  {column.sortable && (
                    <span className="table__sort-icon">
                      {currentSortConfig?.key === column.key
                        ? currentSortConfig.direction === 'asc'
                          ? ' ▲'
                          : ' ▼'
                        : ' ⇅'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table__body">
            {sortedData.map((row: any, rowIndex) => {
              const rowId = row.id || rowIndex;
              const isSelected = currentSelectedRows.includes(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'table__body-row',
                    isSelected && 'table__body-row--selected',
                    onRowClick && 'table__body-row--clickable'
                  )}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {selectable && (
                    <td className="table__body-cell table__checkbox-cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(rowId, e.target.checked);
                        }}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="table__body-cell"
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';
