'use client';

import React, { memo, useEffect } from 'react';
import { getIconPath } from './icons';
import { IconProps, IconSize, IconVariant, SIZE_CLASSES } from './types';
import { useIconContext } from './IconContext';

// Debug flag for development
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Main Icon component that renders Font Awesome icons as SVGs
 * Uses the consolidated registry via getIconPath as Single Source of Truth
 */
export const Icon: React.FC<IconProps> = memo(({
  iconId = 'faQuestionLight',
  className = '',
  size = 'md',
  title,
  onClick,
  ...rest
}) => {
  // Get context values
  const context = useIconContext();
  
  // Determine if icon ID explicitly contains variant
  const hasSolidSuffix = iconId.endsWith('Solid');
  const hasLightSuffix = iconId.endsWith('Light');
  const variant: IconVariant = hasSolidSuffix ? 'solid' : hasLightSuffix ? 'light' : 'light';
  
  // Special handling for app icons (they don't have variants)
  const isAppIcon = iconId.startsWith('app');
  
  // Determine the path using the single source of truth
  const iconPath = getIconPath(iconId, variant);
  
  // Debug logging for development
  useEffect(() => {
    if (DEBUG) {
      console.log(`[Icon] Rendering icon: ${iconId}, path: ${iconPath}, isAppIcon: ${isAppIcon}`);
    }
  }, [iconId, iconPath, isAppIcon]);
  
  // Handle dynamic classes
  const sizeClass = SIZE_CLASSES[size] || 'w-5 h-5';
  const combinedClasses = `inline-block ${sizeClass} ${className || ''}`.trim();
  
  return (
    <span 
      className={combinedClasses}
      title={title}
      onClick={onClick}
      {...rest}
    >
      <img 
        src={iconPath}
        alt={title || `${iconId} icon`}
        className="w-full h-full"
        loading="lazy"
        onError={(e) => {
          if (DEBUG) {
            console.error(`[Icon] Failed to load icon: ${iconId}, path: ${iconPath}`);
            // Show broken image visually in dev mode
            (e.target as HTMLImageElement).style.border = '1px dashed red';
            (e.target as HTMLImageElement).style.padding = '2px';
          }
        }}
      />
    </span>
  );
});

Icon.displayName = 'Icon';

/**
 * Solid variant of the Icon component
 */
export const SolidIcon: React.FC<Omit<IconProps, 'variant'>> = ({
  iconId,
  ...otherProps
}) => {
  // Don't modify app icons since they don't have variants
  if (iconId?.startsWith('app')) {
    return <Icon iconId={iconId} {...otherProps} />;
  }
  
  // Convert to solid variant if needed
  const solidIconId = iconId?.endsWith('Solid') 
    ? iconId 
    : iconId?.endsWith('Light')
      ? iconId.replace(/Light$/, 'Solid')
      : `${iconId}Solid`;
      
  return <Icon iconId={solidIconId} {...otherProps} />;
};

/**
 * Light variant of the Icon component
 */
export const LightIcon: React.FC<Omit<IconProps, 'variant'>> = ({
  iconId,
  ...otherProps
}) => {
  // Don't modify app icons since they don't have variants
  if (iconId?.startsWith('app')) {
    return <Icon iconId={iconId} {...otherProps} />;
  }
  
  // Convert to light variant if needed
  const lightIconId = iconId?.endsWith('Light') 
    ? iconId 
    : iconId?.endsWith('Solid')
      ? iconId.replace(/Solid$/, 'Light')
      : `${iconId}Light`;
      
  return <Icon iconId={lightIconId} {...otherProps} />;
}; 