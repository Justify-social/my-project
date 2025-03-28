/**
 * Icon Type Definitions
 * 
 * This file contains shared type definitions for the icon system.
 * It is separated to avoid circular dependencies between components.
 */

// Base icon types
export type IconName = string;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type PlatformName = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'x';
export type ActionType = 'default' | 'delete' | 'warning' | 'success';
export type IconType = 'button' | 'static';
export type IconStyle = 'solid' | 'light' | 'brands' | 'regular';

// Size constants
export const SIZE_CLASSES: Record<IconSize, string> = {
  'xs': 'w-3 h-3',
  'sm': 'w-4 h-4',
  'md': 'w-5 h-5',
  'lg': 'w-6 h-6',
  'xl': 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
  '4xl': 'w-16 h-16'
};

// Platform icon map
export const PLATFORM_ICON_MAP: Record<PlatformName, IconName> = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
} as const;

// SvgIcon props interface
export interface SvgIconProps {
  /**
   * Name of the icon to display
   */
  name: IconName;

  /**
   * CSS class names to apply to the icon
   */
  className?: string;

  /**
   * Size variant of the icon
   */
  size?: IconSize;

  /**
   * Optional title for accessibility
   */
  title?: string;

  /**
   * Click handler for the icon
   */
  onClick?: (e: React.MouseEvent<SVGElement>) => void;

  /**
   * Whether to apply a spin animation to the icon
   */
  spin?: boolean;

  /**
   * Whether to apply a pulse animation to the icon
   */
  pulse?: boolean;

  /**
   * Whether the icon should be flipped horizontally
   */
  flipHorizontal?: boolean;

  /**
   * Whether the icon should be flipped vertically
   */
  flipVertical?: boolean;

  /**
   * Degree rotation for the icon (0-360)
   */
  rotation?: 0 | 90 | 180 | 270;

  /**
   * Icon style (solid, light, etc) - by default uses the style from the icon prefix
   */
  style?: IconStyle;

  /**
   * Whether to use solid variant of the icon (alternative to style='solid')
   */
  solid?: boolean;

  /**
   * Whether the icon is in active state
   */
  active?: boolean;

  /**
   * Type of icon (button or static) - affects hover behavior
   */
  iconType?: IconType;

  /**
   * Action type of the icon - affects hover color
   */
  action?: ActionType;

  // Allow any other props to be passed through to the SVG element
  [key: string]: any;
}

// Platform icon props interface
export interface PlatformIconProps {
  /**
   * Name of the platform
   */
  platformName: PlatformName;

  /**
   * CSS class names to apply to the icon
   */
  className?: string;

  /**
   * Size variant of the icon
   */
  size?: IconSize;

  /**
   * Click handler for the icon
   */
  onClick?: (e: React.MouseEvent<SVGElement>) => void;
}

// Safe icon props interface
export interface SafeIconProps {
  icon: string;
  className?: string;
  solid?: boolean;
  size?: IconSize;
  iconType?: IconType;
  action?: ActionType;
  title?: string;
}