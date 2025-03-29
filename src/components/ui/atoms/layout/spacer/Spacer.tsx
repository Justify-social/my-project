import React from 'react';
import { cn } from '@/utils/string/utils';
import { SpacerProps, SpacerSize } from './types';

/**
 * Convert a predefined size to a corresponding pixel value
 */
const sizeMap: Record<SpacerSize, string> = {
  'xs': '0.25rem', // 4px
  'sm': '0.5rem',  // 8px
  'md': '1rem',    // 16px
  'lg': '1.5rem',  // 24px
  'xl': '2rem',    // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

/**
 * Spacer component adds whitespace between UI elements
 */
export function Spacer({
  className,
  x,
  y,
  inline = false,
  ...props
}: SpacerProps) {
  // Process x and y values to create style prop
  const style: React.CSSProperties = {};
  
  // Process x (width) value
  if (x !== undefined) {
    if (typeof x === 'string' && x in sizeMap) {
      style.width = sizeMap[x as SpacerSize];
    } else {
      style.width = typeof x === 'number' ? `${x}px` : x;
    }
  }
  
  // Process y (height) value
  if (y !== undefined) {
    if (typeof y === 'string' && y in sizeMap) {
      style.height = sizeMap[y as SpacerSize];
    } else {
      style.height = typeof y === 'number' ? `${y}px` : y;
    }
  }
  
  // Apply display property based on inline prop
  style.display = inline ? 'inline-block' : 'block';
  
  return (
    <div 
      className={cn('shrink-0', className)}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Spacer; 