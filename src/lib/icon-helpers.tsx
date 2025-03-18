import React from 'react';
import { Icon, IconName } from '@/components/ui/icon';

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
 * Creates a factory for icon components that can be used with component props
 * 
 * @example
 * // Before
 * <SomeComponent icon={UserIcon} />
 * 
 * // After using helper
 * <SomeComponent icon={iconComponentFactory('user')} />
 */
export function iconComponentFactory(iconName: IconName) {
  // Return a React component that renders the Icon with proper lazy loading
  const IconComponent = (props: any) => {
    // Dynamically import the Icon component to avoid circular dependencies
    const LazyIcon = React.lazy(() => import('@/components/ui/icon').then(module => ({
      default: module.Icon
    })));
    
    return (
      <React.Suspense fallback={<div className={props.className || 'w-5 h-5'} />}>
        <LazyIcon name={iconName} {...props} />
      </React.Suspense>
    );
  };
  
  return IconComponent;
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