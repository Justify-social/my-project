'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import cn from 'classnames';
import Image from 'next/image';
import { useIconValidation, useButtonIconValidation, validateDynamicName } from './validation';
import { SEMANTIC_TO_FA_MAP, getIconBaseName, getIconPath } from './icon-mappings';
import SafeIcon from '../safe-icon';

// Type definitions
type IconName = string;
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type PlatformName = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'x';

// Map of icon prefixes to style folders
const ICON_STYLE_FOLDERS = {
  'fas': 'solid',
  'fal': 'light',
  'fab': 'brands',
  'far': 'regular'
};

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
  style?: 'solid' | 'light' | 'brands' | 'regular';

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
  iconType?: 'button' | 'static';

  /**
   * Action type of the icon - affects hover color
   */
  action?: 'default' | 'delete' | 'warning' | 'success';

  // Allow any other props to be passed through to the SVG element
  [key: string]: any;
}
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

/**
 * Map of icon sizes to Tailwind CSS classes
 */
const SIZE_CLASSES: Record<IconSize, string> = {
  'xs': 'w-3 h-3',
  'sm': 'w-4 h-4',
  'md': 'w-5 h-5',
  'lg': 'w-6 h-6',
  'xl': 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
  '4xl': 'w-16 h-16'
};

/**
 * Map of platform names to their corresponding icon names
 */
const PLATFORM_ICON_MAP: Record<PlatformName, IconName> = {
  'facebook': 'faFacebook',
  'instagram': 'faInstagram',
  'linkedin': 'faLinkedin',
  'tiktok': 'faTiktok',
  'youtube': 'faYoutube',
  'x': 'faXTwitter'
} as const;

// We'll try to dynamically import the icon data when the script generates it
let iconData: Record<string, {
  width: number;
  height: number;
  path: string;
  url: string;
  prefix?: string; // Add prefix as it might come from the registry
  name?: string;
}> = {};

// This will be filled after running the icon scripts
try {
  // When icon-data.ts exists, this will work
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const importedData = require('./icon-data');
  iconData = importedData.iconData || {};
} catch (_error) {
  // If the import fails, we'll use direct file access instead
  console.warn('Icon data not found. Run the icon generation scripts or icons will be loaded from files.');
}

/**
 * Extracts the prefix/style of an icon
 */
function getIconPrefix(fullName: string): string {
  // If name is undefined or empty, return default prefix
  if (!fullName) {
    return 'fas'; // Default to solid as a fallback
  }

  // Special case for Light icons
  if (fullName.endsWith('Light')) {
    return 'fal';
  }

  // Check if there's a predefined prefix in the icon data
  const iconInfo = iconData[fullName];
  if (iconInfo && iconInfo.prefix) {
    return iconInfo.prefix;
  }

  // Default prefix based on first two letters (e.g., fa[b] for brands)
  const prefix = fullName.slice(0, 3).toLowerCase();
  if (Object.keys(ICON_STYLE_FOLDERS).includes(prefix)) {
    return prefix;
  }

  // Default to solid if no other prefixes match
  return 'fas';
}

/**
 * A modern SVG icon component that supports:
 * 1. Light vs Solid styles with hover effects 
 * 2. Different action colors (blue, red, yellow, green)
 * 3. Platform-specific icons
 */
export const SvgIcon = React.forwardRef<SVGSVGElement, SvgIconProps>(({
  name,
  platformName,
  kpiName,
  appName,
  size = 'md',
  className = '',
  color,
  iconType = 'static',
  active = false,
  solid = false,
  style,
  title,
  explicitStyle,
  action = 'default',
  onClick,
  spin = false,
  pulse = false,
  flipHorizontal = false,
  flipVertical = false,
  rotation = 0,
  ...rest
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const resolvedRef = (ref || svgRef) as React.RefObject<SVGSVGElement>;

  // Figure out which type of icon we're rendering
  const hasName = Boolean(name);
  const hasPlatformName = Boolean(platformName);
  const hasKpiName = Boolean(kpiName);
  const hasAppName = Boolean(appName);

  // Make sure at least one icon type is specified
  const isValidIcon = hasName || hasPlatformName || hasKpiName || hasAppName;

  // For platform specific icons, look up the name
  const iconName = hasPlatformName ? PLATFORM_ICON_MAP[platformName as PlatformName] :
  name || '';

  // Normalize icon name (handle special cases like icons from UI_ICON_MAP)
  const normalizedIconName = SEMANTIC_TO_FA_MAP[iconName] || iconName;
  
  // List of critical icons that need special handling
  const criticalIcons = ['faPenToSquare', 'faEdit', 'faEye', 'faCopy', 'faTrashCan'];
  const isCriticalIcon = criticalIcons.includes(normalizedIconName);
  
  // If this is a critical icon and it's a button type, use SafeIcon for robust rendering
  if (isCriticalIcon && iconType === 'button') {
    return (
      <SafeIcon 
        icon={normalizedIconName}
        className={className}
        solid={solid}
        iconType={iconType}
        size={size}
        action={action}
        title={title}
      />
    );
  }

  // Only use validation in development to avoid unnecessary overhead in production
  if (process.env.NODE_ENV === 'development') {
    // Validate icon name and properties, suppressing console warnings
    useIconValidation({
      name: normalizedIconName,
      solid,
      iconType,
      className
    });

    // Check if button icons have proper parent elements with group class
    useButtonIconValidation(resolvedRef as unknown as React.RefObject<HTMLElement>, iconType);
  }

  // Extract prefix (fa, fas, far, fal, fab) and base name
  const baseName = getIconBaseName(normalizedIconName);
  const defaultPrefix = getIconPrefix(normalizedIconName);

  // Determine which prefix to use based on props and defaults
  const useExplicitStyle = style ? `fa${style.charAt(0).toUpperCase()}${style.slice(1)}` : '';
  const useSolidStyle = solid || active; // Use solid style when active or explicitly requested
  const finalPrefix = useExplicitStyle || (useSolidStyle ? 'fas' : defaultPrefix);

  // Size class based on the size prop
  const sizeClass = SIZE_CLASSES[size as IconSize] || SIZE_CLASSES.md;

  // Helper for hover effects
  const getHoverClasses = () => {
    if (iconType !== 'button') return '';

    // For button icons, add transition effects
    const baseHoverClass = 'transition-colors duration-200';

    // Different classes based on the action type
    switch (action) {
      case 'delete':
        return `${baseHoverClass} group-hover:text-red-500`;
      case 'warning':
        return `${baseHoverClass} group-hover:text-yellow-500`;
      case 'success':
        return `${baseHoverClass} group-hover:text-green-500`;
      default:
        return `${baseHoverClass} group-hover:text-[var(--accent-color)]`;
    }
  };

  // Transform classes for spin, pulse, flip, and rotation
  const getTransformClasses = () => {
    const classes = [];

    if (spin) classes.push('animate-spin');
    if (pulse) classes.push('animate-pulse');

    // Flip transformations
    if (flipHorizontal && flipVertical) {
      classes.push('scale-x-[-1] scale-y-[-1]');
    } else if (flipHorizontal) {
      classes.push('scale-x-[-1]');
    } else if (flipVertical) {
      classes.push('scale-y-[-1]');
    }

    // Rotation
    if (rotation) {
      switch (rotation) {
        case 90:
          classes.push('rotate-90');
          break;
        case 180:
          classes.push('rotate-180');
          break;
        case 270:
          classes.push('rotate-270');
          break;
      }
    }

    return classes.join(' ');
  };

  // Compute CSS classes for the icon
  // Safely handling className which could be a string or dynamic value
  const cssClasses = useMemo(() => {
    // Start with base classes that are always applied
    const baseClasses = 'inline-block';

    // Add transformation classes
    const transformClasses = getTransformClasses();

    // Add hover effect classes if this is a button icon
    const hoverClasses = getHoverClasses();

    // Size classes based on the size prop
    const sizeClasses = SIZE_CLASSES[size as IconSize] || SIZE_CLASSES.md;

    // Special handling for className to safely handle dynamic values
    let safeClassName = '';
    try {
      // Attempt to use className directly if it's a string
      if (typeof className === 'string') {
        safeClassName = className;
      } else if (className && typeof className === 'object') {
        // For objects like Tailwind's clsx output, convert to string if possible
        safeClassName = String(className);
      }
    } catch (e) {
      // If anything goes wrong, just use an empty string
      console.warn('Error processing className in Icon component', e);
    }

    // Combine all classes, handling dynamic className safely
    return cn(
      baseClasses,
      sizeClasses,
      transformClasses,
      hoverClasses,
      safeClassName
    );
  }, [size, spin, pulse, flipHorizontal, flipVertical, rotation, iconType, action, className]);

  // Determine if we need to use SVG or Next.js Image component
  const useNextImage = false; // Currently not using Next.js Image for icons

  // Check if icon exists in our icon-data.ts file
  // For button icons, we need to handle both the default (light) and hover (solid) states
  const isButtonIcon = iconType === 'button';
  const iconKey = `${normalizedIconName}${solid ? '' : 'Light'}`;
  const iconExists = Boolean(iconData[iconKey]?.path);

  // If icon data is not found, use a fallback question mark icon
  const finalIconName = iconExists ? normalizedIconName : 'faQuestion';

  // Add detection for missing 'group' class on parent elements
  const hasGroupClassParent = useMemo(() => {
    // Only check in browser environment
    if (typeof window === 'undefined') return true;
    if (!resolvedRef.current) return true;
    
    const parentElement = resolvedRef.current.parentElement;
    return parentElement && parentElement.classList.contains('group');
  }, [resolvedRef]);

  // Check if this is an edit icon (faEdit or faPenToSquare)
  const isEditIcon = normalizedIconName === 'faEdit' || normalizedIconName === 'faPenToSquare';
  
  // Use alternate behavior if it's a button icon without a 'group' parent or if it's an edit icon
  const useAlternateBehavior = isButtonIcon && (!hasGroupClassParent || isEditIcon);

  // For button icons, we need a different approach to handle hover
  let finalIconKey;
  let hoverIconKey;

  if (isButtonIcon) {
    // Button icons use Light variant by default and Solid on hover
    finalIconKey = `${finalIconName}Light`;
    hoverIconKey = `${finalIconName}`; // Solid version (no Light suffix)
  } else {
    // Static icons just use whatever was specified (solid or light)
    finalIconKey = `${finalIconName}${solid ? '' : 'Light'}`;
  }

  const finalIconData = iconData[finalIconKey] || {
    width: 512,
    height: 512,
    path: '', // Will use file path instead
    url: getIconPath(finalIconName, solid ? 'solid' : 'light')
  };

  // For button icons, also get the hover (solid) icon data
  const hoverIconData = isButtonIcon ? iconData[hoverIconKey || ''] || {
    width: 512,
    height: 512,
    path: '',
    url: getIconPath(finalIconName, 'solid')
  } : null;

  // Get the correct icon URL based on the style
  const iconStyle = solid ? 'solid' : 'light';
  const iconUrl = getIconPath(normalizedIconName, iconStyle);

  // If DEV mode, log debug info when parent group class is missing
  if (process.env.NODE_ENV === 'development' && isButtonIcon && !hasGroupClassParent) {
    console.debug(`[Icon System] Button icon "${normalizedIconName}" missing parent 'group' class. Using fallback rendering.`, {
      icon: normalizedIconName,
      element: resolvedRef.current?.parentElement?.tagName || 'unknown'
    });
  }

  // Pass the appropriate CSS classes and SVG path to svg element
  return (
    <svg
      ref={resolvedRef}
      className={cssClasses}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${finalIconData.width} ${finalIconData.height}`}
      fill="currentColor"
      aria-hidden={!title}
      role={title ? 'img' : 'presentation'}
      onClick={onClick}
      {...rest}>

      {title && <title className="font-sora">{title}</title>}
      {/* For button icons with proper group class, use two paths - otherwise use simpler approach */}
      {isButtonIcon && !useAlternateBehavior ?
      <>
          <path
          d={finalIconData.path || ''}
          className="group-hover:opacity-0 transition-opacity duration-200" />

          <path
          d={hoverIconData?.path || ''}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        </> :

      <path d={finalIconData.path || ''} />
      }
    </svg>);

});
SvgIcon.displayName = 'SvgIcon';

/**
 * Platform Icon component - convenience wrapper for social media icons
 */
export function PlatformIcon({
  platformName,
  className,
  size = 'md',
  onClick
}: PlatformIconProps) {
  // Convert platform name to corresponding icon name
  const iconName = PLATFORM_ICON_MAP[platformName];

  // Simple validation
  if (!iconName) {
    console.warn(`Unknown platform name: ${platformName}`);
    return null;
  }
  return <SvgIcon name={iconName} className={className} size={size} onClick={onClick} solid={false} />;
}

/**
 * This is a drop-in replacement for the FontAwesome-based Icon component.
 * Uses local SVG files for maximum reliability.
 */
export const Icon = SvgIcon;