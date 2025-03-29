import React from 'react';
import { cn } from '@/utils/string/utils';
import { ParagraphProps, ParagraphSize, ParagraphColor } from './types';

/**
 * Paragraph component for block text content
 * 
 * @example
 * ```tsx
 * <Paragraph>Default paragraph text</Paragraph>
 * <Paragraph size="sm" color="muted">Small muted paragraph</Paragraph>
 * <Paragraph spaced={false}>Paragraph without default spacing</Paragraph>
 * ```
 */
export const Paragraph = ({
  size = 'base',
  color = 'default',
  spaced = true,
  className,
  children,
  ...props
}: ParagraphProps) => {
  // Size class mapping
  const sizeClasses: Record<ParagraphSize, string> = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg'
  };

  // Color class mapping
  const colorClasses: Record<ParagraphColor, string> = {
    'default': 'text-gray-900',
    'muted': 'text-gray-500',
    'primary': 'text-primary-color',
    'secondary': 'text-secondary-color'
  };

  return (
    <p
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        spaced && 'mb-4',
        className
      )}
      {...props}>
      {children}
    </p>
  );
};

export default Paragraph; 