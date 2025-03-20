import '@awesome.me/kit-3e2951e127';
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
import { library, config, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FA_UI_ICON_MAP, FA_UI_OUTLINE_ICON_MAP, FA_PLATFORM_ICON_MAP, PLATFORM_COLORS, getIcon } from '@/lib/icon-mappings';
import { SafeQuestionMarkIcon } from '@/lib/icon-helpers';

// Import Font Awesome styles
import '@fortawesome/fontawesome-svg-core/styles.css';

// Configure Font Awesome
config.autoAddCss = false; // Prevent Font Awesome from automatically injecting CSS

// Initialize with a few essential icons for fallbacks
import { faUser, faQuestion } from '@fortawesome/pro-solid-svg-icons';
library.add(faUser, faQuestion);

// No need to initialize library - the Pro Kit already includes all icons
// library.add(...Object.values(FA_UI_ICON_MAP), ...Object.values(FA_UI_OUTLINE_ICON_MAP), ...Object.values(FA_PLATFORM_ICON_MAP));

// Re-export for convenience
export const UI_ICON_MAP = FA_UI_ICON_MAP;
export const UI_OUTLINE_ICON_MAP = FA_UI_OUTLINE_ICON_MAP;
export const PLATFORM_ICON_MAP = FA_PLATFORM_ICON_MAP;
export { PLATFORM_COLORS };

/**
 * @deprecated Use the Icon component with appropriate mappings instead
 */
export const KPI_ICON_URLS: Record<string, string> = {
  // New KPI icons - keeping only the correct ones
  'actionIntent': '/kpis/Action_Intent.svg',
  'adRecall': '/kpis/Ad_Recall.svg',
  'advocacy': '/kpis/Advocacy.svg',
  'brandAwareness': '/kpis/Brand_Awareness.svg',
  'brandPreference': '/kpis/Brand_Preference.svg',
  'consideration': '/kpis/Consideration.svg',
  'messageAssociation': '/kpis/Message_Association.svg',
  'purchaseIntent': '/kpis/Purchase_Intent.svg',
};

/**
 * @deprecated Use the Icon component with appropriate mappings instead
 */
export const APP_ICON_URLS: Record<string, string> = {
  'campaigns': '/app/Campaigns.svg',
  'influencers': '/app/Influencers.svg',
  'settings': '/app/Settings.svg',
  'help': '/app/Help.svg',
  // New app icons
  'reports': '/app/Reports.svg',
  'profile': '/app/profile-image.svg',
  'mmm': '/app/MMM.svg',
  'search': '/app/magnifying-glass.svg',
  'home': '/app/Home.svg',
  'creativeTesting': '/app/Creative_Asset_Testing.svg',
  'brandLift': '/app/Brand_Lift.svg',
  'brandHealth': '/app/Brand_Health.svg',
  'billing': '/app/Billing.svg',
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
 * Renders a safe fallback question mark icon when other icon methods fail
 */
const FallbackIcon: React.FC<Pick<IconProps, 'className' | 'color' | 'size' | 'stroke'>> = ({ 
  className, color = 'red', size = 'md', ...props 
}) => {
  // Set the size based on the size prop
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };
  
  return (
    <SafeQuestionMarkIcon 
      className={cn(sizeClasses[size], className)}
      style={{ color }}
      {...props}
    />
  );
};

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

  // If all icon props are undefined, return the fallback icon
  if (!name && !kpiName && !appName && !platformName && !fontAwesome && !path) {
    console.warn('[Icon] No icon specified (name, kpiName, appName, platformName, fontAwesome, or path)');
    return <FallbackIcon size={size} className={className} color="red" {...props} />;
  }

  // Use specified icon through name prop - prioritize ui icons
  if (name) {
    try {
      // Use Font Awesome icons - FIXED: the solid/outline logic was inverted
      let faIcon = solid 
        ? UI_ICON_MAP[name as keyof typeof UI_ICON_MAP]
        : UI_OUTLINE_ICON_MAP[name as keyof typeof UI_OUTLINE_ICON_MAP];
      
      // If there's no match in the map, try with getIcon for dynamic generation
      if (!faIcon) {
        const style = solid ? 'fas' : 'fal';
        const iconName = String(name).toLowerCase().replace(/([A-Z])/g, "-$1").toLowerCase();
        faIcon = getIcon(iconName, style);
      }
        
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
      
      // If no matching Font Awesome icon, use the direct fallback
      console.warn(`[Icon] No Font Awesome icon found for name "${name}"`);
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    } catch (e) {
      console.error(`[Icon] Error rendering icon with name "${name}":`, e);
      // Return the direct fallback icon
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    }
  }

  // Use KPI icon through kpiName prop
  if (kpiName && KPI_ICON_URLS[kpiName]) {
    try {
      // Extract SVG props to avoid passing them to the img element
      const { children, dangerouslySetInnerHTML, ...imgProps } = props;
      
      // Using both the URL-based approach and CSS classes for maximum compatibility
      return (
        <span 
          className={cn(`kpi-icon kpi-${String(kpiName).toLowerCase().replace(/([A-Z])/g, "-$1").toLowerCase()}`, sizeClasses[size], className)}
          style={{ color }}
          {...imgProps as React.HTMLAttributes<HTMLSpanElement>}
        >
          <img 
            src={KPI_ICON_URLS[kpiName]} 
            alt={String(kpiName)}
            className="w-full h-full"
          />
        </span>
      );
    } catch (e) {
      console.error(`[Icon] Error rendering KPI icon "${kpiName}":`, e);
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    }
  }

  // Use app icon through appName prop
  if (appName && APP_ICON_URLS[appName]) {
    try {
      // Extract SVG props to avoid passing them to the img element
      const { children, dangerouslySetInnerHTML, ...imgProps } = props;
      
      // Using both the URL-based approach and CSS classes for maximum compatibility
      return (
        <span 
          className={cn(`app-icon icon-${String(appName).toLowerCase()}`, active && 'app-icon-active', sizeClasses[size], className)}
          style={{ color }}
          {...imgProps as React.HTMLAttributes<HTMLSpanElement>}
        >
          <img 
            src={APP_ICON_URLS[appName]} 
            alt={String(appName)}
            className="w-full h-full"
          />
        </span>
      );
    } catch (e) {
      console.error(`[Icon] Error rendering app icon "${appName}":`, e);
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    }
  }

  // Use platform icon through platformName prop
  if (platformName) {
    try {
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
      
      // If no matching Font Awesome icon, try with getIcon for dynamic generation
      try {
        const brandIcon = getIcon(String(platformName), 'fab');
        return (
          <FontAwesomeIcon
            icon={brandIcon}
            className={cn(sizeClasses[size], className)}
            color={color}
            {...props as any}
          />
        );
      } catch (innerError) {
        console.error(`[Icon] Error getting brand icon for "${platformName}":`, innerError);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
      }
    } catch (e) {
      console.error(`[Icon] Error rendering platform icon "${platformName}":`, e);
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    }
  }
  
  // Use Font Awesome icon
  if (fontAwesome) {
    try {
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
      
      // Try to use getIcon for safer icon retrieval
      try {
        const faIcon = getIcon(iconName, prefix as any);
        return (
          <FontAwesomeIcon
            icon={faIcon}
            className={cn(sizeClasses[size], className)}
            color={color}
            {...props as any}
          />
        );
      } catch (innerError) {
        console.error(`[Icon] Error getting icon for "${fontAwesome}":`, innerError);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
      }
    } catch (e) {
      console.error(`[Icon] Error rendering Font Awesome icon "${fontAwesome}":`, e);
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    }
  }

  // If a custom path is provided, render a custom SVG
  if (path) {
    try {
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox={props.viewBox || "0 0 24 24"}
          fill={props.fill || "none"}
          stroke={color} 
          strokeWidth={props.strokeWidth || "2"}
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={cn(sizeClasses[size], className)}
          {...props}
        >
          <path d={path} />
        </svg>
      );
    } catch (e) {
      console.error(`[Icon] Error rendering path icon:`, e);
      return <FallbackIcon size={size} className={className} color="red" {...props} />;
    }
  }

  // Final fallback for any other edge cases
  return <FallbackIcon size={size} className={className} color="red" {...props} />;
};

export default Icon; 