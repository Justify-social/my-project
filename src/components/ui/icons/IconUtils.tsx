import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { iconConfig, IconName } from './IconConfig';
import { Icon } from './Icon';

// Import IconName from the FontAwesome core
import { IconName as FontAwesomeIconName } from '@fortawesome/fontawesome-svg-core';

/**
 * A safe wrapper for FontAwesome that handles errors gracefully
 */
export const SafeFontAwesomeIcon = ({ icon, className, ...props }: any) => {
  try {
    return <FontAwesomeIcon icon={icon} className={className} {...props} />;
  } catch (error) {
    console.error('Error rendering FontAwesomeIcon:', error);
    return <SafeQuestionMarkIcon className={className} />;
  }
};

/**
 * Helper function that maps Hero Icon names to their corresponding name prop value
 * This makes migration from heroSolid/heroOutline props to name prop easier
 * 
 * @example
 * // Before: <Icon heroSolid="UserIcon" />
 * // After: <Icon name={heroIconToName("UserIcon")} solid />
 * 
 * @param heroIconName The Hero Icon name (e.g., "UserIcon", "TrashIcon")
 * @returns The equivalent name prop value or undefined if no mapping exists
 */
export function heroIconToName(heroIconName: string): IconName | undefined {
  // Strip "Icon" suffix if present
  const baseName = heroIconName.replace(/Icon$/, '');
  
  return heroIconNameMap[baseName] || heroIconNameMap[`${baseName}Icon`];
}

/**
 * Logs a deprecation warning for Hero Icons usage
 * 
 * @param iconName The Hero Icon name that was used
 * @param altName The recommended alternative name prop value
 */
export function logHeroIconDeprecation(iconName: string, altName?: IconName): void {
  const alternativeText = altName 
    ? `Use <Icon name="${altName}" /> instead.` 
    : 'Switch to using the name prop with Font Awesome icons.';
    
  console.warn(
    `[Icon] DEPRECATED: Hero Icon "${iconName}" is deprecated and will be removed in a future version. ${alternativeText}`
  );
}

// Map of Heroicon names to our IconName
const heroIconNameMap: Record<string, IconName> = {
  // User interface icons
  UserIcon: 'user',
  MagnifyingGlassIcon: 'search',
  PlusIcon: 'plus',
  MinusIcon: 'minus',
  XMarkIcon: 'close',
  CheckIcon: 'check',
  ChevronDownIcon: 'chevronDown',
  ChevronUpIcon: 'chevronUp',
  ChevronLeftIcon: 'chevronLeft',
  ChevronRightIcon: 'chevronRight',
  CogIcon: 'settings',
  Cog6ToothIcon: 'settings',
  EnvelopeIcon: 'mail',
  CalendarDaysIcon: 'calendar',
  CalendarIcon: 'calendar',
  TrashIcon: 'trash',
  
  // Status icons
  ExclamationTriangleIcon: 'warning',
  InformationCircleIcon: 'info',
  BellIcon: 'bell',
  
  // Document icons
  DocumentTextIcon: 'info',
  DocumentIcon: 'info',
  
  // Financial icons
  CurrencyDollarIcon: 'info',
  BanknotesIcon: 'info',
  
  // Communication icons
  ChatBubbleLeftRightIcon: 'chatBubble',
  ChatBubbleLeftIcon: 'chatBubble',
  
  // Other common icons
  BoltIcon: 'info',
  ArrowPathIcon: 'info',
  ArrowUpIcon: 'chevronUp',
  ArrowDownIcon: 'chevronDown',
  ArrowLeftIcon: 'chevronLeft',
  ArrowRightIcon: 'chevronRight',
  HomeIcon: 'info',
  GlobeAltIcon: 'info',
  BookmarkIcon: 'bookmark',
  HeartIcon: 'heart',
  StarIcon: 'star',
  PencilIcon: 'edit',
  PencilSquareIcon: 'edit',
};

/**
 * Helper function to migrate from heroSolid/heroOutline to name prop
 * 
 * @example
 * // Before
 * <Icon heroSolid="UserIcon" />
 * 
 * // After
 * {migrateHeroIcon("UserIcon", { size: "md" })}
 * 
 * @param heroIconName The Hero Icon name to migrate
 * @param props Additional props for the icon
 * @returns JSX.Element with the migrated icon
 */
export function migrateHeroIcon(
  heroIconName: string, 
  props: any = {}
): JSX.Element {
  const iconName = heroIconToName(heroIconName);
  const isOutline = heroIconName.includes('Outline');
  
  // Create a dynamic import reference to avoid circular dependencies
  // This eliminates the error where we try to render the Icon object directly
  const IconComponent = React.lazy(() => import('@/components/ui/icon').then(module => ({
    default: module.Icon
  })));
  
  // Use React.Suspense to handle the lazy-loaded component
  if (iconName) {
    return (
      <React.Suspense fallback={<div className={props.className || 'w-5 h-5'} />}>
        <IconComponent name={iconName} solid={!isOutline} {...props} />
      </React.Suspense>
    );
  } else {
    console.warn(`[Icon] Could not migrate Hero Icon "${heroIconName}" - no mapping found`);
    return (
      <React.Suspense fallback={<div className={props.className || 'w-5 h-5'} />}>
        <IconComponent name="info" {...props} />
      </React.Suspense>
    );
  }
}

/**
 * Creates a React component from an icon name
 * Useful for dynamic icon rendering
 */
export function iconComponentFactory(iconName: string, props: any = {}) {
  return () => <Icon name={iconName as IconName} {...props} />;
}

/**
 * Returns the IconName for a given Heroicon name
 * Useful for components that have been migrated to use IconName
 * 
 * @example
 * // Before with Heroicon:
 * <MetricCard icon={DocumentTextIcon} />
 * 
 * // After with migrated component:
 * <MetricCard iconName={getIconName('DocumentTextIcon')} />
 */
export function getIconName(heroIconName: string): IconName {
  return heroIconNameMap[heroIconName] || 'info';
}

/**
 * Safe question mark icon that never throws
 */
export const SafeQuestionMarkIcon: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}> = ({ className, style, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ color: 'red', ...style }}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 16v2M9 9a3 3 0 016 0c0 1.5-2 2-2 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Helper component to migrate from direct FontAwesome usage to our Icon system
 * This enables icons to use the default light->solid hover effect while still 
 * accepting FontAwesome-specific props like icon
 * 
 * @example
 * // Instead of:
 * <FontAwesomeIcon icon={faUser} className="w-6 h-6" />
 * 
 * // Use:
 * <IconFa icon={faUser} className="w-6 h-6" />
 * // Or with solid variant:
 * <IconFa icon={faUser} solid className="w-6 h-6" />
 */
export const IconFa: React.FC<{
  icon: IconProp;
  solid?: boolean;
  active?: boolean;
  className?: string;
  [key: string]: any;
}> = ({ icon, solid = false, active = false, className, ...props }) => {
  try {
    // For brand icons (fab prefix)
    if (Array.isArray(icon) && icon[0] === 'fab') {
      return <Icon platformName={icon[1] as any} className={className} {...props} />;
    }
    
    // For direct imported icons, try to extract the name
    if (typeof icon === 'object' && icon !== null && 'iconName' in icon) {
      const iconName = icon.iconName as string;
      // Convert kebab-case to camelCase if needed
      const camelCaseName = iconName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return <Icon name={camelCaseName as any} solid={solid} active={active} className={className} {...props} />;
    }
    
    // For array syntax with ['fas'|'fal', 'icon-name']
    if (Array.isArray(icon) && icon.length === 2) {
      const iconName = icon[1] as string;
      // Convert kebab-case to camelCase if needed
      const camelCaseName = iconName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      
      // If explicitly using 'fas', override the solid prop
      const forceSolid = icon[0] === 'fas' ? true : solid;
      
      return <Icon name={camelCaseName as any} solid={forceSolid} active={active} className={className} {...props} />;
    }
    
    // Fallback to original FontAwesomeIcon if we can't convert
    console.warn('[IconFa] Could not convert to Icon component, using direct FontAwesomeIcon:', icon);
    return <FontAwesomeIcon icon={icon} className={className} {...props} />;
  } catch (error) {
    console.error('[IconFa] Error rendering icon:', error);
    return <SafeQuestionMarkIcon className={className} />;
  }
}; 