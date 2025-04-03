/**
 * Consolidated Type Definitions
 * Single source of truth for all icon-related types
 */

// Base icon types
export type IconName = string;
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type IconStyle = 'solid' | 'light' | 'regular' | 'brand';
export type PlatformName = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'x';
export type ActionType = 'default' | 'delete' | 'warning' | 'success';
export type IconType = 'button' | 'static';
export type IconVariant = 'light' | 'solid';

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

// Platform icon type map
export const PLATFORM_ICON_TYPE_MAP: Record<PlatformName, IconName> = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
} as const;

// Main Icon component props interface
export interface IconProps {
  /**
   * Name of the icon to display (can be a semantic name like 'add', a FontAwesome name like 'faUser', or a platform name like 'facebook')
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
   * Style variant of the icon (light, solid, etc.)
   */
  variant?: IconVariant;

  /**
   * Optional title for accessibility
   */
  title?: string;

  /**
   * Whether the icon is in active state (will use solid variant when true)
   */
  active?: boolean;

  /**
   * Optional text color override
   */
  color?: string;

  /**
   * Click handler for the icon
   */
  onClick?: () => void;

  // Allow any other props to be passed through to the element
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

/**
 * Registry metadata for an icon - aligns with icon-registry.json structure
 * This is the SSOT for the icon data structure
 */
export interface IconMetadata {
  /** Unique identifier for the icon */
  id: string;
  
  /** Display name for the icon */
  name: string;
  
  /** Category the icon belongs to (e.g., 'solid', 'light', 'app') */
  category: string;
  
  /** Path to the icon file */
  path: string;
  
  /** SVG viewBox attribute */
  viewBox?: string;
  
  /** Width of the icon */
  width?: number;
  
  /** Height of the icon */
  height?: number;
  
  /** Reference to FontAwesome or other mapping ID */
  map?: string | null;
  
  /** Optional usage count tracking */
  usageCount?: number;
  
  /** Optional tags for searchability */
  tags?: string[];
  
  /** Kebab-case version of the ID for path generation */
  kebabId?: string;
  
  /** SVG content for direct rendering - used in icon library but not registry */
  svgContent?: string;
  
  /** Weight/style of the icon */
  weight?: string;
  
  /** Version of the icon */
  version?: string;

  /** Added: For semantic icon mapping */
  semantic?: string;

  /** Added: For platform icons like 'facebook' */
  platform?: string;

  /** Added: For alternative icon names */
  alternatives?: string[];
}

export interface IconRegistryData {
  /** Array of icon metadata */
  icons: IconMetadata[];
  
  /** When the registry was last updated */
  lastUpdated?: string;
  
  /** Registry version */
  version?: string;
  
  /** When the registry was generated */
  generatedAt?: string;
  
  /** When the registry was updated */
  updatedAt?: string;
}

export interface IconUrlMapData {
  [key: string]: string;
}