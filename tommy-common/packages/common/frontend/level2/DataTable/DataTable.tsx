import React, { useState, useMemo } from 'react';
import { Card } from '../../level1/Card';
import { Table } from '../../level1/Table';
import { SearchBar } from '../../level1/SearchBar';
import { Button } from '../../level1/Button';
import { Flex } from '../../level1/Flex';
import { Pagination } from '../../level1/Pagination';
import { Tag } from '../../level1/Tag';
import { FilterPanel } from '../FilterPanel';
import type { FilterConfig } from '../FilterPanel';
import type { Theme } from '../../utils/types';
import type { Column } from '../../level1/Table';
import './DataTable.css';

export interface DataTableProps {
  columns: Column[];
  data: any[];
  theme?: Theme;
  searchable?: boolean;
  filterable?: boolean;
  filterConfig?: FilterConfig[];
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: any) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  exportable?: boolean;
  title?: string;
  loading?: boolean;
}

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  (
    {
      columns,
      data,
      theme = 'minimal',
      searchable = false,
      filterable = false,
      filterConfig = [],
      pagination = true,
      pageSize: initialPageSize = 10,
      onRowClick,
      selectable = false,
      onSelectionChange,
      exportable = false,
      title,
      loading = false,
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>(undefined);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // Search
    const searchedData = useMemo(() => {
      if (!searchQuery) return data;
      return data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [data, searchQuery]);

    // Filter
    const filteredData = useMemo(() => {
      let result = searchedData;

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value && value !== 'all') {
          result = result.filter((row) => {
            if (Array.isArray(value)) {
              return value.includes(row[key]);
            }
            return row[key] === value;
          });
        }
      });

      return result;
    }, [searchedData, filterValues]);

    // Sort
    const sortedData = useMemo(() => {
      if (!sortConfig) return filteredData;

      return [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === bVal) return 0;
        const comparison = aVal > bVal ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, sortedData.length);
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Active filters
    const activeFilters = Object.entries(filterValues)
      .filter(([_, value]) => value && value !== 'all')
      .map(([key, value]) => ({
        key,
        label: filterConfig.find((f) => f.key === key)?.label || key,
        value: String(value),
      }));

    const removeFilter = (key: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: 'all' }));
    };

    const clearFilters = () => {
      setFilterValues({});
    };

    const handleExport = () => {
      // Simple CSV export
      const headers = columns.map((col) => col.label).join(',');
      const rows = filteredData.map((row) =>
        columns.map((col) => row[col.key]).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'export.csv';
      link.click();
      URL.revokeObjectURL(url);
    };

    const handleSelectionChange = (rows: any[]) => {
      setSelectedRows(rows);
      onSelectionChange?.(rows);
    };

    return (
      <Card ref={ref} theme={theme} className="data-table">
        {/* Header */}
        <Card.Header>
          <Flex justify="between" align="center" wrap>
            {title && <h3>{title}</h3>}

            <Flex gap="md" align="center">
              {searchable && (
                <SearchBar
                  value={searchQuery}
                  onSearch={setSearchQuery}
                  placeholder="검색..."
                />
              )}

              {filterable && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  필터
                </Button>
              )}

              {exportable && (
                <Button variant="outline" onClick={handleExport}>
                  내보내기
                </Button>
              )}
            </Flex>
          </Flex>

          {/* Filter Panel */}
          {filterable && showFilters && (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <FilterPanel
                filters={filterConfig}
                values={filterValues}
                onChange={(key, value) =>
                  setFilterValues((prev) => ({ ...prev, [key]: value }))
                }
                onReset={clearFilters}
                theme={theme}
              />
            </div>
          )}

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <Flex gap="sm" wrap style={{ marginTop: 'var(--spacing-md)' }}>
              {activeFilters.map((filter) => (
                <Tag
                  key={filter.key}
                  variant="info"
                  onClose={() => removeFilter(filter.key)}
                >
                  {filter.label}: {filter.value}
                </Tag>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                모두 지우기
              </Button>
            </Flex>
          )}
        </Card.Header>

        {/* Table */}
        <Card.Body>
          <Table
            columns={columns}
            data={paginatedData}
            sortConfig={sortConfig}
            onSort={setSortConfig}
            selectable={selectable}
            selectedRows={selectedRows}
            onSelectionChange={handleSelectionChange}
            onRowClick={onRowClick}
            loading={loading}
          />
        </Card.Body>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <Card.Footer>
            <Flex justify="between" align="center">
              <span className="data-table__info">
                {filteredData.length}개 중 {startIndex + 1}-{endIndex} 표시
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showPageSize
              />
            </Flex>
          </Card.Footer>
        )}
      </Card>
    );
  }
);

DataTable.displayName = 'DataTable';
