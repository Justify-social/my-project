'use client';

import React, { forwardRef } from 'react';
import { Icon as OriginalIcon, IconProps, IconName } from './icon';
import { SafeIcon } from './safe-icon';
import { UI_ICON_MAP, UI_OUTLINE_ICON_MAP } from './';
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core';

// Log icons missing from UI_ICON_MAP
const fixIconMappingIssues = () => {
  if (typeof window === 'undefined') return;
  
  // Names that might be missing from UI_ICON_MAP
  const potentiallyMissingNames = [
    'chevronDown', 'chevronUp', 'chevronLeft', 'chevronRight',
    'arrowDown', 'arrowUp', 'arrowLeft', 'arrowRight',
    'copy', 'calendarDays'
  ];
  
  // Check each icon
  const missingIcons: string[] = [];
  
  potentiallyMissingNames.forEach(name => {
    // Use type assertion to avoid TypeScript error
    if (!UI_ICON_MAP[name as keyof typeof UI_ICON_MAP]) {
      missingIcons.push(name);
      console.warn(`[IconFix] Missing icon '${name}' in UI_ICON_MAP`);
    }
  });
  
  if (missingIcons.length > 0) {
    console.error(`[IconFix] Found ${missingIcons.length} missing icons in UI_ICON_MAP: ${missingIcons.join(', ')}`);
  }
};

export const EnhancedIcon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
  // Initialize check for problematic icons on client side
  React.useEffect(() => {
    fixIconMappingIssues();
  }, []);
  
  const { name, solid, ...rest } = props;
  
  // If we have a name but no other special props, use our SafeIcon for better fallbacks
  if (name && !props.kpiName && !props.appName && !props.platformName) {
    try {
      let iconData;
      
      // Get the icon from the appropriate map
      if (solid) {
        iconData = UI_ICON_MAP[name as keyof typeof UI_ICON_MAP];
      } else {
        iconData = UI_OUTLINE_ICON_MAP[name as keyof typeof UI_OUTLINE_ICON_MAP];
      }
      
      // If we have icon data and it has a valid definition
      if (iconData && iconData.iconName) {
        const definition = findIconDefinition({ 
          prefix: iconData.prefix, 
          iconName: iconData.iconName 
        });
        
        if (definition) {
          // Icon looks good, use the original component
          return <OriginalIcon name={name} solid={solid} {...rest} ref={ref} />;
        }
      }
      
      // If we get here, the icon might be problematic - use SafeIcon
      return (
        <span ref={ref} className={rest.className}>
          <SafeIcon 
            icon={name}
            color={rest.color}
            size={rest.size === 'xs' ? 'xs' : rest.size === 'sm' ? 'sm' : 
                  rest.size === 'lg' ? 'lg' : rest.size === 'xl' ? '2x' : '1x'}
          />
        </span>
      );
    } catch (e) {
      console.error('[EnhancedIcon] Error loading icon:', e);
    }
  }
  
  // For other icon types (kpi, app, platform), use the original component
  return <OriginalIcon name={name} solid={solid} {...rest} ref={ref} />;
});

EnhancedIcon.displayName = 'EnhancedIcon';

// Replace standard Icon export with our enhanced version
export const Icon = EnhancedIcon; 