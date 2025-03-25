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
import { SafeIcon } from './safe-icon';
import { CustomIconDisplay } from './custom-icon-display';

// Re-export the main components
export { 
  SvgIcon, 
  PlatformIcon,
  
  // Icon variants for specialized uses
  StaticIcon,   // Use for non-interactive icons
  ButtonIcon,   // Use for interactive icons with blue hover effect
  DeleteIcon,   // Use for delete/remove actions (red hover)
  WarningIcon,  // Use for warning actions (yellow hover)
  SuccessIcon,  // Use for success/confirmation actions (green hover)
  
  // Additional icon components
  SafeIcon,     // Fallback implementation for critical icons
  CustomIconDisplay  // Display test component for icons
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
  // Basic UI icons
  'arrowDown': 'faArrowDown',
  'arrowLeft': 'faArrowLeft',
  'arrowRight': 'faArrowRight',
  'arrowUp': 'faArrowUp',
  'arrowTrendDown': 'faArrowTrendDown',
  'arrowTrendUp': 'faArrowTrendUp',
  'bars': 'faBars',
  'bell': 'faBell',
  'bellAlert': 'faBellSlash',
  'bellSlash': 'faBellSlash',
  'bolt': 'faBolt',
  'bookmark': 'faBookmark',
  'bug': 'faBug',
  'building': 'faBuilding',
  'bullseye': 'faBullseye',
  'calendar': 'faCalendar',
  'calendarDays': 'faCalendarDays',
  'camera': 'faCamera',
  'chartBar': 'faChartBar',
  'chartColumn': 'faChartColumn',
  'chartLine': 'faChartLine',
  'chartPie': 'faChartPie',
  'chatBubble': 'faCommentDots',
  'check': 'faCheck',
  'checkCircle': 'faCircleCheck',
  'chevronDown': 'faChevronDown',
  'chevronLeft': 'faChevronLeft',
  'chevronRight': 'faChevronRight',
  'chevronUp': 'faChevronUp',
  'circleCheck': 'faCircleCheck',
  'circleInfo': 'faCircleInfo',
  'circleQuestion': 'faCircleQuestion',
  'circleUser': 'faCircleUser',
  'circleXmark': 'faCircleXmark',
  'clock': 'faClock',
  'clockRotateLeft': 'faClockRotateLeft',
  'close': 'faXmark',
  'comment': 'faComment',
  'commentDots': 'faCommentDots',
  'comments': 'faComments',
  'copy': 'faCopy',
  'creditCard': 'faCreditCard',
  'currency': 'faDollarSign',
  'default': 'faQuestion',
  'delete': 'faTrashCan',
  'document': 'faFile',
  'documentText': 'faFileLines',
  'dollar': 'faDollarSign',
  'dollarSign': 'faDollarSign',
  'download': 'faDownload',
  'edit': 'faPenToSquare',
  'envelope': 'faEnvelope',
  'exclamation': 'faExclamation',
  'examples': 'faFileLines',
  'eye': 'faEye',
  'file': 'faFile',
  'fileLines': 'faFileLines',
  'files': 'faFileLines',
  'filter': 'faFilter',
  'flag': 'faFlag',
  'flagCheckered': 'faFlagCheckered',
  'forward': 'faForward',
  'gear': 'faGear',
  'globe': 'faGlobe',
  'heart': 'faHeart',
  'history': 'faClockRotateLeft',
  'home': 'faHome',
  'house': 'faHome',
  'image': 'faImage',
  'info': 'faInfo',
  'key': 'faKey',
  'lightBulb': 'faLightbulb',
  'lightbulb': 'faLightbulb',
  'lightning': 'faBolt',
  'list': 'faList',
  'lock': 'faLock',
  'magnifyingGlass': 'faSearch',
  'magnifyingGlassPlus': 'faMagnifyingGlassPlus',
  'mail': 'faEnvelope',
  'map': 'faMap',
  'megaphone': 'faMegaphone',
  'menu': 'faBars',
  'minus': 'faMinus',
  'money': 'faMoneyBill',
  'moneyBill': 'faMoneyBill',
  'office': 'faBuilding',
  'palette': 'faPalette',
  'paperclip': 'faPaperclip',
  'paperPlane': 'faPaperPlane',
  'pen': 'faPen',
  'pencil': 'faPenToSquare',
  'penToSquare': 'faPenToSquare',
  'phone': 'faPhone',
  'photo': 'faImage',
  'play': 'faPlay',
  'plus': 'faPlus',
  'presentationChartBar': 'faPresentationScreen',
  'presentationScreen': 'faPresentationScreen',
  'print': 'faPrint',
  'question': 'faQuestion',
  'rocket': 'faRocket',
  'rotate': 'faRotate',
  'search': 'faSearch',
  'server': 'faServer',
  'settings': 'faGear',
  'share': 'faShare',
  'shield': 'faShield',
  'signal': 'faSignal',
  'spinner': 'faSpinner',
  'star': 'faStar',
  'swatch': 'faPalette',
  'table': 'faTable',
  'tableCells': 'faTableCells',
  'tag': 'faTag',
  'thumbsUp': 'faThumbsUp',
  'trash': 'faTrashCan',
  'trashCan': 'faTrashCan',
  'triangleExclamation': 'faTriangleExclamation',
  'trophy': 'faTrophy',
  'unlock': 'faUnlock',
  'upload': 'faUpload',
  'user': 'faUser',
  'userCircle': 'faCircleUser',
  'userGroup': 'faUserGroup',
  'video': 'faVideo',
  'view': 'faEye',
  'warning': 'faTriangleExclamation',
  'xCircle': 'faCircleXmark',
  'xmark': 'faXmark',
  
  // Semantic icons for specific purposes
  'achievement': 'faTrophy',
  'analytics': 'faChartLine',
  'audience': 'faUserGroup',
  'brandPerception': 'faChartBar',
  'campaign': 'faMegaphone',
  'chart': 'faChartBar',
  'expectedAchievements': 'faArrowTrendUp',
  'faMail': 'faEnvelope',
  'faClose': 'faXmark',
  'faDelete': 'faTrashCan',
  'faEdit': 'faPenToSquare',
  'faExamples': 'faFileLines',
  'faLightning': 'faBolt',
  'faPhoto': 'faImage',
  'faSearch': 'faSearch',
  'faSettings': 'faGear',
  'faSwatch': 'faPalette',
  'faUserCircle': 'faCircleUser',
  'faView': 'faEye',
  'faWarning': 'faTriangleExclamation',
  'faXCircle': 'faCircleXmark',
  'faDocument': 'faFile',
  'faDocumentText': 'faFileLines',
  'hashtags': 'faTag',
  'keyBenefits': 'faCircleCheck',
  'mainMessage': 'faLightbulb',
  'memorability': 'faBookmark',
  'message': 'faComments',
  'messaging': 'faComments',
  'purchaseIntent': 'faDollarSign',
  'target': 'faBullseye',
  'trendDown': 'faArrowTrendDown',
  'trendUp': 'faArrowTrendUp'
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
