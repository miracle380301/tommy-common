import React, { useState } from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Tabs.css';

export interface TabItem {
  key: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  defaultActive?: string;
  activeTab?: string;
  onChange?: (key: string) => void;
  theme?: Theme;
  variant?: 'line' | 'enclosed' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      items,
      defaultActive,
      activeTab,
      onChange,
      theme = 'minimal',
      variant = 'line',
      size = 'md',
      fullWidth = false,
      orientation = 'horizontal',
      className,
      ...props
    },
    ref
  ) => {
    const [internalActiveTab, setInternalActiveTab] = useState(
      defaultActive || items[0]?.key
    );

    const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;

    const handleTabChange = (key: string) => {
      if (activeTab === undefined) {
        setInternalActiveTab(key);
      }
      onChange?.(key);
    };

    const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
      let nextIndex: number | undefined;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      // Skip disabled tabs
      while (items[nextIndex]?.disabled) {
        nextIndex = (nextIndex + 1) % items.length;
      }

      handleTabChange(items[nextIndex].key);
    };

    const containerClasses = cn(
      'tabs',
      `tabs--${variant}`,
      `tabs--${size}`,
      `tabs--${orientation}`,
      `tabs--${theme}`,
      fullWidth && 'tabs--full-width',
      className
    );

    const activeItem = items.find((item) => item.key === currentActiveTab);

    return (
      <div ref={ref} className={containerClasses} {...props}>
        <div className="tabs__list" role="tablist">
          {items.map((item, index) => {
            const isActive = item.key === currentActiveTab;

            return (
              <button
                key={item.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${item.key}`}
                tabIndex={isActive ? 0 : -1}
                disabled={item.disabled}
                className={cn(
                  'tabs__tab',
                  isActive && 'tabs__tab--active',
                  item.disabled && 'tabs__tab--disabled'
                )}
                onClick={() => !item.disabled && handleTabChange(item.key)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {item.icon && <span className="tabs__icon">{item.icon}</span>}
                <span className="tabs__label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {activeItem && (
          <div
            id={`panel-${activeItem.key}`}
            role="tabpanel"
            aria-labelledby={activeItem.key}
            className="tabs__panel"
          >
            {activeItem.content}
          </div>
        )}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
