// src/components/ui/Card.tsx
import React from 'react';
import { classNames } from '../../utils/classNames';

export interface CardProps {
  /** The content of the card */
  children: React.ReactNode;
  /** The title of the card */
  title?: string;
  /** Optional action buttons or links to show in the header */
  actions?: React.ReactNode;
  /** Whether to add hover effects */
  hover?: boolean;
  /** Additional className */
  className?: string;
  /** Whether the card takes up the full width of its container */
  fullWidth?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Click handler for the entire card */
  onClick?: () => void;
}

/**
 * Card component for displaying content in a box
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  actions,
  hover = false,
  className,
  fullWidth = true,
  padding = 'md',
  onClick,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const cardClasses = classNames(
    'bg-white rounded-lg shadow-sm overflow-hidden',
    hover ? 'transition-shadow duration-200 hover:shadow-md' : '',
    onClick ? 'cursor-pointer' : '',
    fullWidth ? 'w-full' : '',
    className || ''
  );

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Header */}
      {(title || actions) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Body */}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};

export default Card;
