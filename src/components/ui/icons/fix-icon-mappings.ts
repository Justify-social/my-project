/**
 * fix-icon-mappings.ts
 * 
 * Enhanced icon mapping system with robust fallback mechanisms
 * to ensure icons display correctly even with naming inconsistencies.
 */

/**
 * Type for icon names in our system
 */
export type IconName = string;

/**
 * Additional mappings to ensure backward compatibility
 * This ensures aliases like faEdit properly resolve to their SVG files
 */
export const ADDITIONAL_ICON_MAPPINGS: Record<string, string> = {
  // Edit icon mappings - ensure both names work
  'faEdit': '/ui-icons/solid/pen-to-square.svg',
  'faEditLight': '/ui-icons/light/pen-to-square.svg',
  'faPenToSquare': '/ui-icons/solid/pen-to-square.svg',
  'faPenToSquareLight': '/ui-icons/light/pen-to-square.svg',
  
  // Add other problematic icon mappings here as needed
  'faTrashAlt': '/ui-icons/solid/trash-can.svg',
  'faTrashAltLight': '/ui-icons/light/trash-can.svg',
  
  'faClose': '/ui-icons/solid/xmark.svg',
  'faCloseLight': '/ui-icons/light/xmark.svg',
  
  'faUserCircle': '/ui-icons/solid/circle-user.svg',
  'faUserCircleLight': '/ui-icons/light/circle-user.svg'
};

/**
 * Gets an icon path with multiple fallback strategies
 * @param iconName The name of the icon (e.g., faPenToSquare, faEdit)
 * @param style The style of the icon (solid, light, etc.)
 * @returns The path to the icon SVG file
 */
export function getReliableIconPath(iconName: string, style: string = 'solid'): string {
  // Return empty for undefined icons
  if (!iconName) return '';
  
  // 1. First try direct mapping from our additional mappings
  const directPath = getDirectMapping(iconName);
  if (directPath) return directPath;
  
  // 2. Handle Light suffix in the icon name
  const hasLightSuffix = iconName.endsWith('Light');
  const baseIconName = hasLightSuffix ? iconName.slice(0, -5) : iconName;
  const effectiveStyle = hasLightSuffix ? 'light' : style;
  
  // 3. Try additional mappings with the resolved base name
  if (hasLightSuffix) {
    const lightMappingPath = getDirectMapping(`${baseIconName}Light`);
    if (lightMappingPath) return lightMappingPath;
  } else {
    const solidMappingPath = getDirectMapping(baseIconName);
    if (solidMappingPath) return solidMappingPath;
  }
  
  // 4. Default to kebab-case conversion for the filename
  const kebabName = baseIconName
    .replace(/^fa/, '') // Remove fa prefix
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .toLowerCase();
  
  // Return the full path
  return `/ui-icons/${effectiveStyle}/${kebabName}.svg`;
}

/**
 * Helper to get a direct mapping from ADDITIONAL_ICON_MAPPINGS
 */
function getDirectMapping(iconName: string): string | undefined {
  return ADDITIONAL_ICON_MAPPINGS[iconName];
}

/**
 * Icons that require special handling when converting from FA to SVG names
 */
export const SPECIAL_ICON_MAPPINGS: Record<string, string> = {
  'faXTwitter': 'x-twitter',
  'faChevronRight': 'chevron-right',
  'faChevronLeft': 'chevron-left',
  'faChevronUp': 'chevron-up',
  'faChevronDown': 'chevron-down'
};

/**
 * Enhanced function to get the base name of an icon
 * Handles special cases and provides better error recovery
 */
export function getEnhancedIconBaseName(iconName: string): string {
  if (!iconName) return 'question'; // Fallback for missing names
  
  // Remove Light suffix if present
  const nameWithoutLightSuffix = iconName.replace(/Light$/, '');
  
  // Check special mappings first
  if (SPECIAL_ICON_MAPPINGS[nameWithoutLightSuffix]) {
    return SPECIAL_ICON_MAPPINGS[nameWithoutLightSuffix];
  }
  
  // Standard conversion
  return nameWithoutLightSuffix
    .replace(/^fa/, '') // Remove fa prefix
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .toLowerCase();
} 