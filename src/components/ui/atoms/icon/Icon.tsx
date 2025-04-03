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
  iconId,
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
  
  let iconName = name;
  let actualVariant: IconVariant = variant;
  
  // Handle iconId if provided (preferred approach)
  if (iconId) {
    // Check if the icon name explicitly ends with "Solid" or "Light"
    const hasSolidSuffix = iconId.endsWith('Solid');
    const hasLightSuffix = iconId.endsWith('Light');
    
    // Extract the base name without suffix for icon lookup
    iconName = hasSolidSuffix ? iconId.replace(/Solid$/, '') : 
              hasLightSuffix ? iconId.replace(/Light$/, '') : 
              iconId;
              
    // Set variant based on suffix
    actualVariant = hasSolidSuffix ? 'solid' : 
                   hasLightSuffix ? 'light' : 
                   variant;
  } else if (name) {
    // Legacy approach - check if the icon name explicitly ends with "Solid"
    const hasSolidSuffix = name.endsWith('Solid');
    
    // Determine variant - prioritize explicit name suffix over props
    actualVariant = hasSolidSuffix ? 'solid' : 
                   active ? 'solid' : 
                   variant;
  } else {
    // Neither name nor iconId provided
    console.warn('Icon component used without name or iconId prop');
    iconName = 'faQuestion'; // Default fallback icon
  }
  
  // Determine the path using the single source of truth
  const iconPath = getIconPath(iconName as string, actualVariant as any);
  
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
        alt={title || `${iconName || iconId} icon`}
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
  // Destructure props
  name,
  iconId,
  ...otherProps
}) => {
  // Support both iconId and name
  return iconId 
    ? <Icon iconId={iconId} {...otherProps} variant="solid" />
    : <Icon name={name} {...otherProps} variant="solid" />;
};

/**
 * Light variant of the Icon component
 */
export const LightIcon: React.FC<Omit<IconProps, 'variant'>> = ({
  // Destructure props
  name,
  iconId,
  ...otherProps
}) => {
  // Support both iconId and name
  return iconId 
    ? <Icon iconId={iconId} {...otherProps} variant="light" />
    : <Icon name={name} {...otherProps} variant="light" />;
}; 