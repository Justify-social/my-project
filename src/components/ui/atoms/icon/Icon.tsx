'use client';

import React, { memo, useContext } from 'react';
import { getIconPath } from './icons';
import { IconProps, IconSize, IconVariant, SIZE_CLASSES } from './types';
import { useIconContext } from './IconContext';

/**
 * Main Icon component that renders Font Awesome icons as SVGs
 * Uses the consolidated registry via getIconPath as Single Source of Truth
 */
export const Icon: React.FC<IconProps> = memo(({
  name,
  className = '',
  size = 'md',
  variant = 'light',
  title,
  active = false,
  color,
  onClick,
  ...rest
}) => {
  // Get context values
  const context = useIconContext();
  
  // Check if the icon name explicitly ends with "Solid" and override variant
  const hasSolidSuffix = name.endsWith('Solid');
  
  // Determine variant - prioritize explicit name suffix over props
  const actualVariant: IconVariant = hasSolidSuffix ? 'solid' : 
                                     active ? 'solid' : 
                                     variant;
  
  // Determine the path using the single source of truth
  const iconPath = getIconPath(name, actualVariant as any);
  
  // Handle dynamic classes
  const sizeClass = SIZE_CLASSES[size] || 'w-5 h-5';
  const colorClass = color || '';
  const combinedClasses = `inline-block ${sizeClass} ${colorClass} ${className || ''}`.trim();
  
  return (
    <span 
      className={combinedClasses}
      title={title}
      onClick={onClick}
      {...rest}
    >
      <img 
        src={iconPath}
        alt={title || `${name} icon`}
        className="w-full h-full"
        loading="lazy"
      />
    </span>
  );
});

Icon.displayName = 'Icon';

/**
 * Solid variant of the Icon component
 */
export const SolidIcon: React.FC<Omit<IconProps, 'variant'>> = ({
  // Destructure props including name (which is required)
  name,
  ...otherProps
}) => {
  // Make sure to pass the name prop
  return <Icon name={name} {...otherProps} variant="solid" />;
};

/**
 * Light variant of the Icon component
 */
export const LightIcon: React.FC<Omit<IconProps, 'variant'>> = ({
  // Destructure props including name (which is required)
  name,
  ...otherProps
}) => {
  // Make sure to pass the name prop
  return <Icon name={name} {...otherProps} variant="light" />;
}; 