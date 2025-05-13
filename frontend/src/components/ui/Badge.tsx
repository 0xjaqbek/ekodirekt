// src/components/ui/Badge.tsx
import React from 'react';
import { classNames } from '../../utils/classNames';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** The content of the badge */
  children: React.ReactNode;
  /** The variant style of the badge */
  variant?: BadgeVariant;
  /** The size of the badge */
  size?: BadgeSize;
  /** Whether the badge is rounded or pill-shaped */
  pill?: boolean;
  /** Whether to display a dot indicator */
  dot?: boolean;
  /** Optional icon to display before the badge text */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Badge component for status indicators and counters
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  dot = false,
  icon,
  className,
}) => {
  const variantClasses = {
    primary: 'bg-primary-light text-primary-dark',
    secondary: 'bg-accent-light text-accent-dark',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  const badgeClasses = classNames(
    'inline-flex items-center font-medium',
    variantClasses[variant],
    sizeClasses[size],
    pill ? 'rounded-full' : 'rounded',
    className || ''
  );

  return (
    <span className={badgeClasses}>
      {dot && (
        <span
          className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
            variant === 'primary'
              ? 'bg-primary'
              : variant === 'secondary'
              ? 'bg-accent'
              : variant === 'success'
              ? 'bg-green-500'
              : variant === 'danger'
              ? 'bg-red-500'
              : variant === 'warning'
              ? 'bg-yellow-500'
              : variant === 'info'
              ? 'bg-blue-500'
              : 'bg-gray-500'
          }`}
        ></span>
      )}
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;