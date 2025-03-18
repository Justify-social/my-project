import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Icon Component
 * 
 * Migration Status: Complete
 * 
 * This component has been fully migrated from HeroIcons/React-Icons to Font Awesome.
 * 
 * Usage Notes:
 * - Use FontAwesome icons through the 'name' prop
 * - The 'solid' prop controls whether to use solid or outline variant
 * - Platform-specific colors are automatically applied
 * 
 * @example
 * // Standard usage
 * <Icon name="user" />
 * <Icon name="check" solid />
 */

// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FA_UI_ICON_MAP, FA_UI_OUTLINE_ICON_MAP, FA_PLATFORM_ICON_MAP, PLATFORM_COLORS } from '@/lib/icon-mappings';

// Configure Font Awesome
config.autoAddCss = false; // Prevent Font Awesome from automatically injecting CSS

// Initialize Font Awesome library with all icons
library.add(...Object.values(FA_UI_ICON_MAP), ...Object.values(FA_UI_OUTLINE_ICON_MAP), ...Object.values(FA_PLATFORM_ICON_MAP));

// Re-export for convenience
export const UI_ICON_MAP = FA_UI_ICON_MAP;
export const UI_OUTLINE_ICON_MAP = FA_UI_OUTLINE_ICON_MAP;
export const PLATFORM_ICON_MAP = FA_PLATFORM_ICON_MAP;
export { PLATFORM_COLORS };

/**
 * @deprecated Use the Icon component with appropriate mappings instead
 */
export const KPI_ICON_URLS: Record<string, string> = {
  'views': '/icons/kpi/views.svg',
  'engagement': '/icons/kpi/engagement.svg',
  'reach': '/icons/kpi/reach.svg',
  'followers': '/icons/kpi/followers.svg',
  'impressions': '/icons/kpi/impressions.svg',
  'comments': '/icons/kpi/comments.svg',
  'likes': '/icons/kpi/likes.svg',
  'shares': '/icons/kpi/shares.svg',
  'bookmarks': '/icons/kpi/bookmarks.svg',
  'saves': '/icons/kpi/saves.svg',
  'linkClicks': '/icons/kpi/linkClicks.svg',
  'profileVisits': '/icons/kpi/profileVisits.svg',
  'videoViews': '/icons/kpi/videoViews.svg',
};

/**
 * @deprecated Use the Icon component with appropriate mappings instead
 */
export const APP_ICON_URLS: Record<string, string> = {
  'campaigns': '/icons/app/campaigns.svg',
  'influencers': '/icons/app/influencers.svg',
  'analytics': '/icons/app/analytics.svg',
  'content': '/icons/app/content.svg',
  'settings': '/icons/app/settings.svg',
  'help': '/icons/app/help.svg',
};

// Type definitions
export type IconName = keyof typeof UI_ICON_MAP;
export type KpiIconName = keyof typeof KPI_ICON_URLS;
export type AppIconName = keyof typeof APP_ICON_URLS;
export type PlatformIconName = keyof typeof PLATFORM_ICON_MAP;

// Interface for path-based icons
interface PathIconProps {
  /**
   * SVG path string
   */
  path?: string;

  /**
   * View box for the SVG
   * @default "0 0 24 24"
   */
  viewBox?: string;

  /**
   * Fill color
   * @default "none"
   */
  fill?: string;

  /**
   * Stroke color
   * @default "currentColor"
   */
  stroke?: string;

  /**
   * Stroke width
   * @default 2
   */
  strokeWidth?: number;
}

// Common props
interface BaseIconProps {
  /**
   * The name of the icon to display from predefined UI icons
   */
  name?: IconName;
  
  /**
   * The name of the KPI icon to display
   */
  kpiName?: KpiIconName;
  
  /**
   * The name of the app icon to display
   */
  appName?: AppIconName;
  
  /**
   * The name of a platform (social media) icon to display
   */
  platformName?: PlatformIconName;
  
  /**
   * Font Awesome icon class (fa-solid, fa-regular, fa-brands followed by the icon name)
   * For example: "fa-solid fa-user" or "fa-brands fa-twitter"
   */
  fontAwesome?: string;
  
  /**
   * The size of the icon
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to use solid fill instead of outline
   * @default false
   */
  solid?: boolean;
  
  /**
   * The color of the icon
   * @default "currentColor"
   */
  color?: string;

  /**
   * Whether this icon is in an active state
   * @default false
   */
  active?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

// Combine all props
export type IconProps = BaseIconProps & PathIconProps & React.SVGAttributes<SVGSVGElement>;

/**
 * Icon component that can render various types of icons:
 * - UI icons (from UI_ICON_MAP)
 * - KPI icons (from KPI_ICON_URLS)
 * - App icons (from APP_ICON_URLS)
 * - Platform icons (from PLATFORM_ICON_MAP)
 * - Font Awesome icons
 */
export const Icon: React.FC<IconProps> = ({
  name,
  kpiName,
  appName,
  platformName,
  fontAwesome,
  path,
  size = 'md',
  solid = false,
  color = 'currentColor',
  active = false,
  className,
  ...props
}) => {
  // Set the size based on the size prop
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  // Use specified icon through name prop - prioritize ui icons
  if (name) {
    // Use Font Awesome icons - FIXED: the solid/outline logic was inverted
    const faIcon = solid 
      ? UI_ICON_MAP[name as keyof typeof UI_ICON_MAP]
      : UI_OUTLINE_ICON_MAP[name as keyof typeof UI_OUTLINE_ICON_MAP];
      
    if (faIcon) {
      return (
        <FontAwesomeIcon
          icon={faIcon}
          className={cn(sizeClasses[size], className)}
          color={color}
          {...props as any}
        />
      );
    }
    
    // If no matching Font Awesome icon, display a warning icon
    console.warn(`[Icon] No Font Awesome icon found for name "${name}"`);
    return (
      <FontAwesomeIcon
        icon={UI_ICON_MAP.warning}
        className={cn(sizeClasses[size], className)}
        color="red"
        {...props as any}
      />
    );
  }

  // Use KPI icon through kpiName prop
  if (kpiName && KPI_ICON_URLS[kpiName]) {
    // Extract SVG props to avoid passing them to the img element
    const { children, dangerouslySetInnerHTML, ...imgProps } = props;
    
    // Using both the URL-based approach and CSS classes for maximum compatibility
    return (
      <span 
        className={cn(`kpi-icon kpi-${kpiName.toLowerCase().replace(/([A-Z])/g, "-$1").toLowerCase()}`, sizeClasses[size], className)}
        style={{ color }}
        {...imgProps as React.HTMLAttributes<HTMLSpanElement>}
      >
        <img 
          src={KPI_ICON_URLS[kpiName]} 
          alt={kpiName}
          className="w-full h-full"
        />
      </span>
    );
  }

  // Use app icon through appName prop
  if (appName && APP_ICON_URLS[appName]) {
    // Extract SVG props to avoid passing them to the img element
    const { children, dangerouslySetInnerHTML, ...imgProps } = props;
    
    // Using both the URL-based approach and CSS classes for maximum compatibility
    return (
      <span 
        className={cn(`app-icon icon-${appName.toLowerCase()}`, active && 'app-icon-active', sizeClasses[size], className)}
        style={{ color }}
        {...imgProps as React.HTMLAttributes<HTMLSpanElement>}
      >
        <img 
          src={APP_ICON_URLS[appName]} 
          alt={appName}
          className="w-full h-full"
        />
      </span>
    );
  }

  // Use platform icon through platformName prop
  if (platformName) {
    // Use Font Awesome implementation
    const faPlatformIcon = PLATFORM_ICON_MAP[platformName as keyof typeof PLATFORM_ICON_MAP];
    
    if (faPlatformIcon) {
      const platformColor = solid ? PLATFORM_COLORS[platformName as keyof typeof PLATFORM_COLORS] : 'currentColor';
      
      return (
        <FontAwesomeIcon
          icon={faPlatformIcon}
          className={cn(sizeClasses[size], className)}
          color={platformColor}
          {...props as any}
        />
      );
    }
    
    // If no matching Font Awesome icon, display a warning icon
    console.warn(`[Icon] No Font Awesome icon found for platform "${platformName}"`);
    return (
      <FontAwesomeIcon
        icon={UI_ICON_MAP.warning}
        className={cn(sizeClasses[size], className)}
        color="red"
        {...props as any}
      />
    );
  }
  
  // Use Font Awesome icon
  if (fontAwesome) {
    // Extract icon name and prefix from the string
    const parts = fontAwesome.split(' ');
    let prefix: string;
    let iconName: string;
    
    if (parts.length === 2) {
      // Format like "fa-solid fa-user"
      prefix = parts[0].replace('fa-', '');
      iconName = parts[1].replace('fa-', '');
    } else {
      // Default to solid and assume single part is the icon name
      prefix = 'solid';
      iconName = parts[0].replace('fa-', '');
    }
    
    return (
      <FontAwesomeIcon
        icon={[prefix as any, iconName]}
        className={cn(sizeClasses[size], className)}
        color={color}
        {...props as any}
      />
    );
  }

  // If a custom path is provided, render a custom SVG
  if (path) {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        <path d={path} />
      </svg>
    );
  }

  // Fallback to empty SVG if no icon type is specified
  return (
    <svg 
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    />
  );
};

export default Icon; 