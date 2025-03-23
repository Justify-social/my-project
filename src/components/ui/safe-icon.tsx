'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition, findIconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';
import { faQuestion } from '@fortawesome/pro-solid-svg-icons';
import * as solidIcons from '@fortawesome/pro-solid-svg-icons';
import { cn } from '@/lib/utils';

// Map of camelCase names to kebab-case for FA
const iconNameMap: Record<string, string> = {
  search: 'magnifying-glass',
  close: 'xmark',
  settings: 'gear',
  mail: 'envelope',
  warning: 'triangle-exclamation',
  info: 'circle-info'
  // Add more mappings as needed
};

// Convert our internal icon name to FontAwesome format
function normalizeFaIconName(name: string): {
  prefix: IconPrefix;
  iconName: IconName;
} {
  // If name already contains a hyphen, assume it's already in FA format
  if (name.includes('-')) {
    return {
      prefix: 'fas' as IconPrefix,
      iconName: name as IconName
    };
  }

  // Convert camelCase to kebab-case
  const faName = iconNameMap[name] || name;
  const kebabCase = faName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return {
    prefix: 'fas' as IconPrefix,
    iconName: kebabCase as IconName
  };
}

// Try to find a solid icon that matches the given name
function getSolidIcon(name: string): IconDefinition | null {
  try {
    // Direct method via findIconDefinition
    const {
      prefix,
      iconName
    } = normalizeFaIconName(name);
    const definition = findIconDefinition({
      prefix,
      iconName
    });
    if (definition) return definition;

    // Try direct access to solidIcons
    // Transform kebab-case to camelCase for direct object lookup
    const camelCase = iconName.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const iconKey = `fa${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}`;

    // @ts-ignore - dynamic access
    if (solidIcons[iconKey]) return solidIcons[iconKey];
    return null;
  } catch (e) {
    console.error(`[SafeIcon] Error finding icon '${name}':`, e);
    return null;
  }
}
interface SafeIconProps {
  solid?: any;
  icon: any; // Can be string or IconDefinition
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x';
  style?: React.CSSProperties;
  color?: string;
  fixedWidth?: boolean;
  [key: string]: any;
}
export const SafeIcon = forwardRef<SVGSVGElement, SafeIconProps>(({
  icon,
  className,
  style,
  color,
  size,
  fixedWidth = false,
  ...props
}, ref) => {
  const [iconDefinition, setIconDefinition] = useState<IconDefinition | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    if (!icon) {
      setLoadFailed(true);
      return;
    }
    try {
      // Case 1: Icon is already an IconDefinition
      if (typeof icon === 'object' && icon.prefix && icon.iconName) {
        setIconDefinition(icon);
        setLoadFailed(false);
        return;
      }

      // Case 2: Icon is [prefix, iconName] array
      if (Array.isArray(icon) && icon.length === 2) {
        const definition = findIconDefinition({
          prefix: icon[0] as IconPrefix,
          iconName: icon[1] as IconName
        });
        if (definition) {
          setIconDefinition(definition);
          setLoadFailed(false);
          return;
        }
      }

      // Case 3: Icon is a string name
      if (typeof icon === 'string') {
        const solidIcon = getSolidIcon(icon);
        if (solidIcon) {
          setIconDefinition(solidIcon);
          setLoadFailed(false);
          return;
        }
      }

      // If we get here, we couldn't resolve the icon
      console.warn(`[SafeIcon] Failed to resolve icon:`, icon);
      setLoadFailed(true);
    } catch (e) {
      console.error(`[SafeIcon] Error processing icon:`, e, icon);
      setLoadFailed(true);
    }
  }, [icon]);

  // Render the fallback if no icon or loading failed
  if (loadFailed || !iconDefinition) {
    return <FontAwesomeIcon icon={faQuestion} className={cn("question-mark-icon-fallback", className)} style={{
      color: 'red',
      opacity: 0.7,
      ...style
    }} size={size} fixedWidth={fixedWidth} ref={ref} {...props} />;
  }

  // Render the actual icon
  return <FontAwesomeIcon icon={iconDefinition} className={className} style={{
    color: color,
    ...style
  }} size={size} fixedWidth={fixedWidth} ref={ref} {...props} />;
});
SafeIcon.displayName = 'SafeIcon';
export default SafeIcon;