import React from 'react';
import { Icon, IconName } from '@/components/ui/icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * A safe wrapper for FontAwesomeIcon that handles errors gracefully
 * This component is used in the Font Awesome diagnostic tool
 */
export const SafeFontAwesomeIcon = ({ icon, className, ...props }: any) => {
  try {
    return <FontAwesomeIcon icon={icon} className={className} {...props} />;
  } catch (error) {
    console.error('Error rendering FontAwesomeIcon:', error);
    return <SafeQuestionMarkIcon className={className} {...props} />;
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

/**
 * A safe, direct SVG element for rendering a question mark icon
 * as a last resort fallback when all other icon loading methods fail
 */
export const SafeQuestionMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width="1em" 
      height="1em"
      fill="currentColor"
      {...props}
    >
      {/* Simple question mark icon path */}
      <path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z" />
    </svg>
  );
}; 