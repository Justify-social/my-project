import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { iconConfig, shouldUseHoverEffect, getActionColor } from './IconConfig';

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
 * - Uses light icons by default, with hover to solid effect
 * 
 * @example
 * // Standard usage
 * <Icon name="user" />
 * <Icon name="check" solid />
 */

// Font Awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library, config, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FA_UI_ICON_MAP, FA_UI_OUTLINE_ICON_MAP, FA_PLATFORM_ICON_MAP, PLATFORM_COLORS, getIcon, ICON_ALIASES } from './IconMapping';
import { SafeQuestionMarkIcon } from './IconUtils';

// Import Font Awesome styles
import '@fortawesome/fontawesome-svg-core/styles.css';

// Configure Font Awesome
config.autoAddCss = false; // Prevent Font Awesome from automatically injecting CSS

// Initialize with essential icons
import { 
  faUser, faQuestion, faCheck, faStar, faHeart, 
  faBell, faGear, faSearch, faPlus, faMinus, faXmark,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faEnvelope, faCalendarDays, faTrash, faTriangleExclamation,
  faCircleInfo, faLightbulb, faEye, faPenToSquare, faCopy,
  faDownload, faUpload, faShare, faBookmark, faFile,
  faFileLines, faTag, faFilter, faPaperclip, faLock, faUnlock, faKey,
  faHistory, faArrowUp, faArrowDown, faArrowLeft, faArrowRight,
  faCircleCheck, faCommentDots, faTrashCan, faHome, faHouse,
  faChartBar, faChartPie, faMoneyBill, faArrowTrendUp, 
  faArrowTrendDown, faBolt, faGlobe, faUserGroup, faBuilding,
  faRocket, faSignal, faBellSlash, faMap, faShield, faClock,
  faCircleXmark, faMagnifyingGlassPlus, faPalette, faCreditCard,
  faClockRotateLeft, faChartLine, faTable, faTableCells, faPlay,
  faBars, faList, faCamera, faChartColumn, faUserCircle
} from '@fortawesome/pro-solid-svg-icons';

import {
  faUser as falUser, faCheck as falCheck, faStar as falStar,
  faHeart as falHeart, faBell as falBell, faGear as falGear,
  faSearch as falSearch, faPlus as falPlus, faMinus as falMinus, 
  faXmark as falXmark, faChevronDown as falChevronDown,
  faChevronUp as falChevronUp, faChevronLeft as falChevronLeft,
  faChevronRight as falChevronRight, faEnvelope as falEnvelope,
  faCalendarDays as falCalendarDays, faTrash as falTrash,
  faCircleCheck as falCircleCheck, faCommentDots as falCommentDots,
  faEye as falEye, faPenToSquare as falPenToSquare, faCopy as falCopy,
  faDownload as falDownload, faUpload as falUpload, faShare as falShare,
  faBookmark as falBookmark, faFile as falFile, faFileLines as falFileLines,
  faTag as falTag, faFilter as falFilter, faPaperclip as falPaperclip, 
  faLock as falLock, faUnlock as falUnlock, faKey as falKey, 
  faHome as falHome, faHouse as falHouse,
  faChartBar as falChartBar, faChartPie as falChartPie, 
  faMoneyBill as falMoneyBill, faArrowTrendUp as falArrowTrendUp,
  faArrowTrendDown as falArrowTrendDown, faBolt as falBolt,
  faGlobe as falGlobe, faUserGroup as falUserGroup, 
  faBuilding as falBuilding, faRocket as falRocket,
  faSignal as falSignal, faBellSlash as falBellSlash,
  faMap as falMap, faShield as falShield, faClock as falClock,
  faArrowDown as falArrowDown, faArrowUp as falArrowUp,
  faArrowRight as falArrowRight, faArrowLeft as falArrowLeft,
  faCircleXmark as falCircleXmark, faMagnifyingGlassPlus as falMagnifyingGlassPlus,
  faPalette as falPalette, faCreditCard as falCreditCard,
  faClockRotateLeft as falClockRotateLeft, faChartLine as falChartLine,
  faTable as falTable, faTableCells as falTableCells, 
  faQuestion as falQuestion, faPlay as falPlay,
  faList as falList, faBars as falBars, faLightbulb as falLightbulb,
  faCamera as falCamera, faChartColumn as falChartColumn, faUserCircle as falUserCircle
} from '@fortawesome/pro-light-svg-icons';

import {
  faTwitter, faXTwitter, faFacebook, faInstagram, faYoutube,
  faLinkedin, faTiktok, faReddit, faPinterest, faGithub
} from '@fortawesome/free-brands-svg-icons';

import {
  faUser as farUser, faCheck as farCheck, faStar as farStar,
  faHeart as farHeart, faBell as farBell
} from '@fortawesome/pro-regular-svg-icons';

// Define aliases for all icon variants
// Solid icon aliases
const faClose = faXmark;
const faMail = faEnvelope;
const faWarning = faTriangleExclamation;
const faInfo = faCircleInfo;
const faView = faEye;
const faEdit = faPenToSquare;
const faDocument = faFile;
const faDocumentText = faFileLines;
const faChatBubble = faCommentDots;
const faDelete = faTrashCan;
const faTrendUp = faArrowTrendUp;
const faTrendDown = faArrowTrendDown;
const faLightning = faBolt;
const faBellAlert = faBellSlash;
const faXCircle = faCircleXmark;
const faCheckCircle = faCircleCheck;
const faSwatch = faPalette;
const faPresentationChartBar = faChartLine;
const faGrid = faTableCells;
const faMenu = faBars;
const faSettings = faGear;
const faLightBulb = faLightbulb;
const faCalendar = faCalendarDays;
const faChart = faChartBar;
const faMoney = faMoneyBill;
const faMagnifyingGlass = faSearch;
const faXMark = faClose;

// Light icon aliases
const falClose = falXmark;
const falMail = falEnvelope;
const falView = falEye;
const falEdit = falPenToSquare;
const falDocument = falFile;
const falDocumentText = falFileLines;
const falChatBubble = falCommentDots;
const falTrendUp = falArrowTrendUp;
const falTrendDown = falArrowTrendDown;
const falLightning = falBolt;
const falBellAlert = falBellSlash;
const falXCircle = falCircleXmark;
const falCheckCircle = falCircleCheck;
const falSwatch = falPalette;
const falPresentationChartBar = falChartLine;
const falGrid = falTableCells;
const falMenu = falBars;
const falSettings = falGear;
const falLightBulb = falLightbulb;
const falCalendar = falCalendarDays;
const falChart = falChartBar;
const falMoney = falMoneyBill;
const falMagnifyingGlass = falSearch;
const falXMark = falClose;

// Register all icons with library to ensure they're available throughout the app
library.add(
  // Solid (fas) icons - listed alphabetically for easier management
  faArrowDown, faArrowLeft, faArrowRight, faArrowUp, 
  faArrowTrendDown, faArrowTrendUp, faBars, faBell, faBellSlash, faBolt, 
  faBookmark, faBuilding, faCamera, faCalendarDays, faChartBar, faChartColumn,
  faChartLine, faChartPie, faCheck, faChevronDown, faChevronLeft, 
  faChevronRight, faChevronUp, faCircleCheck, faCircleInfo, faCircleXmark,
  faClock, faClockRotateLeft, faCommentDots, faCopy, faCreditCard,
  faDownload, faEye, faFile, faFileLines, faFilter, faGear, faGlobe,
  faHeart, faHistory, faHome, faHouse, faKey, faLightbulb, faList,
  faLock, faMagnifyingGlassPlus, faMap, faMinus, faMoneyBill, faPalette,
  faPaperclip, faPenToSquare, faPlay, faPlus, faQuestion, faRocket,
  faSearch, faShare, faShield, faSignal, faStar, faTable, faTableCells,
  faTag, faTrash, faTrashCan, faUnlock, faUpload, faUser, faUserCircle,
  faUserGroup, faXmark,

  // Light (fal) icons - listed alphabetically for easier management
  falArrowDown, falArrowLeft, falArrowRight, falArrowUp,
  falArrowTrendDown, falArrowTrendUp, falBars, falBell, falBellSlash, 
  falBolt, falBookmark, falBuilding, falCalendarDays, falCamera, falChartBar, 
  falChartColumn, falChartLine, falChartPie, falCheck, falChevronDown, 
  falChevronLeft, falChevronRight, falChevronUp, falCircleCheck, 
  falCircleXmark, falClock, falClockRotateLeft, falCommentDots, 
  falCopy, falCreditCard, falDownload, falEye, falFile, falFileLines,
  falFilter, falGear, falGlobe, falHeart, falHome, falHouse, falKey,
  falLightbulb, falList, falLock, falMagnifyingGlassPlus, falMap,
  falMinus, falMoneyBill, falPalette, falPaperclip, falPenToSquare,
  falPlay, falPlus, falQuestion, falRocket, falSearch, falShare, falShield,
  falSignal, falStar, falTable, falTableCells, falTag, falTrash,
  falUnlock, falUpload, falUser, falUserCircle, falUserGroup, falXmark,

  // Regular icons
  farUser, farCheck, farStar, farHeart, farBell,
  
  // Brand icons
  faTwitter, faXTwitter, faFacebook, faInstagram, faYoutube,
  faLinkedin, faTiktok, faReddit, faPinterest, faGithub
);

// Re-export for convenience
export const UI_ICON_MAP = FA_UI_ICON_MAP;
export const UI_OUTLINE_ICON_MAP = FA_UI_OUTLINE_ICON_MAP;
export const PLATFORM_ICON_MAP = FA_PLATFORM_ICON_MAP;
export { PLATFORM_COLORS, ICON_ALIASES };

/**
 * @deprecated Use the Icon component with appropriate mappings instead
 */
export const KPI_ICON_URLS: Record<string, string> = {
  // New KPI icons - keeping only the correct ones
  'actionIntent': '/KPIs/Action_Intent.svg',
  'adRecall': '/KPIs/Ad_Recall.svg',
  'advocacy': '/KPIs/Advocacy.svg',
  'brandAwareness': '/KPIs/Brand_Awareness.svg',
  'brandPreference': '/KPIs/Brand_Preference.svg',
  'consideration': '/KPIs/Consideration.svg',
  'messageAssociation': '/KPIs/Message_Association.svg',
  'purchaseIntent': '/KPIs/Purchase_Intent.svg',
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

// Add these to the IconProps interface
type IconType = 'static' | 'button';
type IconAction = 'default' | 'delete' | 'remove' | 'warning' | 'success' | string;

// Combine all props
export type IconProps = BaseIconProps & PathIconProps & React.SVGAttributes<SVGSVGElement> & {
  /**
   * Icon type - determines hover behavior
   * - 'static': No hover effects (informational only)
   * - 'button': Uses hover effects (interactive elements)
   */
  iconType?: IconType;
  /**
   * Action type - determines hover color
   * - 'default': Uses default hover color (blue)
   * - 'delete': Uses danger color (red)
   * - 'remove': Uses danger color (red)
   * - 'warning': Uses warning color (yellow)
   * - 'success': Uses success color (green)
   */
  action?: IconAction;
};

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
export const Icon = forwardRef<HTMLSpanElement, IconProps>(({
  name,
  kpiName,
  appName,
  platformName,
  fontAwesome,
  path,
  size = 'md',
  solid = false,
  active = false,
  color = iconConfig.colors.default,
  className,
  iconType = 'button',
  action = 'default',
  ...props
}, ref) => {
  try {
    // Define size classes for consistent icon sizing
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
        // Stricter check for empty objects, empty strings, or invalid values
        if (
          typeof name !== 'string' || 
          (typeof name === 'string' && name.trim() === '') || 
          (typeof name === 'object' && (Object.keys(name as any).length === 0 || JSON.stringify(name) === '{}'))
        ) {
          console.warn(`[Icon] Invalid name type provided: ${typeof name}, value: ${JSON.stringify(name)}`);
          return <FallbackIcon size={size} className={className} color="red" {...props} />;
        }
        
        // Check for aliases and map to the current name if found
        let iconName = name as string;
        if (typeof name === 'string' && ICON_ALIASES && name in ICON_ALIASES) {
          iconName = ICON_ALIASES[name as keyof typeof ICON_ALIASES];
          console.debug(`[Icon] Using alias: ${name} → ${iconName}`);
        }
        
        // Determine whether to use solid or light based on the active state and solid prop
        // solid prop overrides the default style from config
        const useSolid = solid || active;
        
        // Get both light and solid versions for hover effect
        const lightIcon = UI_OUTLINE_ICON_MAP[iconName as keyof typeof UI_OUTLINE_ICON_MAP];
        const solidIcon = UI_ICON_MAP[iconName as keyof typeof UI_ICON_MAP];
        
        // If there's no match in the map, try with getIcon for dynamic generation
        let lightIconFallback = lightIcon;
        let solidIconFallback = solidIcon;
        
        if (!lightIconFallback || !solidIconFallback) {
          const kebabName = String(name).toLowerCase().replace(/([A-Z])/g, "-$1").toLowerCase();
          if (!lightIconFallback) lightIconFallback = getIcon(kebabName, 'fal');
          if (!solidIconFallback) solidIconFallback = getIcon(kebabName, 'fas');
        }
        
        // Add logic to handle the static vs button behavior
        const useHoverEffect = shouldUseHoverEffect(iconType);
        const hoverColor = getActionColor(action);
        
        // If we have both icons and hover effect is enabled (and not overridden by solid prop),
        // implement the hover effect using CSS transitions
        if (lightIconFallback && solidIconFallback && useHoverEffect && !solid && !active) {
          // Create container span to position icons
          return (
            <span
              className={cn('relative inline-flex', sizeClasses[size], className)}
              style={{ color }}
              ref={ref}
              {...props as any}
            >
              {/* Light version (visible by default, hidden on hover) */}
              <FontAwesomeIcon
                icon={lightIconFallback}
                className="absolute inset-0 transition-opacity duration-150 opacity-100 group-hover:opacity-0 hover:opacity-0"
                color={color}
              />
              
              {/* Solid version (hidden by default, visible on hover) */}
              <FontAwesomeIcon
                icon={solidIconFallback}
                className="absolute inset-0 transition-opacity duration-150 opacity-0 group-hover:opacity-100 hover:opacity-100"
                color={hoverColor}
              />
              
              {/* Invisible spacer to maintain size */}
              <FontAwesomeIcon
                icon={lightIconFallback}
                className="invisible"
              />
            </span>
          );
        }
        
        // If hover effect is disabled or we can't implement the full effect,
        // use the regular implementation based on the solid/active state
        const faIcon = useSolid ? solidIconFallback : lightIconFallback;
          
        if (faIcon) {
          return (
            <FontAwesomeIcon
              icon={faIcon}
              className={cn(sizeClasses[size], className)}
              color={active ? iconConfig.colors.active : color}
              {...props as any}
              ref={ref as any}
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
    if (kpiName) {
      try {
        // Check for invalid kpiName
        if (typeof kpiName !== 'string' || Object.keys(kpiName as any).length === 0) {
          console.warn(`[Icon] Invalid kpiName type: ${typeof kpiName}, value: ${JSON.stringify(kpiName)}`);
          return <FallbackIcon size={size} className={className} color="red" {...props} />;
        }

        if (KPI_ICON_URLS[kpiName as keyof typeof KPI_ICON_URLS]) {
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
                src={KPI_ICON_URLS[kpiName as keyof typeof KPI_ICON_URLS]} 
                alt={String(kpiName)}
                className="w-full h-full transition-colors duration-150"
                style={{ filter: 'brightness(0)' }}
              />
            </span>
          );
        }
        
        console.warn(`[Icon] Unknown KPI icon "${kpiName}"`);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
      } catch (e) {
        console.error(`[Icon] Error rendering KPI icon "${kpiName}":`, e);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
      }
    }

    // Use app icon through appName prop
    if (appName) {
      try {
        // Check for invalid appName
        if (typeof appName !== 'string' || Object.keys(appName as any).length === 0) {
          console.warn(`[Icon] Invalid appName type: ${typeof appName}, value: ${JSON.stringify(appName)}`);
          return <FallbackIcon size={size} className={className} color="red" {...props} />;
        }

        if (APP_ICON_URLS[appName as keyof typeof APP_ICON_URLS]) {
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
                src={APP_ICON_URLS[appName as keyof typeof APP_ICON_URLS]} 
                alt={String(appName)}
                className="w-full h-full transition-colors duration-150"
                style={{ filter: 'brightness(0)' }}
              />
            </span>
          );
        }
        
        console.warn(`[Icon] Unknown app icon "${appName}"`);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
      } catch (e) {
        console.error(`[Icon] Error rendering app icon "${appName}":`, e);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
      }
    }

    // Use platform icon through platformName prop
    if (platformName) {
      try {
        // Check for invalid platformName
        if (typeof platformName !== 'string' || Object.keys(platformName as any).length === 0) {
          console.warn(`[Icon] Invalid platformName type: ${typeof platformName}, value: ${JSON.stringify(platformName)}`);
          return <FallbackIcon size={size} className={className} color="red" {...props} />;
        }
        
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
        
        console.warn(`[Icon] Unknown platform "${platformName}"`);
        return <FallbackIcon size={size} className={className} color="red" {...props} />;
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
        
        // Map prefixes to the ones used by Font Awesome
        const prefixMap: Record<string, string> = {
          'solid': 'fas',
          'regular': 'far',
          'light': 'fal',
          'brands': 'fab'
        };
        
        const mappedPrefix = prefixMap[prefix] || 'fas';
        
        // Use array syntax to leverage the library registration
        return (
          <FontAwesomeIcon
            icon={[mappedPrefix as any, iconName]}
            className={cn(sizeClasses[size], className)}
            color={color}
            {...props as any}
          />
        );
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
  } catch (rootError) {
    // Root level error handler ensures we never crash the app due to icon issues
    console.error('[Icon] Critical error in Icon component:', rootError);
    return <FallbackIcon size={size} className={className} color="red" {...props} />;
  }
});

export default Icon; 