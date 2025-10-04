import React, { useMemo } from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Pagination.css';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme?: Theme;
  variant?: 'default' | 'compact' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  showPageSize?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  totalItems?: number;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      theme = 'minimal',
      variant = 'default',
      size = 'md',
      showFirstLast = true,
      showPrevNext = true,
      siblingCount = 1,
      boundaryCount = 1,
      disabled = false,
      showPageSize = false,
      pageSize = 10,
      pageSizeOptions = [10, 20, 50, 100],
      onPageSizeChange,
      totalItems,
      className,
      ...props
    },
    ref
  ) => {
    const pageNumbers = useMemo(() => {
      const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

      if (totalPages <= totalNumbers) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const leftBoundary = Array.from({ length: boundaryCount }, (_, i) => i + 1);
      const rightBoundary = Array.from(
        { length: boundaryCount },
        (_, i) => totalPages - boundaryCount + i + 1
      );

      const leftSibling = Math.max(currentPage - siblingCount, boundaryCount + 2);
      const rightSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount - 1);

      const shouldShowLeftDots = leftSibling > boundaryCount + 2;
      const shouldShowRightDots = rightSibling < totalPages - boundaryCount - 1;

      const middleNumbers = Array.from(
        { length: rightSibling - leftSibling + 1 },
        (_, i) => leftSibling + i
      );

      const pages: (number | string)[] = [
        ...leftBoundary,
        ...(shouldShowLeftDots ? ['...'] : []),
        ...middleNumbers,
        ...(shouldShowRightDots ? ['...'] : []),
        ...rightBoundary,
      ];

      // Remove duplicates
      return pages.filter((page, index, arr) => arr.indexOf(page) === index);
    }, [currentPage, totalPages, siblingCount, boundaryCount]);

    const goToPage = (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage || disabled) {
        return;
      }
      onPageChange(page);
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToPrevPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    const containerClasses = cn(
      'pagination',
      `pagination--${variant}`,
      `pagination--${size}`,
      `pagination--${theme}`,
      className
    );

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    if (variant === 'simple') {
      return (
        <nav ref={ref} className={containerClasses} aria-label="pagination" {...props}>
          <button
            className="pagination__button"
            onClick={goToPrevPage}
            disabled={isFirstPage || disabled}
            aria-label="Previous page"
          >
            ← 이전
          </button>
          <div className="pagination__info">
            {currentPage} / {totalPages}
          </div>
          <button
            className="pagination__button"
            onClick={goToNextPage}
            disabled={isLastPage || disabled}
            aria-label="Next page"
          >
            다음 →
          </button>
        </nav>
      );
    }

    return (
      <nav ref={ref} className={containerClasses} aria-label="pagination" {...props}>
        {showFirstLast && (
          <button
            className="pagination__button"
            onClick={goToFirstPage}
            disabled={isFirstPage || disabled}
            aria-label="Go to first page"
          >
            ⟨⟨
          </button>
        )}

        {showPrevNext && (
          <button
            className="pagination__button"
            onClick={goToPrevPage}
            disabled={isFirstPage || disabled}
            aria-label="Previous page"
          >
            ⟨
          </button>
        )}

        {pageNumbers.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination__ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={cn(
                'pagination__button',
                page === currentPage && 'pagination__button--active'
              )}
              onClick={() => goToPage(page as number)}
              disabled={disabled}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {showPrevNext && (
          <button
            className="pagination__button"
            onClick={goToNextPage}
            disabled={isLastPage || disabled}
            aria-label="Next page"
          >
            ⟩
          </button>
        )}

        {showFirstLast && (
          <button
            className="pagination__button"
            onClick={goToLastPage}
            disabled={isLastPage || disabled}
            aria-label="Go to last page"
          >
            ⟩⟩
          </button>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="pagination__page-size">
            <label htmlFor="page-size-select" className="pagination__page-size-label">
              페이지당:
            </label>
            <select
              id="page-size-select"
              className="pagination__page-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {totalItems !== undefined && (
              <span className="pagination__total-info">
                (총 {totalItems}개)
              </span>
            )}
          </div>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';
