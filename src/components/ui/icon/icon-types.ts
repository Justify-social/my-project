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

// Define common props shared across different icon components
interface CommonIconProps {
  className?: string;
  size?: IconSize;
  title?: string;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  // Add other common attributes if needed, potentially extend React.HTMLAttributes<HTMLElement>
}

// Size constants
export const SIZE_CLASSES: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
  '4xl': 'w-16 h-16',
};

// Platform icon type map
export const PLATFORM_ICON_TYPE_MAP: Record<PlatformName, IconName> = {
  facebook: 'faFacebook',
  instagram: 'faInstagram',
  linkedin: 'faLinkedin',
  tiktok: 'faTiktok',
  youtube: 'faYoutube',
  x: 'faXTwitter',
} as const;

/**
 * Icon component props
 */
export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The icon ID with explicit variant suffix (e.g. 'faUserLight', 'faUserSolid')
   * This is the preferred and most direct way to specify an icon
   */
  iconId: string;

  /**
   * Optional CSS class to apply to the icon
   */
  className?: string;

  /**
   * Size of the icon (mapped to Tailwind classes)
   * @default 'md'
   */
  size?: IconSize;

  /**
   * Optional accessibility title for the icon
   */
  title?: string;

  /**
   * Optional click handler for the icon
   */
  onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
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
  name?: string;

  /** Category the icon belongs to (e.g., 'solid', 'light') */
  category?: string;

  /** Path to the icon file */
  path?: string;

  /** ViewBox dimensions for SVG */
  viewBox?: string;

  /** Width of the icon */
  width?: number;

  /** Height of the icon */
  height?: number;

  /** Icon mapping data */
  map?: string;

  /** Counter for icon usage in the app */
  usageCount?: number;

  /** Tags for searchability */
  tags?: string[];

  /** Kebab-case ID for the icon */
  kebabId?: string;

  /** SVG content of the icon */
  svgContent?: string;

  /** Weight of the icon (e.g., 'regular', 'light', 'solid') */
  weight?: string;

  /** Version number of the icon */
  version?: string;

  /** Semantic name/purpose of the icon */
  semantic?: string;

  /** Platform the icon represents (e.g., 'twitter', 'facebook') */
  platform?: string;

  /** Alternative icons that can be used */
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

  /** Description of the registry */
  description?: string;
}

export interface IconUrlMapData {
  [key: string]: string;
}

/** Props for rendering an error state */
export interface ErrorProps extends CommonIconProps {
  error: Error | string; // Allow Error object or string message
}
