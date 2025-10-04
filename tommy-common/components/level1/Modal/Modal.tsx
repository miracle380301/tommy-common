import React, { useEffect } from 'react';
import { cn } from '../../utils/classNames';
import type { Theme } from '../../utils/types';
import { Portal } from '../../common/Portal';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import './Modal.css';

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  theme?: Theme;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  centered?: boolean;
  children: React.ReactNode;
}

export interface ModalHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
}

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, subtitle, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('modal__header', className)} {...props}>
        {title && <h2 className="modal__title">{title}</h2>}
        {subtitle && <p className="modal__subtitle">{subtitle}</p>}
        {children}
      </div>
    );
  }
);

ModalHeader.displayName = 'Modal.Header';

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('modal__body', className)} {...props}>
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'Modal.Body';

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('modal__footer', className)} {...props}>
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'Modal.Footer';

const ModalRoot = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      theme = 'minimal',
      closeOnOverlay = true,
      closeOnEsc = true,
      showCloseButton = true,
      centered = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // ESC key handler
    useEscapeKey(onClose, isOpen && closeOnEsc);

    // Lock body scroll when modal is open
    useLockBodyScroll(isOpen);

    // Handle overlay click
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnOverlay) {
        onClose();
      }
    };

    if (!isOpen) return null;

    const modalClasses = cn(
      'modal',
      `modal--${size}`,
      `modal--${theme}`,
      className
    );

    const overlayClasses = cn(
      'modal-overlay',
      centered ? 'modal-overlay--centered' : 'modal-overlay--top'
    );

    return (
      <Portal>
        <div
          className={overlayClasses}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
        >
          <div ref={ref} className={modalClasses} {...props}>
            {showCloseButton && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
            {title && (
              <div className="modal__header">
                <h2 className="modal__title">{title}</h2>
              </div>
            )}
            <div className="modal__content">{children}</div>
          </div>
        </div>
      </Portal>
    );
  }
);

ModalRoot.displayName = 'Modal';

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
