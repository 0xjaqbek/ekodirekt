// src/components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { classNames } from '../../utils/classNames';
import { createPortal } from 'react-dom';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  /** The content of the toast */
  children: React.ReactNode;
  /** Whether the toast is visible */
  isOpen: boolean;
  /** Function to call when the toast should close */
  onClose: () => void;
  /** The variant style of the toast */
  variant?: ToastVariant;
  /** The position of the toast */
  position?: ToastPosition;
  /** The title of the toast */
  title?: string;
  /** Duration in milliseconds before auto-closing (0 to disable) */
  duration?: number;
  /** Whether to show the close button */
  showClose?: boolean;
  /** Additional className */
  className?: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
}

/**
 * Toast component for displaying notifications
 */
const Toast: React.FC<ToastProps> = ({
  children,
  isOpen,
  onClose,
  variant = 'info',
  position = 'top-right',
  title,
  duration = 5000,
  showClose = true,
  className,
  icon,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const variantClasses = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  const iconColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'info':
        return (
          <svg className={`h-5 w-5 ${iconColors[variant]}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'success':
        return (
          <svg className={`h-5 w-5 ${iconColors[variant]}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`h-5 w-5 ${iconColors[variant]}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className={`h-5 w-5 ${iconColors[variant]}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const toastClasses = classNames(
    'rounded-md border p-4 shadow-lg w-full max-w-sm transition-all duration-300 ease-in-out',
    'transform translate-y-0 opacity-100',
    variantClasses[variant],
    positionClasses[position],
    className || ''
  );

  if (!isMounted || !isOpen) return null;

  // Create portal for the toast
  return createPortal(
    <div
      className={classNames(
        'fixed z-50',
        positionClasses[position]
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={toastClasses}>
        <div className="flex">
          {(icon || getDefaultIcon()) && (
            <div className="flex-shrink-0 mr-3">{icon || getDefaultIcon()}</div>
          )}
          <div className="flex-1">
            {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
            <div className="text-sm">{children}</div>
          </div>
          {showClose && (
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    variant === 'info'
                      ? 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                      : variant === 'success'
                      ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600'
                      : variant === 'warning'
                      ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
                      : 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                  }`}
                  onClick={onClose}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Toast;