import React from 'react';
import { cn } from '@/utils/string/utils';
import { BlockquoteProps, ParagraphSize } from './types';
import { Text } from './Text';

/**
 * Blockquote component for displaying quoted content
 * 
 * @example
 * ```tsx
 * <Blockquote>Simple quote content</Blockquote>
 * <Blockquote cite="Author Name">Quote with attribution</Blockquote>
 * <Blockquote bordered={false}>Quote without border</Blockquote>
 * ```
 */
export const Blockquote = ({
  size = 'base',
  bordered = true,
  cite,
  className,
  children,
  ...props
}: BlockquoteProps) => {
  // Size class mapping
  const sizeClasses: Record<ParagraphSize, string> = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg'
  };

  return (
    <blockquote
      className={cn(
        sizeClasses[size],
        'my-4 italic',
        bordered && 'pl-4 border-l-4 border-gray-300 dark:border-gray-700',
        className
      )}
      {...props}>
      {children}
      
      {cite && (
        <footer className="mt-2">
          <Text size="sm" color="muted">— {cite}</Text>
        </footer>
      )}
    </blockquote>
  );
};

export default Blockquote; 