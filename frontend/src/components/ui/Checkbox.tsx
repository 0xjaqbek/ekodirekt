// src/components/ui/Checkbox.tsx
import React, { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label for the checkbox */
  label?: string;
  /** Help text to display below the checkbox */
  helperText?: string;
  /** Error message to display */
  error?: string;
}

/**
 * Checkbox component for boolean input
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, className, ...rest }, ref) => {
    const checkboxClasses = classNames(
      'h-4 w-4 rounded',
      'text-primary focus:ring-primary border-gray-300',
      error ? 'border-red-300' : '',
      className || ''
    );

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={checkboxClasses}
            {...rest}
          />
        </div>
        <div className="ml-3 text-sm">
          {label && (
            <label 
              htmlFor={rest.id} 
              className={`font-medium ${error ? 'text-red-700' : 'text-gray-700'} ${rest.disabled ? 'opacity-50' : ''}`}
            >
              {label}
            </label>
          )}
          {(helperText || error) && (
            <p className={`mt-1 ${error ? 'text-red-600' : 'text-gray-500'}`}>
              {error || helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;