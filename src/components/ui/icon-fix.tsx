'use client';

import React, { forwardRef, useMemo } from 'react';
import { Icon as OriginalIcon, IconProps, IconName } from './icon';
import { SafeIcon } from './safe-icon';
import { UI_ICON_MAP, UI_OUTLINE_ICON_MAP } from './';
import { findIconDefinition, IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Direct import of problematic icons to ensure they're available
import {
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faArrowDown, faArrowUp, faArrowLeft, faArrowRight,
  faCopy, faCalendarDays
} from '@fortawesome/pro-solid-svg-icons';

import {
  faChevronDown as falChevronDown, 
  faChevronUp as falChevronUp, 
  faChevronLeft as falChevronLeft, 
  faChevronRight as falChevronRight,
  faArrowDown as falArrowDown, 
  faArrowUp as falArrowUp, 
  faArrowLeft as falArrowLeft, 
  faArrowRight as falArrowRight,
  faCopy as falCopy, 
  faCalendarDays as falCalendarDays
} from '@fortawesome/pro-light-svg-icons';

// Extend the UI_ICON_MAP with the missing icons
const patchIconMap = () => {
  if (typeof window === 'undefined') return;
  
  // Names that might be missing from UI_ICON_MAP
  const missingIconPairs = {
    chevronDown: faChevronDown,
    chevronUp: faChevronUp,
    chevronLeft: faChevronLeft,
    chevronRight: faChevronRight,
    arrowDown: faArrowDown,
    arrowUp: faArrowUp,
    arrowLeft: faArrowLeft,
    arrowRight: faArrowRight,
    copy: faCopy,
    calendarDays: faCalendarDays
  };
  
  // Light icon variants
  const missingLightIconPairs = {
    chevronDown: falChevronDown,
    chevronUp: falChevronUp,
    chevronLeft: falChevronLeft,
    chevronRight: falChevronRight,
    arrowDown: falArrowDown,
    arrowUp: falArrowUp,
    arrowLeft: falArrowLeft,
    arrowRight: falArrowRight,
    copy: falCopy,
    calendarDays: falCalendarDays
  };
  
  // Check and patch each icon in UI_ICON_MAP
  let patchCount = 0;
  Object.entries(missingIconPairs).forEach(([name, icon]) => {
    if (!UI_ICON_MAP[name as keyof typeof UI_ICON_MAP]) {
      (UI_ICON_MAP as any)[name] = icon;
      patchCount++;
    }
  });
  
  // Also patch the outline icons
  Object.entries(missingLightIconPairs).forEach(([name, icon]) => {
    if (!UI_OUTLINE_ICON_MAP[name as keyof typeof UI_OUTLINE_ICON_MAP]) {
      (UI_OUTLINE_ICON_MAP as any)[name] = icon;
      patchCount++;
    }
  });
  
  if (patchCount > 0) {
    console.log(`[IconFix] Patched ${patchCount} missing icons in icon maps`);
  }
};

export const EnhancedIcon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
  // Use useMemo to ensure we only patch once per component instance
  useMemo(() => {
    patchIconMap();
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