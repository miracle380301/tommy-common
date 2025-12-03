import React, { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './Dropdown.css';

export type DropdownItem =
  | {
      label: string;
      value?: string;
      onClick?: () => void;
      disabled?: boolean;
      icon?: React.ReactNode;
      divider?: false;
      danger?: boolean;
    }
  | {
      divider: true;
      label?: never;
      value?: never;
      onClick?: never;
      disabled?: never;
      icon?: never;
      danger?: never;
    };

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  disabled?: boolean;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      items,
      position = 'bottom-left',
      disabled = false,
      className = '',
      onOpen,
      onClose,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => {
      if (isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    });

    useEscapeKey(() => {
      if (isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    });

    useEffect(() => {
      if (isOpen) {
        onOpen?.();
      }
    }, [isOpen, onOpen]);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
    };

    const handleItemClick = (item: DropdownItem) => {
      if (item.disabled || item.divider) return;

      item.onClick?.();
      setIsOpen(false);
      onClose?.();
    };

    return (
      <div
        ref={dropdownRef}
        className={`dropdown ${disabled ? 'dropdown--disabled' : ''} ${className}`}
      >
        <div
          className="dropdown__trigger"
          onClick={handleToggle}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {trigger}
        </div>

        {isOpen && (
          <div
            className={`dropdown__menu dropdown__menu--${position}`}
            role="menu"
          >
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={`divider-${index}`} className="dropdown__divider" />;
              }

              return (
                <button
                  key={item.value || index}
                  className={`dropdown__item ${
                    item.disabled ? 'dropdown__item--disabled' : ''
                  } ${item.danger ? 'dropdown__item--danger' : ''}`}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="dropdown__item-icon">{item.icon}</span>
                  )}
                  <span className="dropdown__item-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
