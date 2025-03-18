import React from 'react';
import { cn } from '@/lib/utils';

// React Icons imports
import * as Fa from 'react-icons/fa6'; // Font Awesome 6 icons
import * as Hi from 'react-icons/hi2'; // Heroicons v2 
import * as Ci from 'react-icons/ci'; // Circle icons for outlines
import * as Bs from 'react-icons/bs'; // Bootstrap icons
import * as Md from 'react-icons/md'; // Material Design icons
import * as Si from 'react-icons/si'; // Simple Icons (for brands/platforms)
import * as Bi from 'react-icons/bi'; // Boxicons
import * as Ai from 'react-icons/ai'; // Ant Design Icons

// ==========================================
// UI ICON MAPS
// ==========================================

/**
 * Standard UI icons - each icon is labeled with its source library
 */
export const UI_ICON_MAP = {
  // Heroicons (Hi)
  search: Hi.HiMagnifyingGlass,       // Heroicons
  plus: Hi.HiPlus,                    // Heroicons
  minus: Hi.HiMinus,                  // Heroicons
  close: Hi.HiXMark,                  // Heroicons
  check: Hi.HiCheck,                  // Heroicons
  chevronDown: Hi.HiChevronDown,      // Heroicons
  chevronUp: Hi.HiChevronUp,          // Heroicons
  chevronLeft: Hi.HiChevronLeft,      // Heroicons
  chevronRight: Hi.HiChevronRight,    // Heroicons
  user: Hi.HiUser,                    // Heroicons
  settings: Hi.HiCog6Tooth,           // Heroicons
  mail: Hi.HiEnvelope,                // Heroicons
  calendar: Hi.HiCalendarDays,        // Heroicons
  trash: Hi.HiTrash,                  // Heroicons
  warning: Hi.HiExclamationTriangle,  // Heroicons
  info: Hi.HiInformationCircle,       // Heroicons
  bell: Hi.HiBell,                    // Heroicons
  
  // Bootstrap Icons (Bs)
  circleCheck: Bs.BsCheckCircle,      // Bootstrap Icons
  lightBulb: Bs.BsLightbulb,          // Bootstrap Icons
  chatBubble: Bs.BsChatSquareText,    // Bootstrap Icons
  
  // New Actions Icons
  view: Bs.BsEye,                     // Bootstrap Icons
  edit: Bs.BsPencil,                  // Bootstrap Icons
  copy: Bs.BsCopy,                    // Bootstrap Icons
  delete: Bs.BsTrash,                 // Bootstrap Icons
  
  // Additional common UI icons from different libraries
  heart: Bs.BsHeart,                  // Bootstrap Icons
  star: Bs.BsStar,                    // Bootstrap Icons
  bookmark: Bs.BsBookmark,            // Bootstrap Icons
  share: Bs.BsShare,                  // Bootstrap Icons
  download: Bs.BsDownload,            // Bootstrap Icons
  upload: Bs.BsUpload,                // Bootstrap Icons
  menu: Bs.BsListUl,                  // Bootstrap Icons
  filter: Bs.BsFilter,                // Bootstrap Icons
  grid: Bs.BsGrid,                    // Bootstrap Icons
  list: Bs.BsListTask,                // Bootstrap Icons
  tag: Bs.BsTag,                      // Bootstrap Icons
  lock: Bs.BsLock,                    // Bootstrap Icons
  unlock: Bs.BsUnlock,                // Bootstrap Icons
  key: Bs.BsKey,                      // Bootstrap Icons
  paperclip: Bs.BsPaperclip,          // Bootstrap Icons
};

/**
 * UI icons with outline variants - each icon is labeled with its source library
 */
export const UI_OUTLINE_ICON_MAP = {
  // Heroicons Outline (Hi)
  search: Hi.HiOutlineMagnifyingGlass,       // Heroicons Outline
  plus: Hi.HiOutlinePlus,                    // Heroicons Outline
  minus: Hi.HiOutlineMinus,                  // Heroicons Outline
  close: Hi.HiOutlineXMark,                  // Heroicons Outline
  check: Hi.HiOutlineCheck,                  // Heroicons Outline
  chevronDown: Hi.HiOutlineChevronDown,      // Heroicons Outline
  chevronUp: Hi.HiOutlineChevronUp,          // Heroicons Outline
  chevronLeft: Hi.HiOutlineChevronLeft,      // Heroicons Outline
  chevronRight: Hi.HiOutlineChevronRight,    // Heroicons Outline
  user: Hi.HiOutlineUser,                    // Heroicons Outline
  settings: Hi.HiOutlineCog6Tooth,           // Heroicons Outline
  mail: Hi.HiOutlineEnvelope,                // Heroicons Outline
  calendar: Hi.HiOutlineCalendarDays,        // Heroicons Outline
  trash: Hi.HiOutlineTrash,                  // Heroicons Outline
  warning: Hi.HiOutlineExclamationTriangle,  // Heroicons Outline
  info: Hi.HiOutlineInformationCircle,       // Heroicons Outline
  bell: Hi.HiOutlineBell,                    // Heroicons Outline
  
  // Bootstrap Icons (Bs)
  circleCheck: Bs.BsCheckCircle,             // Bootstrap Icons
  lightBulb: Bs.BsLightbulbFill,             // Bootstrap Icons Fill
  chatBubble: Bs.BsChatSquareText,           // Bootstrap Icons
  
  // New Actions Icons
  view: Bs.BsEyeFill,                        // Bootstrap Icons Fill
  edit: Bs.BsPencilFill,                     // Bootstrap Icons Fill
  copy: Bs.BsCopy,                           // Bootstrap Icons
  delete: Bs.BsTrashFill,                    // Bootstrap Icons Fill
  
  // Additional common UI icons from different libraries
  heart: Bs.BsHeartFill,                     // Bootstrap Icons Fill
  star: Bs.BsStarFill,                       // Bootstrap Icons Fill
  bookmark: Bs.BsBookmarkFill,               // Bootstrap Icons Fill
  share: Bs.BsShareFill,                     // Bootstrap Icons Fill
  download: Bs.BsDownload,                   // Bootstrap Icons
  upload: Bs.BsUpload,                       // Bootstrap Icons
  menu: Bs.BsListUl,                         // Bootstrap Icons
  filter: Bs.BsFilter,                       // Bootstrap Icons
  grid: Bs.BsGrid,                           // Bootstrap Icons
  list: Bs.BsListTask,                       // Bootstrap Icons
  tag: Bs.BsTagFill,                         // Bootstrap Icons Fill
  lock: Bs.BsLockFill,                       // Bootstrap Icons Fill
  unlock: Bs.BsUnlockFill,                   // Bootstrap Icons Fill
  key: Bs.BsKeyFill,                         // Bootstrap Icons Fill
  paperclip: Bs.BsPaperclip,                 // Bootstrap Icons
};

// ==========================================
// PLATFORM ICON MAPS
// ==========================================

/**
 * Platform icons from Simple Icons (Si)
 */
export const PLATFORM_ICON_MAP = {
  instagram: Si.SiInstagram,  // Simple Icons
  youtube: Si.SiYoutube,      // Simple Icons
  tiktok: Si.SiTiktok,        // Simple Icons
  facebook: Si.SiFacebook,    // Simple Icons
  twitter: Si.SiX,            // Simple Icons
  linkedin: Si.SiLinkedin,    // Simple Icons
};

/**
 * Platform icon brand colors
 */
export const PLATFORM_COLORS = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  tiktok: '#000000',
  facebook: '#1877F2',
  twitter: '#000000', // X (formerly Twitter) is now black
  linkedin: '#0A66C2',
};

// ==========================================
// URL-BASED ICONS
// ==========================================

/**
 * KPI icon URLs - these are custom SVGs stored in the public directory
 */
export const KPI_ICON_URLS = {
  brandAwareness: '/KPIs/Brand_Awareness.svg',
  adRecall: '/KPIs/Ad_Recall.svg',
  consideration: '/KPIs/Consideration.svg',
  messageAssociation: '/KPIs/Message_Association.svg',
  brandPreference: '/KPIs/Brand_Preference.svg',
  purchaseIntent: '/KPIs/Purchase_Intent.svg',
  actionIntent: '/KPIs/Action_Intent.svg',
  recommendationIntent: '/KPIs/Brand_Preference.svg', // Fallback as per CSS
  advocacy: '/KPIs/Advocacy.svg',
};

/**
 * App icon URLs - these are custom SVGs stored in the public directory
 */
export const APP_ICON_URLS = {
  'profile': '/profile-image.svg',
  'coins': '/coins.svg',
  'bell': '/bell.svg',
  'magnifyingGlass': '/magnifying-glass.svg',
  'file': '/file.svg',
  'globe': '/globe.svg',
  'window': '/window.svg',
  'home': '/Home.svg',
  'campaigns': '/Campaigns.svg',
  'influencers': '/Influencers.svg',
  'brandLift': '/Brand_Lift.svg',
  'brandHealth': '/Brand_Health.svg',
  'creativeAssetTesting': '/Creative_Asset_Testing.svg',
  'mmm': '/MMM.svg',
  'reports': '/Reports.svg',
  'billing': '/Billing.svg',
  'settings': '/Settings.svg',
  'help': '/Help.svg',
};

// Type definitions
export type IconName = keyof typeof UI_ICON_MAP;
export type KpiIconName = keyof typeof KPI_ICON_URLS;
export type AppIconName = keyof typeof APP_ICON_URLS;
export type PlatformIconName = keyof typeof PLATFORM_ICON_MAP;
// For backward compatibility with HeroIcons
export type HeroiconSolidName = keyof typeof Hi;
export type HeroiconOutlineName = keyof typeof Hi;

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
   */
  heroSolid?: HeroiconSolidName;
  
  /**
   * The name of a Heroicon outline variant to use (for backward compatibility)
   */
  heroOutline?: HeroiconOutlineName;
  
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

export type IconProps = BaseIconProps & Omit<React.SVGAttributes<SVGSVGElement>, keyof BaseIconProps>;

/**
 * Icon component for displaying icons from react-icons.
 * Supports UI icons, KPI icons, app icons, platform icons, and Heroicons.
 * 
 * @example
 * ```tsx
 * // Using a predefined UI icon
 * <Icon name="search" />
 * 
 * // Using a KPI icon 
 * <Icon kpiName="brandAwareness" />
 * 
 * // Using an app icon
 * <Icon appName="home" />
 * 
 * // Using a profile icon
 * <Icon appName="profile" />
 * 
 * // Using a platform icon
 * <Icon platformName="instagram" />
 * 
 * // Using a Heroicon (solid)
 * <Icon heroSolid="DocumentIcon" />
 * 
 * // Using a Heroicon (outline)
 * <Icon heroOutline="TrashIcon" />
 * 
 * // Custom size
 * <Icon name="check" size="lg" />
 * 
 * // Custom color
 * <Icon name="warning" color="red" />
 * 
 * // Solid icon
 * <Icon name="info" solid />
 * 
 * // Active state (for navigation)
 * <Icon appName="home" active />
 * ```
 */
export const Icon = ({
  name,
  kpiName,
  appName,
  platformName,
  heroSolid,
  heroOutline,
  size = 'md',
  solid = false,
  color = 'currentColor',
  className,
  active = false,
  ...props
}: IconProps) => {
  // Size classes map
  const sizeMap = {
    xs: { size: 16, className: 'w-4 h-4' },
    sm: { size: 20, className: 'w-5 h-5' },
    md: { size: 24, className: 'w-6 h-6' },
    lg: { size: 32, className: 'w-8 h-8' },
    xl: { size: 40, className: 'w-10 h-10' },
  };

  // Handle URL-based KPI and App icons
  if (kpiName || appName) {
    const iconUrl = kpiName ? KPI_ICON_URLS[kpiName] : appName ? APP_ICON_URLS[appName] : '';
    
    if (!iconUrl) {
      console.warn(`Icon: Invalid ${kpiName ? 'KPI' : 'App'} icon name provided`);
      return null;
    }
    
    // Return image element for URL-based icons with only valid HTML img attributes
    return (
      <img 
        src={iconUrl}
        alt={kpiName || appName || "Icon"}
        className={cn(
          sizeMap[size].className,
          kpiName && 'kpi-icon',
          appName && 'app-icon',
          active && 'app-icon-active',
          kpiName && 'blue-icon',
          className
        )}
        width={sizeMap[size].size}
        height={sizeMap[size].size}
      />
    );
  }
  
  // Handle Platform icons
  if (platformName) {
    const PlatformIcon = PLATFORM_ICON_MAP[platformName];
    
    if (!PlatformIcon) {
      console.warn(`Icon: Invalid Platform icon name provided`);
      return null;
    }
    
    return (
      <PlatformIcon 
        className={cn(sizeMap[size].className, 'platform-icon', className)}
        color={color || PLATFORM_COLORS[platformName] || 'currentColor'}
        {...props}
      />
    );
  }
  
  // Handle Heroicons - for backward compatibility
  if (heroSolid) {
    // With the new format (HiXxx), we can directly access the component
    const HeroIcon = Hi[heroSolid as keyof typeof Hi];
    
    if (!HeroIcon) {
      console.warn(`Icon: Invalid Heroicon solid name provided: ${heroSolid}`);
      return null;
    }
    
    return (
      <HeroIcon 
        className={cn(sizeMap[size].className, className)}
        color={color}
        {...props}
      />
    );
  }
  
  if (heroOutline) {
    // With the new format (HiOutlineXxx), we can directly access the component
    const HeroIcon = Hi[heroOutline as keyof typeof Hi];
    
    if (!HeroIcon) {
      console.warn(`Icon: Invalid Heroicon outline name provided: ${heroOutline}`);
      return null;
    }
    
    return (
      <HeroIcon 
        className={cn(sizeMap[size].className, className)}
        color={color}
        {...props}
      />
    );
  }
  
  // Handle standard UI icons
  if (name) {
    const IconComponent = solid ? UI_ICON_MAP[name] : UI_OUTLINE_ICON_MAP[name];
    
    if (!IconComponent) {
      console.warn(`Icon: Invalid UI icon name provided: ${name}`);
      return null;
    }
    
    return (
      <IconComponent 
        className={cn(sizeMap[size].className, className)}
        color={color}
        {...props}
      />
    );
  }
  
  // Fallback: empty div with the right dimensions
  return <div className={cn(sizeMap[size].className, className)} />;
};

export default Icon; 