// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label for the input */
  label?: string;
  /** Help text to display below the input */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input takes up the full width of its container */
  fullWidth?: boolean;
  /** Optional left icon */
  leftIcon?: React.ReactNode;
  /** Optional right icon */
  rightIcon?: React.ReactNode;
}

/**
 * Input component for text entry
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, disabled, fullWidth = true, leftIcon, rightIcon, className, ...rest }, ref) => {
    const inputClasses = classNames(
      'block rounded-md shadow-sm',
      'focus:ring-primary focus:border-primary',
      error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      disabled ? 'bg-gray-100 cursor-not-allowed' : '',
      fullWidth ? 'w-full' : '',
      className || ''
    );

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={rest.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{leftIcon}</span>
            </div>
          )}
          <input ref={ref} disabled={disabled} className={inputClasses} {...rest} />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{rightIcon}</span>
            </div>
          )}
        </div>
        {(helperText || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
