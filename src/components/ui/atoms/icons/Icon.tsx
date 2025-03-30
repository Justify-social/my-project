'use client';

import React, { forwardRef, useMemo } from 'react';
import { IconProps, IconSize, SIZE_CLASSES } from './types';
import { cn } from '@/lib/utils';
import { getIconPath, normalizeIconName, iconExists } from './icons';

/**
 * Universal Icon Component
 * 
 * A single component that handles all icon types throughout the application.
 * Supports different sizes, variants, and states with built-in error recovery.
 * 
 * @example
 * ```tsx
 * // Basic icon
 * <Icon name="user" />
 * 
 * // Different sizes
 * <Icon name="home" size="sm" />
 * <Icon name="settings" size="lg" />
 * 
 * // Different variants
 * <Icon name="notification" variant="solid" />
 * <Icon name="notification" variant="light" />
 * 
 * // Active state (automatically uses solid variant)
 * <Icon name="star" active />
 * 
 * // Custom styling
 * <Icon name="check" className="text-success" />
 * 
 * // With click handler
 * <Icon name="close" onClick={handleClose} />
 * ```
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
    // Extract props that shouldn't be passed to the DOM element
    iconType,
    solid,
    action,
    ...rest
  } = props;
  
  // Early validation - catch errors before they propagate
  if (!name) {
    console.warn('Icon: No name provided, using fallback');
    return <FallbackIcon size={size} className={className} ref={ref} />;
  }

  // Normalize the icon name
  const normalizedName = useMemo(() => normalizeIconName(name), [name]);
  
  // Determine which variant to use (solid when active, light by default)
  const finalVariant = active ? 'solid' : variant;
  
  // Get the correct icon path with proper error handling
  const iconPath = useMemo(() => getIconPath(normalizedName, finalVariant), [normalizedName, finalVariant]);
  
  // Size class based on the size prop
  const sizeClass = SIZE_CLASSES[size as IconSize] || SIZE_CLASSES.md;

  // Interactive class - add pointer cursor when onClick is provided
  const interactiveClass = onClick ? 'cursor-pointer' : '';

  // Set proper role for accessibility
  const ariaRole = onClick ? 'button' : 'img';
  
  // Set proper tabIndex for keyboard navigation
  const tabIndex = onClick ? 0 : undefined;

  // Compute CSS classes for the icon
  const cssClasses = useMemo(() => {
    return cn(
      // Base classes
      'inline-block transition-transform',
      
      // Size class
      sizeClass,
      
      // Interactive styling
      interactiveClass,
      
      // Color class if provided
      color && `text-${color}`,
      
      // When active, add subtle scale effect
      active && 'scale-105',
      
      // When clickable and not active, add hover effect
      onClick && !active && 'hover:opacity-80',
      
      // Custom classes
      className
    );
  }, [sizeClass, interactiveClass, color, active, onClick, className]);

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLImageElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as any);
    }
  };

  return (
    <img
      ref={ref}
      src={iconPath}
      alt={title || `${name} icon`}
      title={title}
      className={cssClasses}
      onClick={onClick}
      role={ariaRole}
      tabIndex={tabIndex}
      onKeyDown={onClick ? handleKeyDown : undefined}
      aria-pressed={active ? true : undefined}
      style={{
        ...(color && { color }),
        ...(rest.style || {})
      }}
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
  // Extract props that shouldn't be passed to the DOM
  const { iconType, solid, action, variant, active, color, ...domProps } = rest as any;
  
  const sizeClass = SIZE_CLASSES[size as IconSize] || SIZE_CLASSES.md;
  
  return (
    <div 
      className={cn(
        'inline-flex items-center justify-center bg-secondary/10 text-secondary rounded',
        sizeClass,
        className
      )}
      role="img"
      aria-label="Icon not found"
      title="Icon not found"
      {...domProps}
    >
      <span className="font-medium">?</span>
    </div>
  );
}

export default Icon; 