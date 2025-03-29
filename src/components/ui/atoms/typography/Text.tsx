import React from 'react';
import { cn } from '@/utils/string/utils';
import { TextProps, TextSize, TextWeight, TextColor } from './types';

/**
 * Text component for displaying text with various styles
 * 
 * @example
 * ```tsx
 * <Text>Default text</Text>
 * <Text size="sm" color="muted">Small muted text</Text>
 * <Text weight="bold" color="primary">Bold primary text</Text>
 * ```
 */
export const Text = ({
  as: Component = 'span',
  size = 'base',
  weight = 'normal',
  color = 'default',
  truncate = false,
  className,
  children,
  ...props
}: TextProps) => {
  // Size class mapping
  const sizeClasses: Record<TextSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl'
  };

  // Weight class mapping
  const weightClasses: Record<TextWeight, string> = {
    'light': 'font-light',
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold'
  };

  // Color class mapping
  const colorClasses: Record<TextColor, string> = {
    'default': 'text-gray-900',
    'muted': 'text-gray-500',
    'primary': 'text-primary-color',
    'secondary': 'text-secondary-color',
    'accent': 'text-accent-color',
    'success': 'text-green-600',
    'warning': 'text-yellow-600',
    'danger': 'text-red-600'
  };

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        truncate && 'truncate',
        className
      )}
      {...props}>
      {children}
    </Component>
  );
};

export default Text; 