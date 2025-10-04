import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import './Accordion.css';

export interface AccordionItem {
  title: string | React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: number[];
  theme?: Theme;
  variant?: 'default' | 'bordered' | 'separated';
  iconPosition?: 'left' | 'right';
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      allowMultiple = false,
      defaultOpen = [],
      theme = 'minimal',
      variant = 'default',
      iconPosition = 'right',
      className,
      ...props
    },
    ref
  ) => {
    const [openItems, setOpenItems] = useState<number[]>(defaultOpen);

    const toggleItem = (index: number) => {
      if (items[index]?.disabled) return;

      if (allowMultiple) {
        setOpenItems((prev) =>
          prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
      } else {
        setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          toggleItem(index);
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Focus next item
          const nextIndex = (index + 1) % items.length;
          document.getElementById(`accordion-header-${nextIndex}`)?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Focus previous item
          const prevIndex = index === 0 ? items.length - 1 : index - 1;
          document.getElementById(`accordion-header-${prevIndex}`)?.focus();
          break;
        case 'Home':
          e.preventDefault();
          document.getElementById('accordion-header-0')?.focus();
          break;
        case 'End':
          e.preventDefault();
          document.getElementById(`accordion-header-${items.length - 1}`)?.focus();
          break;
      }
    };

    const containerClasses = cn(
      'accordion',
      `accordion--${variant}`,
      `accordion--${theme}`,
      className
    );

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {items.map((item, index) => {
          const isOpen = openItems.includes(index);

          return (
            <AccordionItemComponent
              key={index}
              item={item}
              index={index}
              isOpen={isOpen}
              onToggle={() => toggleItem(index)}
              onKeyDown={handleKeyDown}
              iconPosition={iconPosition}
            />
          );
        })}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

interface AccordionItemComponentProps {
  item: AccordionItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent, index: number) => void;
  iconPosition: 'left' | 'right';
}

function AccordionItemComponent({
  item,
  index,
  isOpen,
  onToggle,
  onKeyDown,
  iconPosition,
}: AccordionItemComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        contentRef.current.style.maxHeight = contentRef.current.scrollHeight + 'px';
      } else {
        contentRef.current.style.maxHeight = '0px';
      }
    }
  }, [isOpen]);

  return (
    <div className="accordion__item">
      <button
        id={`accordion-header-${index}`}
        className={cn(
          'accordion__header',
          item.disabled && 'accordion__header--disabled',
          iconPosition === 'left' && 'accordion__header--icon-left'
        )}
        onClick={onToggle}
        onKeyDown={(e) => onKeyDown(e, index)}
        disabled={item.disabled}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${index}`}
        aria-disabled={item.disabled}
      >
        {iconPosition === 'left' && (
          <span className={cn('accordion__icon', isOpen && 'accordion__icon--open')}>
            {item.icon || '▼'}
          </span>
        )}
        <span className="accordion__title">{item.title}</span>
        {iconPosition === 'right' && (
          <span className={cn('accordion__icon', isOpen && 'accordion__icon--open')}>
            {item.icon || '▼'}
          </span>
        )}
      </button>

      <div
        id={`accordion-content-${index}`}
        ref={contentRef}
        className="accordion__content"
        role="region"
        aria-labelledby={`accordion-header-${index}`}
      >
        <div className="accordion__content-inner">{item.content}</div>
      </div>
    </div>
  );
}
