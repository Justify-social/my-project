/**
 * Icon Configuration
 * 
 * This file serves as the central configuration for all UI icons in the application.
 * It defines the default icon style and hover behavior to ensure consistent
 * icon rendering across the entire application.
 */

// For type safety, we'll define our own IconName type that matches our component needs
import { IconPrefix as FAIconPrefix } from '@fortawesome/fontawesome-svg-core';
export type IconPrefix = FAIconPrefix;

// Our custom IconName matches the keys in our icon maps
export type IconName = 
  | 'user' | 'search' | 'plus' | 'minus' | 'close' | 'check'
  | 'chevronDown' | 'chevronUp' | 'chevronLeft' | 'chevronRight'
  | 'settings' | 'mail' | 'calendar' | 'warning'
  | 'info' | 'bell' | 'documentText' | 'document' | 'money'
  | 'bolt' | 'arrowPath' | 'arrowUp' | 'arrowDown' | 'arrowLeft'
  | 'arrowRight' | 'home' | 'globe' | 'bookmark' | 'heart'
  | 'star' | 'edit' | 'view' | 'copy' | 'delete' | 'chatBubble'
  | 'download' | 'upload' | 'filter' | 'list' | 'menu' | 'grid'
  | 'map' | 'building' | 'clock' | 'key' | 'lightBulb' | 'lightning'
  | 'lock' | 'minus' | 'paperclip' | 'play' | 'rocket' | 'share'
  | 'shield' | 'signal' | 'swatch' | 'tableCells' | 'tag'
  | 'trendDown' | 'trendUp' | 'unlock' | 'userCircle' | 'userGroup'
  | 'xCircle' | 'xMark' | 'photo';

export const iconConfig = {
  /**
   * Default icon style
   * Options: 'light', 'solid', 'regular', 'brand'
   * - For UI icons, we use 'light' by default
   * - For hover/active states, we use 'solid'
   */
  defaultStyle: 'light',
  
  /**
   * Icon types and their behavior
   */
  types: {
    /**
     * Static icons are used for visual/informational purposes only
     * They do not change on hover or click
     */
    static: {
      hoverEffect: false,
      solidOnHover: false,
      colorOnHover: false
    },
    
    /**
     * Button icons are interactive and change on hover/click
     * They switch from light to solid style and may change color
     */
    button: {
      hoverEffect: true,
      solidOnHover: true,
      colorOnHover: true
    }
  },
  
  /**
   * Default hover behavior
   * When true, icons change from light to solid on hover
   */
  hoverEffect: true,
  
  /**
   * Maps the style name to the font-awesome prefix
   */
  styleToPrefix: {
    light: 'fal',
    solid: 'fas',
    regular: 'far',
    brand: 'fab'
  },
  
  /**
   * Icon colors
   */
  colors: {
    default: '#333333',    // Jet color for regular state
    hover: '#00BFFF',      // Deep Sky Blue color for hover
    active: '#00BFFF',     // Deep Sky Blue color for active state
    danger: '#FF3B30',     // Red color for dangerous actions (delete, remove)
    warning: '#FFCC00',    // Yellow color for warning actions
    success: '#34C759'     // Green color for success actions
  },
  
  /**
   * Action type to color mapping
   */
  actionColors: {
    delete: 'danger',
    remove: 'danger',
    warning: 'warning',
    success: 'success',
    default: 'hover'
  }
};

/**
 * Helper function to get the icon prefix based on the desired style
 * @param style The icon style
 * @returns The corresponding font-awesome prefix
 */
export function getIconPrefix(style: keyof typeof iconConfig.styleToPrefix = 'light'): string {
  return iconConfig.styleToPrefix[style] || 'fal';
}

/**
 * Helper function to determine if an icon should use hover effects based on its type
 * @param type The icon type ('static' or 'button')
 * @returns Boolean indicating if hover effects should be applied
 */
export function shouldUseHoverEffect(type: 'static' | 'button' = 'button'): boolean {
  return iconConfig.types[type]?.hoverEffect ?? iconConfig.hoverEffect;
}

/**
 * Helper function to get the appropriate hover color based on the action
 * @param action The action type (e.g., 'delete', 'default')
 * @returns The appropriate color from the iconConfig
 */
export function getActionColor(action: string = 'default'): string {
  const colorKey = iconConfig.actionColors[action as keyof typeof iconConfig.actionColors] || 'hover';
  return iconConfig.colors[colorKey as keyof typeof iconConfig.colors];
} 