/**
 * Icon System - Main Export File
 * 
 * This file serves as the public API for the icon system. All components, types,
 * and utilities that should be available to consumers should be exported from here.
 * 
 * By centralizing exports, we create a stable public API that allows us to refactor
 * internal implementations without breaking consumer code.
 */

import { IconName } from './icon-data';
import { iconConfig, getIconPrefix, shouldUseHoverEffect, getActionColor } from './IconConfig';
import {
  StaticIcon,
  ButtonIcon,
  DeleteIcon,
  WarningIcon,
  SuccessIcon
} from './IconVariants';
import React from 'react';
import { SvgIcon, PlatformIcon, SvgIconProps } from './SvgIcon';

// Re-export the main components
export { 
  SvgIcon, 
  PlatformIcon,
  
  // Icon variants for specialized uses
  StaticIcon,   // Use for non-interactive icons
  ButtonIcon,   // Use for interactive icons with blue hover effect
  DeleteIcon,   // Use for delete/remove actions (red hover)
  WarningIcon,  // Use for warning actions (yellow hover)
  SuccessIcon   // Use for success/confirmation actions (green hover)
};

// Export the SvgIcon as the default Icon component
export const Icon = SvgIcon;

// Export types
export type { 
  IconName,
  SvgIconProps
};

// Export platform icon types and data
export type PlatformName = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'x';

export const PLATFORM_ICON_MAP: Record<PlatformName, string> = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
};

export const PLATFORM_COLORS: Record<PlatformName, string> = {
  'facebook': '#1877F2',
  'instagram': '#C13584',
  'linkedin': '#0A66C2',
  'tiktok': '#000000',
  'youtube': '#FF0000',
  'x': '#000000'
};

// Configuration exports for advanced usage
export { 
  iconConfig, 
  getIconPrefix, 
  shouldUseHoverEffect, 
  getActionColor 
};

//=================================================
// Legacy Compatibility Layer (Backward Compatibility)
//=================================================

// Map of semantic icon names to FontAwesome icon names (camelCase to faName format)
export const UI_ICON_MAP: Record<string, string> = {
  'user': 'faUser',
  'search': 'faSearch',
  'plus': 'faPlus',
  'minus': 'faMinus',
  'close': 'faXmark',
  'check': 'faCheck',
  'chevronDown': 'faChevronDown',
  'chevronUp': 'faChevronUp',
  'chevronLeft': 'faChevronLeft',
  'chevronRight': 'faChevronRight',
  'settings': 'faGear',
  'mail': 'faEnvelope',
  'calendar': 'faCalendarDays',
  'warning': 'faTriangleExclamation',
  'info': 'faCircleInfo',
  'circleInfo': 'faCircleInfo',
  'bell': 'faBell',
  'document': 'faFile',
  'documentText': 'faFileLines',
  'chatBubble': 'faCommentDots',
  'delete': 'faTrashCan',
  'magnifyingGlass': 'faSearch',
  'xmark': 'faXmark',
  'heart': 'faHeart',
  'star': 'faStar',
  'bookmark': 'faBookmark',
  'globe': 'faGlobe',
  'gear': 'faGear',
  'eye': 'faEye',
  'view': 'faEye',
  'edit': 'faPenToSquare',
  'copy': 'faCopy',
  'share': 'faShare',
  'upload': 'faUpload',
  'download': 'faDownload',
  'filter': 'faFilter',
  'table': 'faTable',
  'list': 'faList',
  'tag': 'faTag',
  'lock': 'faLock',
  'unlock': 'faUnlock',
  'paperclip': 'faPaperclip',
  'clock': 'faClock',
  'history': 'faClockRotateLeft',
  'lightning': 'faBolt',
  'bolt': 'faBolt',
  'money': 'faMoneyBill',
  'house': 'faHome',
  'home': 'faHome',
  'photo': 'faImage',
  'image': 'faImage',
  'userGroup': 'faUserGroup',
  'chart': 'faChartBar',
  'chartBar': 'faChartBar',
  'chartLine': 'faChartLine',
  'chartPie': 'faChartPie',
  'xCircle': 'faCircleXmark',
  'checkCircle': 'faCircleCheck',
  'bellAlert': 'faBellSlash',
  'userCircle': 'faCircleUser',
  'swatch': 'faPalette',
  'creditCard': 'faCreditCard',
  'menu': 'faBars',
  'key': 'faKey',
  'trashCan': 'faTrashCan',
  'print': 'faPrint',
  'building': 'faBuilding',
  'dollar': 'faDollar',
  'dollarSign': 'faDollarSign',
  'currency': 'faDollarSign',
  'files': 'faFileLines',
  'file': 'faFile',
  'fileLines': 'faFileLines',
  'office': 'faBuilding',
  'default': 'faQuestion'
};

// Map of semantic icon names to light/outline FontAwesome icon names
export const UI_OUTLINE_ICON_MAP: Record<string, string> = {
  // Generate light versions of all icons in UI_ICON_MAP
  ...Object.fromEntries(
    Object.entries(UI_ICON_MAP).map(([key, value]) => [key, `${value}Light`])
  )
};

// KPI and App icon URLs (needed for backward compatibility)
export const KPI_ICON_URLS: Record<string, string> = {
  'actionIntent': '/KPIs/Action_Intent.svg',
  'adRecall': '/KPIs/Ad_Recall.svg',
  'advocacy': '/KPIs/Advocacy.svg',
  'brandAwareness': '/KPIs/Brand_Awareness.svg',
  'brandPreference': '/KPIs/Brand_Preference.svg',
  'consideration': '/KPIs/Consideration.svg',
  'messageAssociation': '/KPIs/Message_Association.svg',
  'purchaseIntent': '/KPIs/Purchase_Intent.svg',
};

export const APP_ICON_URLS: Record<string, string> = {
  'campaigns': '/app/Campaigns.svg',
  'influencers': '/app/Influencers.svg',
  'settings': '/app/Settings.svg',
  'help': '/app/Help.svg',
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

// Type definitions for backward compatibility
export type KpiIconName = keyof typeof KPI_ICON_URLS;
export type AppIconName = keyof typeof APP_ICON_URLS;

// Factory function to create Icon components from semantic names
export const iconComponentFactory = (iconName: string) => {
  return (props: React.ComponentProps<typeof Icon>) => {
    return React.createElement(Icon, { name: iconName, ...props });
  };
};

/**
 * USAGE EXAMPLES:
 * 
 * // Basic icon (default uses light style)
 * import { Icon } from '@/components/ui/icons';
 * <Icon name="faUser" />
 * 
 * // Solid style
 * <Icon name="faUser" solid />
 * 
 * // Icon with hover effects (parent must have 'group' class)
 * <button className="group flex items-center">
 *   <Icon name="faEdit" iconType="button" />
 *   <span className="ml-2">Edit</span>
 * </button>
 * 
 * // Icon variants (simpler usage)
 * import { StaticIcon, ButtonIcon, DeleteIcon } from '@/components/ui/icons';
 * <StaticIcon name="faInfo" />
 * <ButtonIcon name="faEdit" />
 * <DeleteIcon name="faTrash" />
 * 
 * // Platform icons
 * <Icon platformName="instagram" />
 * <Icon platformName="x" /> // Formerly "twitter"
 */ 
