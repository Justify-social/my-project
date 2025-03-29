import React from 'react';
import { cn } from '@/utils/string/utils';
import { DividerProps } from './types';

/**
 * Divider component used to visually separate content
 */
export function Divider({
  className,
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  color = 'divider',
  ...props
}: DividerProps) {
  // Determine the appropriate classes based on the props
  const thicknessClasses = {
    thin: 'border-[1px]',
    medium: 'border-[2px]',
    thick: 'border-[3px]'
  };

  const variantClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  };

  // Set the color class from the theme or use the provided color
  const colorClass = color === 'divider' ? 'border-french-grey' : `border-${color}`;

  const orientationClasses = {
    horizontal: 'w-full my-4 border-0 border-t',
    vertical: 'h-full mx-4 border-0 border-l'
  };
  
  return (
    <div 
      className={cn(
        orientationClasses[orientation],
        variantClasses[variant],
        thicknessClasses[thickness],
        colorClass,
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}

export default Divider; 