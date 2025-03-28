/**
 * Icon Mappings - Primary Mapping File
 * 
 * Contains the definitive mappings and utility functions for the icon system
 */

/**
 * Map of semantic icon names to FontAwesome specific icon names
 * Useful when we want to abstract away specific icon libraries
 */
export const SEMANTIC_TO_FA_MAP: Record<string, string> = {
  'add': 'faPlus',
  'alert': 'faExclamationTriangle',
  'check': 'faCheck',
  'close': 'faXmark',
  'delete': 'faTrashCan',
  'download': 'faDownload',
  'edit': 'faPenToSquare',
  'filter': 'faFilter',
  'info': 'faInfoCircle',
  'search': 'faMagnifyingGlass',
  'settings': 'faGear',
  'success': 'faCheckCircle',
  'upload': 'faUpload',
  'user': 'faUser',
  'warning': 'faTriangleExclamation',
};

/**
 * Map of icon names to SVG paths
 * Used for looking up SVG paths by icon name
 */
export const FA_TO_SVG_MAP: Record<string, string> = {};

/**
 * Extract the base name from an icon name (removing any prefixes)
 * @param iconName Full icon name (e.g. 'faUser', 'fasUser')
 * @returns Base name without prefix (e.g. 'User')
 */
export function getIconBaseName(iconName: string): string {
  // Check if the name starts with a known prefix
  if (iconName.startsWith('fa')) {
    // Extract the base name (remove the fa/fas/far/fal/fab prefix)
    // Handle both standard format (faUser) and explicit format (fasUser)
    if (iconName.startsWith('fas') || 
        iconName.startsWith('far') || 
        iconName.startsWith('fal') || 
        iconName.startsWith('fab')) {
      return iconName.slice(3);
    }
    return iconName.slice(2);
  }
  
  // If no recognized prefix, return as is
  return iconName;
}

/**
 * Get the icon prefix from an icon name
 * @param iconName Full icon name (e.g. 'faUser', 'fasUser')
 * @returns Icon prefix (e.g. 'fa', 'fas')
 */
export function getIconPrefix(iconName: string): string {
  if (!iconName) return 'fa';
  
  // Check for explicit style prefix
  if (iconName.startsWith('fas')) return 'fas';
  if (iconName.startsWith('far')) return 'far';
  if (iconName.startsWith('fal')) return 'fal';
  if (iconName.startsWith('fab')) return 'fab';
  
  // Default to 'fa' prefix (which will be treated as 'fal' light in our system)
  return 'fa';
}

/**
 * Get the path to an icon file
 * @param iconName The name of the icon
 * @param style The style of the icon (solid, light, etc)
 * @returns The path to the icon file
 */
export function getIconPath(iconName: string, style: string = 'light'): string {
  // Extract the base name (remove the fa prefix)
  const baseName = getIconBaseName(iconName);
  
  // Convert baseName to kebab-case for filename (e.g., UserCircle -> user-circle)
  const kebabName = baseName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, ''); // Remove leading dash if present
  
  // Special cases for different icon types
  if (iconName.startsWith('fab')) {
    // Brand/platform icons
    return `/icons/brands/${kebabName}.svg`;
  } else if (isKpiIcon(iconName)) {
    // KPI icons (awareness, consideration, etc)
    return `/icons/kpis/${kebabName}.svg`;
  } else if (isAppIcon(iconName)) {
    // App navigation icons
    return `/icons/app/${kebabName}.svg`;
  }
  
  // Default case: regular icons with style (light, solid)
  return `/icons/${style}/${kebabName}.svg`;
}

/**
 * Get the icon's style folder based on its prefix
 * @param prefix The icon prefix (fas, fal, etc)
 * @returns The style folder name (solid, light, etc)
 */
export function getStyleFromPrefix(prefix: string): string {
  switch (prefix) {
    case 'fas':
      return 'solid';
    case 'fal':
      return 'light';
    case 'fab':
      return 'brands';
    case 'far':
      return 'regular';
    default:
      return 'light'; // Default to light style
  }
}

/**
 * Get an array of all known app icon names
 * This is used to validate icon names and for autocompletion in dev tools
 */
export function getKnownAppIcons(): string[] {
  return [
    'faHome',
    'faCampaigns',
    'faBrandLift',
    'faBrandHealth',
    'faCreativeTest',
    'faMMM',
    'faInfluencers',
    'faReports',
    'faBilling',
    'faSettings',
    'faHelp'
  ];
}

/**
 * Get an array of all known KPI icon names
 * This is used to validate icon names and for autocompletion in dev tools
 */
export function getKnownKpiIcons(): string[] {
  return [
    'faAwareness',
    'faConsideration',
    'faFavorability',
    'faIntent',
    'faPreference',
    'faPurchase',
    'faRecommendation',
    'faRecall',
    'faSearch'
  ];
}

/**
 * Check if an icon is a KPI icon
 * @param iconName The icon name to check
 * @returns True if it's a KPI icon
 */
function isKpiIcon(iconName: string): boolean {
  const kpiIcons = getKnownKpiIcons();
  return kpiIcons.includes(iconName);
}

/**
 * Check if an icon is an App icon
 * @param iconName The icon name to check
 * @returns True if it's an App icon
 */
function isAppIcon(iconName: string): boolean {
  const appIcons = getKnownAppIcons();
  return appIcons.includes(iconName);
} 