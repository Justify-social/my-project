import React from 'react';
import { cn } from '@/utils/string/utils';
import { CodeProps, TextSize } from './types';

/**
 * Code component for displaying code snippets
 * 
 * @example
 * ```tsx
 * <Code>const hello = "world";</Code>
 * <Code block>
 *   function example() {
 *     return "Hello World";
 *   }
 * </Code>
 * ```
 */
export const Code = ({
  size = 'sm',
  block = false,
  className,
  children,
  ...props
}: CodeProps) => {
  // Size class mapping
  const sizeClasses: Record<TextSize, string> = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl'
  };

  const baseStyles = cn(
    sizeClasses[size],
    'font-mono bg-gray-100 dark:bg-gray-800 rounded',
    !block && 'px-1.5 py-0.5',
    block && 'block p-4 my-4 overflow-x-auto',
    className
  );

  if (block) {
    return (
      <pre className={baseStyles} {...props}>
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <code className={baseStyles} {...props}>
      {children}
    </code>
  );
};

export default Code; 