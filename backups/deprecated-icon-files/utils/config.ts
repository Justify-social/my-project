/**
 * Configuration utilities for the icon system
 */

/**
 * Configuration object for the icon system
 */
export const iconConfig = {
  // Default icon style when no style is specified
  defaultStyle: 'light',
  
  // Whether to use hover effects by default on button icons
  useHoverEffects: true,
  
  // Default icon size
  defaultSize: 'md',
  
  // Default icon color
  defaultColor: 'currentColor',
  
  // Default action type
  defaultAction: 'default',
  
  // Different action color mappings
  actionColors: {
    default: 'var(--accent-color)',
    delete: 'var(--color-red-500)',
    warning: 'var(--color-yellow-500)',
    success: 'var(--color-green-500)'
  },
  
  // Whether to log warnings for missing icons
  logWarnings: process.env.NODE_ENV === 'development',
  
  // Whether to use the fallback icon for missing icons
  useFallbackIcon: true,
  
  // The fallback icon to use when an icon is not found
  fallbackIcon: 'faQuestion'
};

/**
 * Get the icon prefix based on the style
 * @param style The style of the icon
 * @returns The icon prefix (fa, fas, etc)
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
 * Should we use hover effects for this icon?
 * @param iconType The type of icon (button or static)
 * @returns Whether to use hover effects
 */
export function shouldUseHoverEffect(iconType: 'button' | 'static'): boolean {
  // Only use hover effects for button icons
  return iconType === 'button' && iconConfig.useHoverEffects;
}

/**
 * Get the color for an action type
 * @param action The action type (default, delete, warning, success)
 * @returns The color for the action
 */
export function getActionColor(action: 'default' | 'delete' | 'warning' | 'success'): string {
  return iconConfig.actionColors[action] || iconConfig.actionColors.default;
}

/**
 * Update the icon configuration
 * @param updates Partial updates to the icon configuration
 */
export function updateIconConfig(updates: Partial<typeof iconConfig>): void {
  Object.assign(iconConfig, updates);
}

/**
 * Icon styles
 */
export const ICON_STYLES = ['light', 'solid', 'regular', 'brands'] as const;
export type IconStyle = typeof ICON_STYLES[number];

/**
 * Icon sizes
 */
export const ICON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
export type IconSize = typeof ICON_SIZES[number];

/**
 * Icon types
 */
export const ICON_TYPES = ['button', 'static'] as const;
export type IconType = typeof ICON_TYPES[number];

/**
 * Action types
 */
export const ACTION_TYPES = ['default', 'delete', 'warning', 'success'] as const;
export type ActionType = typeof ACTION_TYPES[number];

// Export default as object containing all configuration for convenience
export default {
  iconConfig,
  getIconPrefix,
  shouldUseHoverEffect,
  getActionColor,
  updateIconConfig
}; 