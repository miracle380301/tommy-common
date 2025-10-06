import React, { useState, useId, useRef, useEffect } from 'react';
import { cn } from '../../utils/classNames';
import { Theme, Size, SelectOption } from '../../utils/types';
import { Portal } from '../../common/Portal';
import './Select.css';

export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options list */
  options: SelectOption[];
  /** Theme to apply */
  theme?: Theme;
  /** Select size */
  size?: Size;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Selected value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Change handler */
  onChange?: (value: string) => void;
}

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      theme = 'minimal',
      size = 'md',
      label,
      placeholder = '선택하세요',
      value,
      defaultValue,
      error,
      disabled = false,
      required = false,
      fullWidth = false,
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const selectId = props.id || id;
    const errorId = `${selectId}-error`;

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find(opt => opt.value === currentValue);

    // Update dropdown position when opened
    useEffect(() => {
      if (isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        // Check if click is outside both select button and dropdown
        const isOutsideSelect = selectRef.current && !selectRef.current.contains(target);
        const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);

        if (isOutsideSelect && isOutsideDropdown) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          setIsOpen(!isOpen);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
      }
    };

    const handleSelect = (optionValue: string) => {
      if (disabled) return;

      setInternalValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'select-wrapper',
          fullWidth && 'select-wrapper--full-width',
          className
        )}
        data-theme={theme}
        {...props}
      >
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {required && <span className="select-label__required">*</span>}
          </label>
        )}
        <div
          ref={selectRef}
          className={cn(
            'select-container',
            `select-container--${size}`,
            `select-container--${theme}`,
            isOpen && 'select-container--open',
            error && 'select-container--error',
            disabled && 'select-container--disabled'
          )}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={handleToggle}
        >
          <span className={cn('select-value', !selectedOption && 'select-value--placeholder')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="select-arrow">
            <ChevronIcon isOpen={isOpen} />
          </span>
        </div>
        {isOpen && !disabled && (
          <Portal>
            <div
              ref={dropdownRef}
              className={cn('select-dropdown', `select-dropdown--${theme}`)}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 9999999
              }}
            >
              <ul className="select-options" role="listbox">
                {options.map((option) => (
                  <li
                    key={option.value}
                    className={cn(
                      'select-option',
                      option.value === currentValue && 'select-option--selected'
                    )}
                    role="option"
                    aria-selected={option.value === currentValue}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        )}
        {error && (
          <p id={errorId} className="select-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
