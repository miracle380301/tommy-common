import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './SearchBar.css';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  theme?: Theme;
  size?: 'sm' | 'md' | 'lg';
  debounceMs?: number;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  fullWidth?: boolean;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onSearch,
      onClear,
      placeholder = '검색...',
      theme = 'minimal',
      size = 'md',
      debounceMs = 300,
      showSearchButton = false,
      showClearButton = true,
      loading = false,
      disabled = false,
      autoFocus = false,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [debouncedValue, setDebouncedValue] = useState(value || internalValue);

    const currentValue = value !== undefined ? value : internalValue;

    // Debounce logic
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(currentValue);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [currentValue, debounceMs]);

    // Call onSearch when debounced value changes
    useEffect(() => {
      if (onSearch && debouncedValue !== undefined) {
        onSearch(debouncedValue);
      }
    }, [debouncedValue, onSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(e);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue('');
      }

      onClear?.();
      onSearch?.('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(currentValue);
      }
    };

    const handleSearchClick = () => {
      onSearch?.(currentValue);
    };

    const containerClasses = cn(
      'search-bar',
      `search-bar--${size}`,
      `search-bar--${theme}`,
      fullWidth && 'search-bar--full-width',
      className
    );

    return (
      <div className={containerClasses}>
        <div className="search-bar__input-wrapper">
          <span className="search-bar__icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={ref}
            type="search"
            role="searchbox"
            aria-label="search"
            className="search-bar__input"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            {...props}
          />
          {showClearButton && currentValue && (
            <button
              type="button"
              className="search-bar__clear-button"
              onClick={handleClear}
              aria-label="Clear search"
              disabled={disabled}
            >
              ✕
            </button>
          )}
          {loading && (
            <div className="search-bar__loading" aria-label="Loading">
              ⏳
            </div>
          )}
        </div>
        {showSearchButton && (
          <button
            type="button"
            className="search-bar__search-button button button--primary"
            onClick={handleSearchClick}
            disabled={disabled}
          >
            검색
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
