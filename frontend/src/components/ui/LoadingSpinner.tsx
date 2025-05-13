// src/components/ui/LoadingSpinner.tsx
import React from 'react';
import { classNames } from '../../utils/classNames';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'primary' | 'secondary' | 'white' | 'black' | 'gray';

export interface LoadingSpinnerProps {
  /** The size of the spinner */
  size?: SpinnerSize;
  /** The color of the spinner */
  color?: SpinnerColor;
  /** Additional className */
  className?: string;
  /** Whether to show a caption/label */
  label?: string;
  /** Whether the spinner should take up the full container width */
  fullWidth?: boolean;
}

/**
 * LoadingSpinner component for indicating loading states
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  label,
  fullWidth = false,
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-accent',
    white: 'text-white',
    black: 'text-black',
    gray: 'text-gray-500',
  };

  const spinnerClasses = classNames(
    'animate-spin',
    sizeClasses[size],
    colorClasses[color],
    className || ''
  );

  const containerClasses = classNames(
    'flex flex-col items-center justify-center',
    fullWidth ? 'w-full' : ''
  );

  return (
    <div className={containerClasses}>
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && <span className={`mt-2 text-sm ${colorClasses[color]}`}>{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
