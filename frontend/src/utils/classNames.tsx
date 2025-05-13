// src/utils/classNames.tsx
/**
 * Utility function to conditionally join class names
 * @param classes - Class names to join
 * @returns Joined class names
 */
export function classNames(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ');
  }
  