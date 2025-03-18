import React from 'react';
import { cn } from '@/lib/utils';
import { heroIconToName } from '@/lib/icon-helpers';

/**
 * Icon Component
 * 
 * Migration Status: In Progress
 * 
 * This component is in the process of migrating from HeroIcons/React-Icons to Font Awesome.
 * It currently supports both implementations, prioritizing Font Awesome and falling back to
 * the legacy React-Icons implementation when needed.
 * 
 * Migration Notes:
 * - Use FontAwesome icons through the 'name' prop first
 * - The 'solid' prop controls whether to use solid or outline variant
 * - HeroIcon props are still supported but deprecated and will log warnings
 * - Platform-specific colors are now properly supported
 * 
 * @example
 * // Preferred usage
 * <Icon name="user" />
 * <Icon name="check" solid />
 * 
 * // Legacy usage (deprecated)
 * <Icon heroSolid="UserIcon" />
 */

// TODO: MIGRATION PHASE 3 - Remove these imports once all components have been migrated
// React Icons imports (for backward compatibility)
// These will be removed in the final phase of migration
import * as Fa from 'react-icons/fa6'; // Font Awesome 6 icons
import * as Hi from 'react-icons/hi2'; // Heroicons v2 
import * as Ci from 'react-icons/ci'; // Circle icons for outlines
import * as Bs from 'react-icons/bs'; // Bootstrap icons
import * as Md from 'react-icons/md'; // Material Design icons
import * as Si from 'react-icons/si'; // Simple Icons (for brands/platforms)
import * as Bi from 'react-icons/bi'; // Boxicons
import * as Ai from 'react-icons/ai'; // Ant Design Icons

// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FA_UI_ICON_MAP, FA_UI_OUTLINE_ICON_MAP, FA_PLATFORM_ICON_MAP, PLATFORM_COLORS } from '@/lib/icon-mappings';

// Re-export for backward compatibility
// Note: These are the FontAwesome icon definitions now, not React components
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

// For backward compatibility with HeroIcons
/**
 * @deprecated Use the name prop with the solid attribute instead
 * @example 
 * // Before
 * <Icon heroSolid="UserIcon" />
 * // After
 * <Icon name="user" solid />
 */
export type HeroiconSolidName = keyof typeof Hi;

/**
 * @deprecated Use the name prop without the solid attribute instead
 * @example
 * // Before
 * <Icon heroOutline="UserIcon" />
 * // After
 * <Icon name="user" />
 */
export type HeroiconOutlineName = keyof typeof Hi;

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
  path: string;

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
   * The name of a Heroicon solid variant to use (for backward compatibility)
   * @deprecated Use name prop with solid attribute instead
   */
  heroSolid?: HeroiconSolidName;
  
  /**
   * The name of a Heroicon outline variant to use (for backward compatibility)
   * @deprecated Use name prop without solid attribute instead
   */
  heroOutline?: HeroiconOutlineName;
  
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

type IconProps = BaseIconProps & Omit<React.SVGProps<SVGSVGElement>, keyof BaseIconProps | keyof PathIconProps> & Partial<PathIconProps>;

/**
 * Icon component that can render various types of icons:
 * - UI icons (from UI_ICON_MAP)
 * - KPI icons (from KPI_ICON_URLS)
 * - App icons (from APP_ICON_URLS)
 * - Platform icons (from PLATFORM_ICON_MAP)
 * - Heroicons (both solid and outline variants)
 * - Custom SVG paths
 * - Font Awesome icons
 */
export const Icon: React.FC<IconProps> = ({
  name,
  kpiName,
  appName,
  platformName,
  heroSolid,
  heroOutline,
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
    // First try Font Awesome icons (new implementation)
    const faIcon = solid 
      ? FA_UI_OUTLINE_ICON_MAP[name as keyof typeof FA_UI_OUTLINE_ICON_MAP]
      : FA_UI_ICON_MAP[name as keyof typeof FA_UI_ICON_MAP];
      
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
        icon={FA_UI_ICON_MAP.warning}
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
    
    return (
      <img 
        src={KPI_ICON_URLS[kpiName]} 
        className={cn(sizeClasses[size], className)}
        alt={kpiName}
        {...imgProps as React.ImgHTMLAttributes<HTMLImageElement>}
      />
    );
  }

  // Use app icon through appName prop
  if (appName && APP_ICON_URLS[appName]) {
    // Extract SVG props to avoid passing them to the img element
    const { children, dangerouslySetInnerHTML, ...imgProps } = props;
    
    return (
      <img 
        src={APP_ICON_URLS[appName]} 
        className={cn(
          sizeClasses[size], 
          className,
          active && 'active-icon'
        )}
        alt={appName}
        {...imgProps as React.ImgHTMLAttributes<HTMLImageElement>}
      />
    );
  }

  // Use platform icon through platformName prop
  if (platformName) {
    // First try Font Awesome implementation (new)
    const faPlatformIcon = FA_PLATFORM_ICON_MAP[platformName as keyof typeof FA_PLATFORM_ICON_MAP];
    
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
        icon={FA_UI_ICON_MAP.warning}
        className={cn(sizeClasses[size], className)}
        color="red"
        {...props as any}
      />
    );
  }

  // Use heroicon solid
  if (heroSolid && typeof Hi[heroSolid] !== 'undefined') {
    // Log deprecation warning and suggest alternative
    console.warn(
      `[Icon] DEPRECATED: Hero Icon "${heroSolid}" is deprecated. ` +
      `Use <Icon name="${heroIconToName(heroSolid) || 'equivalent'}" solid /> instead.`
    );
    
    const HeroSolidIcon = Hi[heroSolid];
    return (
      <HeroSolidIcon 
        className={cn(sizeClasses[size], className)}
        color={color}
        {...props}
      />
    );
  }

  // Use heroicon outline
  if (heroOutline && typeof Hi[heroOutline] !== 'undefined') {
    // Log deprecation warning and suggest alternative
    console.warn(
      `[Icon] DEPRECATED: Hero Icon "${heroOutline}" is deprecated. ` +
      `Use <Icon name="${heroIconToName(heroOutline) || 'equivalent'}" /> instead.`
    );
    
    const HeroOutlineIcon = Hi[heroOutline];
    return (
      <HeroOutlineIcon 
        className={cn(sizeClasses[size], className)}
        color={color}
        {...props}
      />
    );
  }
  
  // Use Font Awesome icon
  if (fontAwesome) {
    // Extract SVG props to avoid passing them to the i element
    const { children, dangerouslySetInnerHTML, viewBox, fill, stroke, ...iProps } = props;
    
    return (
      <i 
        className={cn(fontAwesome, className, {
          'fa-xs': size === 'xs',
          'fa-sm': size === 'sm',
          'fa-lg': size === 'lg',
          'fa-xl': size === 'xl',
          // No class needed for 'md' as it's the default
        })}
        style={{ color }}
        {...iProps as React.HTMLAttributes<HTMLElement>}
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