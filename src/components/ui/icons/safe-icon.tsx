'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition, findIconDefinition, IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';
import { faQuestion } from '@fortawesome/pro-solid-svg-icons';
import * as solidIcons from '@fortawesome/pro-solid-svg-icons';
import { cn } from '@/lib/utils';
import classNames from 'classnames';

// Map of camelCase names to kebab-case for FA
const iconNameMap: Record<string, string> = {
  search: 'magnifying-glass',
  close: 'xmark',
  settings: 'gear',
  mail: 'envelope',
  warning: 'triangle-exclamation',
  info: 'circle-info'
  // Add more mappings as needed
};

// Convert our internal icon name to FontAwesome format
function normalizeFaIconName(name: string): {
  prefix: IconPrefix;
  iconName: IconName;
} {
  // If name already contains a hyphen, assume it's already in FA format
  if (name.includes('-')) {
    return {
      prefix: 'fas' as IconPrefix,
      iconName: name as IconName
    };
  }

  // Convert camelCase to kebab-case
  const faName = iconNameMap[name] || name;
  const kebabCase = faName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return {
    prefix: 'fas' as IconPrefix,
    iconName: kebabCase as IconName
  };
}

// Try to find a solid icon that matches the given name
function getSolidIcon(name: string): IconDefinition | null {
  try {
    // Direct method via findIconDefinition
    const {
      prefix,
      iconName
    } = normalizeFaIconName(name);
    const definition = findIconDefinition({
      prefix,
      iconName
    });
    if (definition) return definition;

    // Try direct access to solidIcons
    // Transform kebab-case to camelCase for direct object lookup
    const camelCase = iconName.replace(/-([a-z])/g, g => g[1].toUpperCase());
    const iconKey = `fa${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}`;

    // @ts-ignore - dynamic access
    if (solidIcons[iconKey]) return solidIcons[iconKey];
    return null;
  } catch (e) {
    console.error(`[SafeIcon] Error finding icon '${name}':`, e);
    return null;
  }
}

// Function to dynamically load SVG paths from files (for future enhancements)
function loadSvgPathFromFile(iconName: string, style: 'light' | 'solid'): string | null {
  try {
    // In a real implementation, this would fetch the SVG file and extract the path
    // For now, we're just providing a placeholder that returns null
    const filePath = `/ui-icons/${style}/${iconName.replace(/^fa/, '').replace(/([A-Z])/g, '-$1').toLowerCase()}.svg`;
    // Here we would fetch and parse the SVG file
    // This is a simplified implementation
    return null;
  } catch (e) {
    console.warn(`Failed to load SVG path for ${iconName} (${style})`, e);
    return null;
  }
}

// For direct icon fallback paths
const CRITICAL_ICONS: Record<string, {
  solidPath: string;
  lightPath: string;
  width: number;
  height: number;
}> = {
  faPenToSquare: {
    solidPath: "M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z",
    lightPath: "M454.6 45.3l12.1 12.1c12.5 12.5 12.5 32.8 0 45.3L440 129.4 382.6 72l26.7-26.7c12.5-12.5 32.8-12.5 45.3 0zM189 265.6l171-171L417.4 152l-171 171c-4.2 4.2-9.6 7.2-15.4 8.6l-65.6 15.1L180.5 281c1.3-5.8 4.3-11.2 8.6-15.4zm197.7-243L166.4 243c-8.5 8.5-14.4 19.2-17.1 30.9l-20.9 90.6c-1.2 5.4 .4 11 4.3 14.9s9.5 5.5 14.9 4.3l90.6-20.9c11.7-2.7 22.4-8.6 30.9-17.1L489.4 125.3c25-25 25-65.5 0-90.5L477.3 22.6c-25-25-65.5-25-90.5 0zM80 64C35.8 64 0 99.8 0 144L0 432c0 44.2 35.8 80 80 80l288 0c44.2 0 80-35.8 80-80l0-128c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 128c0 26.5-21.5 48-48 48L80 480c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48l128 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 64z",
    width: 512,
    height: 512
  },
  faEdit: {
    solidPath: "M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z",
    lightPath: "M454.6 45.3l12.1 12.1c12.5 12.5 12.5 32.8 0 45.3L440 129.4 382.6 72l26.7-26.7c12.5-12.5 32.8-12.5 45.3 0zM189 265.6l171-171L417.4 152l-171 171c-4.2 4.2-9.6 7.2-15.4 8.6l-65.6 15.1L180.5 281c1.3-5.8 4.3-11.2 8.6-15.4zm197.7-243L166.4 243c-8.5 8.5-14.4 19.2-17.1 30.9l-20.9 90.6c-1.2 5.4 .4 11 4.3 14.9s9.5 5.5 14.9 4.3l90.6-20.9c11.7-2.7 22.4-8.6 30.9-17.1L489.4 125.3c25-25 25-65.5 0-90.5L477.3 22.6c-25-25-65.5-25-90.5 0zM80 64C35.8 64 0 99.8 0 144L0 432c0 44.2 35.8 80 80 80l288 0c44.2 0 80-35.8 80-80l0-128c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 128c0 26.5-21.5 48-48 48L80 480c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48l128 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 64z",
    width: 512,
    height: 512
  },
  faEye: {
    solidPath: "M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z",
    lightPath: "M117.2 136C160.3 96 217.6 64 288 64s127.7 32 170.8 72c43.1 40 71.9 88 85.2 120c-13.3 32-42.1 80-85.2 120c-43.1 40-100.4 72-170.8 72s-127.7-32-170.8-72C74.1 336 45.3 288 32 256c13.3-32 42.1-80 85.2-120zM288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM192 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z",
    width: 576,
    height: 512
  },
  faCopy: {
    solidPath: "M224 0c-35.3 0-64 28.7-64 64V288c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H224zM64 160c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H288c35.3 0 64-28.7 64-64V384H288v64H64V224h64V160H64z",
    lightPath: "M448 352H288c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32H396.1c4.2 0 8.3 1.7 11.3 4.7l67.9 67.9c3 3 4.7 7.1 4.7 11.3V320c0 17.7-14.3 32-32 32zM497.9 81.9L430.1 14.1c-9-9-21.2-14.1-33.9-14.1H288c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H224c35.3 0 64-28.7 64-64V416H256v32c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32H192V128H64z",
    width: 512,
    height: 512
  },
  faTrashCan: {
    solidPath: "M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z",
    lightPath: "M164.2 39.5L148.9 64H299.1L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5H177.7c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64H384h32 16c8.8 0 16 7.2 16 16s-7.2 16-16 16H416V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V96H16C7.2 96 0 88.8 0 80s7.2-16 16-16H32 64h47.1L137 22.6C145.8 8.5 161.2 0 177.7 0h92.5c16.6 0 31.9 8.5 40.7 22.6zM64 96V432c0 26.5 21.5 48 48 48H336c26.5 0 48-21.5 48-48V96H64zm80 80V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V176c0-8.8 7.2-16 16-16s16 7.2 16 16z",
    width: 448,
    height: 512
  }
};

/**
 * Safe Icon Component that provides fallback for critical icons
 */
export const SafeIcon = forwardRef<
  HTMLDivElement,
  {
    icon: any;
    className?: string;
    solid?: boolean;
    iconType?: 'button' | 'static';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    action?: string;
    title?: string;
  }
>(({ icon, className, solid, iconType = 'static', size = 'md', action, title }, ref) => {
  // Add loading state
  const [isReady, setIsReady] = useState(false);

  // Determine if we need to use fallback rendering
  const iconName = typeof icon === 'string' ? icon : '';
  const needsFallback = !icon || (typeof icon === 'string' && Object.prototype.hasOwnProperty.call(CRITICAL_ICONS, iconName));
  const directIconPath = needsFallback && typeof icon === 'string' && Object.prototype.hasOwnProperty.call(CRITICAL_ICONS, iconName) 
    ? CRITICAL_ICONS[iconName] 
    : null;
  
  // Set up the loading state
  useEffect(() => {
    // Simulate path resolution delay
    const timer = setTimeout(() => setIsReady(true), 10);
    return () => clearTimeout(timer);
  }, [iconName]);

  // Add fallback handling for missing paths
  if (directIconPath && process.env.NODE_ENV === 'development') {
    // Validate that we have different paths for light and solid
    if (directIconPath.lightPath === directIconPath.solidPath) {
      console.warn(`[SafeIcon] Icon ${iconName} has identical light and solid paths. Hover effect won't be visible.`);
    }
  }
  
  // Safety mechanism for missing paths
  const lightPath = directIconPath?.lightPath || loadSvgPathFromFile(iconName, 'light') || directIconPath?.solidPath || '';
  const solidPath = directIconPath?.solidPath || loadSvgPathFromFile(iconName, 'solid') || directIconPath?.lightPath || '';
  
  // Size classes map
  const sizeClasses = {
    'xs': 'w-3 h-3',
    'sm': 'w-4 h-4',
    'md': 'w-5 h-5',
    'lg': 'w-6 h-6',
    'xl': 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };
  
  // Show loading state if not ready
  if (!isReady) {
    return <div className={classNames('skeleton', sizeClasses[size], className)} />;
  }
  
  // Color classes based on action type
  const getActionColor = () => {
    if (action === 'delete') return 'text-red-500 group-hover:text-red-600';
    if (action === 'warning') return 'text-yellow-500 group-hover:text-yellow-600';
    if (action === 'success') return 'text-green-500 group-hover:text-green-600';
    return iconType === 'button' 
      ? 'text-gray-500 group-hover:text-[var(--accent-color)]' 
      : 'text-current';
  };
  
  // Special handling for button icons to ensure hover effects work
  const hoverClasses = 
    iconType === 'button' 
      ? solid 
        ? 'opacity-100'  // Always visible if solid requested
        : 'opacity-100 group-hover:opacity-0' // Light version (visible by default, hidden on hover)
      : ''; // No hover effect for static icons
  
  const solidHoverClasses = 
    iconType === 'button' && !solid
      ? 'opacity-0 group-hover:opacity-100' // Solid version (hidden by default, visible on hover)
      : ''; // No hover effect for static icons

  // Use direct path rendering for critical icons
  if (directIconPath) {
    // Add additional debugging attributes in development
    const debugAttributes = process.env.NODE_ENV === 'development' ? {
      'data-icon-name': iconName,
      'data-icon-type': iconType,
      'data-has-light-path': Boolean(directIconPath.lightPath).toString(),
      'data-has-solid-path': Boolean(directIconPath.solidPath).toString()
    } : {};

    return (
      <div ref={ref} className={classNames('relative', className)} {...debugAttributes}>
        {/* Light version (shown by default) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox={`0 0 ${directIconPath.width} ${directIconPath.height}`}
          className={classNames(
            sizeClasses[size], 
            getActionColor(),
            'absolute top-0 left-0 transition-opacity duration-200',
            hoverClasses
          )}
          fill="currentColor"
          aria-hidden={!title}
          role={title ? 'img' : 'presentation'}
        >
          {title && <title>{title}</title>}
          <path d={lightPath} />
        </svg>
        
        {/* Solid version (shown on hover) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox={`0 0 ${directIconPath.width} ${directIconPath.height}`}
          className={classNames(
            sizeClasses[size], 
            getActionColor(),
            'transition-opacity duration-200',
            solidHoverClasses
          )}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={solidPath} />
        </svg>
      </div>
    );
  }
  
  // Fallback to question mark icon if no direct path available
  return (
    <div ref={ref} className={classNames('relative', className)}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 320 512"
        className={classNames(
          sizeClasses[size],
          getActionColor()
        )}
        fill="currentColor"
        aria-hidden={!title}
        role={title ? 'img' : 'presentation'}
      >
        {title && <title>{title}</title>}
        <path d="M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
      </svg>
    </div>
  );
});

SafeIcon.displayName = 'SafeIcon';
export default SafeIcon;