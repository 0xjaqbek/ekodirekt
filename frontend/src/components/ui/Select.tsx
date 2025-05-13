// src/components/ui/Select.tsx
import React, { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Options for the select */
  options: SelectOption[];
  /** Label for the select */
  label?: string;
  /** Help text to display below the select */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select takes up the full width of its container */
  fullWidth?: boolean;
  /** Optional placeholder text */
  placeholder?: string;
  /** Size of the select */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Select component for dropdown selection
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    options, 
    label, 
    helperText, 
    error, 
    disabled, 
    fullWidth = true, 
    placeholder, 
    size = 'md', 
    className, 
    ...rest 
  }, ref) => {
    const sizeClasses = {
      sm: 'py-1 text-sm',
      md: 'py-2',
      lg: 'py-3 text-lg',
    };

    const selectClasses = classNames(
      'block rounded-md border-gray-300 shadow-sm',
      'focus:ring-primary focus:border-primary',
      sizeClasses[size],
      error
        ? 'border-red-300 text-red-900 focus:outline-none focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
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
        <select
          ref={ref}
          disabled={disabled}
          className={selectClasses}
          {...rest}
          defaultValue={placeholder ? '' : rest.defaultValue}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(helperText || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
