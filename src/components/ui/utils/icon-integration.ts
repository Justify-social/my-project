/**
 * Icon Integration Utility
 * 
 * This utility provides helpers for integrating FontAwesome icons
 * with UI components.
 */

/**
 * Icon weight types
 */
export type IconWeight = 'light' | 'solid' | 'regular' | 'thin' | 'duotone' | 'brands';

/**
 * Icon data interface
 */
export interface IconData {
  id: string;
  prefix: string;
  name: string;
  weight: IconWeight;
  defaultWeight: IconWeight;
  hoverWeight?: IconWeight;
}

/**
 * Default FontAwesome configuration
 */
const DEFAULT_ICON_CONFIG = {
  defaultWeight: 'light' as IconWeight,
  hoverWeight: 'solid' as IconWeight,
  prefix: 'fa-'
};

/**
 * Get icon prefix based on weight
 * 
 * @param weight Icon weight
 * @returns FontAwesome prefix
 */
export function getIconPrefix(weight: IconWeight): string {
  switch (weight) {
    case 'light':
      return 'fal';
    case 'solid':
      return 'fas';
    case 'regular':
      return 'far';
    case 'thin':
      return 'fat';
    case 'duotone':
      return 'fad';
    case 'brands':
      return 'fab';
    default:
      return 'fal'; // Default to light
  }
}

/**
 * Parse icon ID to extract name and weight
 * 
 * @param iconId Icon identifier (e.g., "light:home", "solid:arrow-right", "brands:github")
 * @returns Icon name and weight
 */
export function parseIconId(iconId: string): { name: string; weight: IconWeight } {
  // If iconId includes weight specification (e.g., "light:home")
  if (iconId.includes(':')) {
    const [weightStr, name] = iconId.split(':');
    
    // Validate weight is a supported FontAwesome weight
    if (
      weightStr === 'light' ||
      weightStr === 'solid' ||
      weightStr === 'regular' ||
      weightStr === 'thin' ||
      weightStr === 'duotone' ||
      weightStr === 'brands'
    ) {
      return { name, weight: weightStr as IconWeight };
    }
    
    // If weight is invalid, use default and treat the whole thing as a name
    return { name: iconId, weight: DEFAULT_ICON_CONFIG.defaultWeight };
  }
  
  // If no weight is specified, use default
  return { name: iconId, weight: DEFAULT_ICON_CONFIG.defaultWeight };
}

/**
 * Get complete icon data from an icon ID
 * 
 * @param iconId Icon identifier (e.g., "light:home", "solid:arrow-right", "brands:github")
 * @returns Complete icon data
 */
export function getIconData(iconId: string): IconData {
  const { name, weight } = parseIconId(iconId);
  const prefix = getIconPrefix(weight);
  
  return {
    id: iconId,
    prefix,
    name,
    weight,
    defaultWeight: DEFAULT_ICON_CONFIG.defaultWeight,
    hoverWeight: DEFAULT_ICON_CONFIG.hoverWeight,
  };
}

/**
 * Get CSS classes for an icon
 * 
 * @param iconId Icon identifier
 * @param additionalClasses Additional CSS classes to apply
 * @param enableHover Whether to enable hover effect (weight change)
 * @returns CSS class string
 */
export function getIconClasses(
  iconId: string,
  additionalClasses: string = '',
  enableHover: boolean = true
): string {
  const { prefix, name } = getIconData(iconId);
  
  // Base classes
  let classes = `${prefix} fa-${name} ${additionalClasses}`;
  
  // Add hover classes if enabled
  if (enableHover) {
    classes += ` hover:${getIconPrefix(DEFAULT_ICON_CONFIG.hoverWeight)} group-hover:${getIconPrefix(DEFAULT_ICON_CONFIG.hoverWeight)}`;
  }
  
  return classes.trim();
}

/**
 * Map a set of component-specific names to actual icon IDs
 * 
 * This is useful for components that have named icons like "success", "error", etc.
 * 
 * @param componentName The name of the component
 * @param iconName The component-specific icon name
 * @returns The actual icon ID to use
 */
export function mapComponentIcon(componentName: string, iconName: string): string {
  // Common mappings that apply across components
  const commonMappings: Record<string, string> = {
    success: 'light:check-circle',
    error: 'light:circle-exclamation',
    warning: 'light:triangle-exclamation',
    info: 'light:circle-info',
    close: 'light:xmark',
    loading: 'light:spinner',
    search: 'light:magnifying-glass',
    add: 'light:plus',
    remove: 'light:minus',
    edit: 'light:pen',
    delete: 'light:trash',
    settings: 'light:gear',
    user: 'light:user',
    calendar: 'light:calendar',
    menu: 'light:bars',
    more: 'light:ellipsis',
    filter: 'light:filter',
    download: 'light:download',
    upload: 'light:upload',
    external: 'light:arrow-up-right-from-square',
  };
  
  // Component-specific mappings
  const componentMappings: Record<string, Record<string, string>> = {
    // Alert component icons
    alert: {
      success: 'light:check-circle',
      error: 'light:circle-exclamation',
      warning: 'light:triangle-exclamation',
      info: 'light:circle-info',
    },
    
    // Button component icons
    button: {
      loading: 'light:spinner fa-spin',
    },
    
    // Form component icons
    form: {
      valid: 'light:check',
      invalid: 'light:xmark',
    },
    
    // Navigation component icons
    navigation: {
      home: 'light:house',
      previous: 'light:chevron-left',
      next: 'light:chevron-right',
    },
  };
  
  // Check for component-specific mapping
  if (componentMappings[componentName]?.[iconName]) {
    return componentMappings[componentName][iconName];
  }
  
  // Check for common mapping
  if (commonMappings[iconName]) {
    return commonMappings[iconName];
  }
  
  // If no mapping found, assume the iconName is already an icon ID
  return iconName;
} 