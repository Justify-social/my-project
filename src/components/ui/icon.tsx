import React, { forwardRef } from 'react';
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
import { FA_UI_ICON_MAP, FA_UI_OUTLINE_ICON_MAP, FA_PLATFORM_ICON_MAP, PLATFORM_COLORS, getIcon, ICON_ALIASES } from '@/lib/icon-mappings';
import { SafeQuestionMarkIcon } from '@/lib/icon-helpers';

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
  faBars, faList
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
  faTable as falTable, faTableCells as falTableCells, faPlay as falPlay,
  faBars as falBars, faList as falList, faLightbulb as falLightbulb
} from '@fortawesome/pro-light-svg-icons';

import {
  faTwitter, faXTwitter, faFacebook, faInstagram, faYoutube,
  faLinkedin, faTiktok, faReddit, faPinterest
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

// Register all essential icons
library.add(
  // Solid icons
  faUser, faQuestion, faCheck, faStar, faHeart, 
  faBell, faGear, faSearch, faPlus, faMinus, faClose,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faMail, faCalendarDays, faTrash, faWarning,
  faInfo, faLightbulb, faView, faEdit, faCopy,
  faDownload, faUpload, faShare, faBookmark, faDocument,
  faDocumentText, faTag, faFilter, faPaperclip, faLock, faUnlock, faKey,
  faHistory, faArrowUp, faArrowDown, faArrowLeft, faArrowRight,
  faCircleCheck, faChatBubble, faDelete, faHome, faHouse,
  faChartBar, faChartPie, faMoneyBill, faTrendUp, 
  faTrendDown, faLightning, faGlobe, faUserGroup, faBuilding,
  faRocket, faSignal, faBellAlert, faMap, faShield, faClock,
  faXCircle, faCheckCircle, faMagnifyingGlassPlus, faSwatch, faCreditCard,
  faClockRotateLeft, faPresentationChartBar, faTable, faGrid, faPlay,
  faMenu, faList, faSettings, faLightBulb, faCalendar, faChart, faMoney,
  faMagnifyingGlass, faXMark, faFile, faFileLines, faTableCells,
  
  // Light icons
  falUser, falCheck, falStar, falHeart, falBell, falGear,
  falSearch, falPlus, falMinus, falClose, falChevronDown,
  falChevronUp, falChevronLeft, falChevronRight, falMail,
  falCalendarDays, falTrash, falCircleCheck, falChatBubble,
  falView, falEdit, falCopy, falDownload, falUpload,
  falShare, falBookmark, falDocument, falDocumentText, falTag, falFilter,
  falPaperclip, falLock, falUnlock, falKey, falHome, falHouse,
  falChartBar, falChartPie, falMoneyBill, falTrendUp,
  falTrendDown, falLightning, falGlobe, falUserGroup,
  falBuilding, falRocket, falSignal, falBellAlert,
  falMap, falShield, falClock, falArrowDown, falArrowUp,
  falArrowRight, falArrowLeft, falXCircle, falCheckCircle, falMagnifyingGlassPlus,
  falSwatch, falCreditCard, falClockRotateLeft, falPresentationChartBar,
  falTable, falGrid, falPlay, falMenu, falList, falSettings, falLightBulb,
  falCalendar, falChart, falMoney, falMagnifyingGlass, falXMark, falFile,
  falFileLines, falTableCells,
  
  // Regular icons
  farUser, farCheck, farStar, farHeart, farBell,
  
  // Brand icons
  faTwitter, faXTwitter, faFacebook, faInstagram, faYoutube,
  faLinkedin, faTiktok, faReddit, faPinterest
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
  color = 'currentColor',
  className,
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
        
        // Use Font Awesome icons
        let faIcon = solid 
          ? UI_ICON_MAP[iconName as keyof typeof UI_ICON_MAP]
          : UI_OUTLINE_ICON_MAP[iconName as keyof typeof UI_OUTLINE_ICON_MAP];
        
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