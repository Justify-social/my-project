'use client';

import React, { forwardRef, useMemo } from 'react';
import { IconProps, IconSize, SIZE_CLASSES } from './types';
import cn from 'classnames';
import { getIconPath, normalizeIconName, iconExists } from './icons';

/**
 * Universal Icon Component
 * Single component that handles all icon types with built-in error recovery
 */
export const Icon = forwardRef<HTMLImageElement, IconProps>((props, ref) => {
  const {
    name,
    size = 'md',
    variant = 'light',
    className = '',
    color,
    active = false,
    title,
    onClick,
    ...rest
  } = props;
  
  // Early validation - catch errors before they propagate
  if (!name) {
    console.warn('Icon: No name provided, using fallback');
    return <FallbackIcon size={size} className={className} {...rest} ref={ref} />;
  }

  // Normalize the icon name
  const normalizedName = normalizeIconName(name);
  
  // Determine which variant to use (solid when active, light by default)
  const finalVariant = active ? 'solid' : variant;
  
  // Get the correct icon path with proper error handling
  const iconPath = getIconPath(normalizedName, finalVariant);
  
  // Size class based on the size prop
  const sizeClass = SIZE_CLASSES[size as IconSize] || SIZE_CLASSES.md;

  // Compute CSS classes for the icon
  const cssClasses = useMemo(() => {
    return cn(
      'inline-block',
      sizeClass,
      className
    );
  }, [sizeClass, className]);

  return (
    <img
      ref={ref}
      src={iconPath}
      alt={title || `${name} icon`}
      title={title}
      className={cssClasses}
      onClick={onClick}
      {...rest}
    />
  );
});

Icon.displayName = 'Icon';

// Convenience components for specific variants
export const SolidIcon = forwardRef<HTMLImageElement, Omit<IconProps, 'variant'>>((props, ref) => (
  <Icon {...props} variant="solid" ref={ref} />
));
SolidIcon.displayName = 'SolidIcon';

export const LightIcon = forwardRef<HTMLImageElement, Omit<IconProps, 'variant'>>((props, ref) => (
  <Icon {...props} variant="light" ref={ref} />
));
LightIcon.displayName = 'LightIcon';

// Fallback icon for error cases
function FallbackIcon({ size = 'md', className, ...rest }: Omit<IconProps, 'name'>) {
  const sizeClass = SIZE_CLASSES[size as IconSize] || SIZE_CLASSES.md;
  
  return (
    <div 
      className={cn('inline-flex items-center justify-center bg-gray-200 text-gray-500 rounded', sizeClass, className)}
      {...rest}
    >
      ?
    </div>
  );
}

export default Icon; 