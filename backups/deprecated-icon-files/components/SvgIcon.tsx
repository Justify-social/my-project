'use client';

import React, { useRef, useMemo, useEffect, useState, forwardRef } from 'react';
import { SvgIconProps, PlatformIconProps, IconSize, IconName, PlatformName, SIZE_CLASSES, PLATFORM_ICON_MAP } from '../types';
import cn from 'classnames';
import { validateDynamicName } from '../utils';
import { SEMANTIC_TO_FA_MAP, getIconBaseName, getIconPath, getIconPrefix, shouldUseHoverEffect, getActionColor, iconConfig } from '../utils';
import { SafeIcon } from './SafeIcon';
import { iconData } from '../data'; // Import from the index file

// Map of icon prefixes to style folders
const ICON_STYLE_FOLDERS = {
  'fas': 'solid',
  'fal': 'light',
  'fab': 'brands',
  'far': 'regular'
};

/**
 * A modern SVG icon component that supports:
 * 1. Light vs Solid styles with hover effects 
 * 2. Different action colors (blue, red, yellow, green)
 * 3. Platform-specific icons
 */
const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => {
  const {
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
  } = props;
  
  const svgRef = useRef<SVGSVGElement>(null);
  const resolvedRef = (ref || svgRef) as React.RefObject<SVGSVGElement>;

  // IMPORTANT: Always declare hooks at the top level
  const [svgContent, setSvgContent] = useState<string | null>(null);
  
  // Figure out which type of icon we're rendering
  const hasName = Boolean(name);
  const hasPlatformName = Boolean(platformName);
  const hasKpiName = Boolean(kpiName);
  const hasAppName = Boolean(appName);

  // Make sure at least one icon type is specified
  const isValidIcon = hasName || hasPlatformName || hasKpiName || hasAppName;

  // For platform specific icons, look up the name
  // For KPI and App icons, use those directly
  let iconName = '';
  if (hasPlatformName) {
    iconName = PLATFORM_ICON_MAP[platformName as PlatformName];
  } else if (hasKpiName) {
    iconName = `fa${kpiName}`;
  } else if (hasAppName) {
    iconName = `fa${appName}`;
  } else {
    iconName = name || '';
  }

  // Normalize icon name (handle special cases like icons from UI_ICON_MAP)
  const normalizedIconName = SEMANTIC_TO_FA_MAP[iconName] || iconName;
  
  // List of critical icons that need special handling
  const criticalIcons = ['faPenToSquare', 'faEdit', 'faEye', 'faCopy', 'faTrashCan'];
  const isCriticalIcon = criticalIcons.includes(normalizedIconName);
  
  // Check if this is a critical icon and it's a button type
  const isCriticalButtonIcon = isCriticalIcon && iconType === 'button';
  
  // Extract prefix (fa, fas, far, fal, fab) and base name, only if not using SafeIcon
  const baseName = !isCriticalButtonIcon ? getIconBaseName(normalizedIconName) : '';
  const defaultPrefix = !isCriticalButtonIcon ? getIconPrefix(normalizedIconName) : '';

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

  // Check if icon exists in our icon-data.ts file
  // For button icons, we need to handle both the default (light) and hover (solid) states
  const isButtonIcon = iconType === 'button';
  const iconKey = `${normalizedIconName}${solid ? '' : 'Light'}`;
  const iconExists = Boolean(iconData[iconKey]?.path);

  // If icon data is not found, use a fallback question mark icon
  const finalIconName = iconExists ? normalizedIconName : 'faQuestion';

  // Add detection for missing 'group' class on parent elements - moved outside of conditional blocks
  const hasGroupClassParent = useMemo(() => {
    // Only check in browser environment
    if (typeof window === 'undefined') return true;
    if (!resolvedRef.current) return true;
    
    const parentElement = resolvedRef.current.parentElement;
    return parentElement ? parentElement.classList.contains('group') : false;
  }, [resolvedRef]);

  // Check if this is an edit icon (faEdit or faPenToSquare)
  const isEditIcon = normalizedIconName === 'faEdit' || normalizedIconName === 'faPenToSquare';
  
  // Use alternate behavior if it's a button icon without a 'group' parent or if it's an edit icon
  const useAlternateBehavior = isButtonIcon && (!hasGroupClassParent || isEditIcon);

  // Early return for critical button icons
  if (isCriticalButtonIcon) {
    return (
      <SafeIcon 
        icon={normalizedIconName}
        className={className}
        solid={solid}
        iconType={iconType}
        size={size as IconSize}
        action={action}
        title={title}
      />
    );
  }

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

  // Get the correct icon URL based on the style
  const iconStyle = solid ? 'solid' : 'light';
  const iconUrl = getIconPath(finalIconName, iconStyle);

  const finalIconData = iconData[finalIconKey] || {
    width: 512,
    height: 512,
    path: '', // Will use file path instead
    url: iconUrl
  };

  // For button icons, also get the hover (solid) icon data
  const hoverIconData = isButtonIcon ? iconData[hoverIconKey || ''] || {
    width: 512,
    height: 512,
    path: '',
    url: getIconPath(finalIconName, 'solid')
  } : null;

  // If DEV mode, log debug info when parent group class is missing
  if (process.env.NODE_ENV === 'development' && isButtonIcon && !hasGroupClassParent) {
    console.debug(`[Icon System] Button icon "${normalizedIconName}" missing parent 'group' class. Using fallback rendering.`, {
      icon: normalizedIconName,
      element: resolvedRef.current?.parentElement?.tagName || 'unknown'
    });
  }
  
  useEffect(() => {
    // Only fetch SVG if we don't have path data and we're in the browser
    if (!finalIconData.path && typeof window !== 'undefined' && iconUrl) {
      // Check if we already have this SVG in cache
      const cacheKey = `svg-cache-${iconUrl}`;
      const cached = (window as any)[cacheKey];
      
      if (cached) {
        setSvgContent(cached);
      } else {
        fetch(iconUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load SVG from ${iconUrl}`);
            }
            return response.text();
          })
          .then(text => {
            // Extract the SVG content
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'image/svg+xml');
            const svgElement = doc.querySelector('svg');
            
            if (svgElement) {
              // Get the inner content (paths, etc.)
              const content = svgElement.innerHTML;
              // Cache the content
              (window as any)[cacheKey] = content;
              setSvgContent(content);
            } else {
              console.warn(`[Icon System] SVG file at ${iconUrl} does not contain an SVG element.`);
            }
          })
          .catch(error => {
            console.error(`[Icon System] Error loading SVG from ${iconUrl}:`, error);
          });
      }
    }
  }, [finalIconData.path, iconUrl]);

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
      {isButtonIcon && !useAlternateBehavior ? (
        <>
          <path
            d={finalIconData.path || ''}
            className="group-hover:opacity-0 transition-opacity duration-200" />

          <path
            d={hoverIconData?.path || ''}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </>
      ) : (
        finalIconData.path ? (
          <path d={finalIconData.path} />
        ) : (
          svgContent ? (
            <g dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            // Fallback to question mark path if we couldn't load the SVG
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32z" />
          )
        )
      )}
    </svg>
  );
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
export { SvgIcon }; 