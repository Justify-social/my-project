'use client';

/**
 * FontAwesome Icon Adapter - CANONICAL IMPLEMENTATION
 * 
 * This adapter provides a compatibility layer for legacy FontAwesome icon usage.
 * It implements the SSOT pattern by ultimately rendering through the core Icon component.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <IconAdapter iconId="faChevronDownLight" />
 * 
 * // Legacy usage with solid prop (not recommended for new code)
 * <IconAdapter iconId="faChevronDown" solid={true} />
 * ```
 * 
 * For new components, prefer the ShadcnIcon adapter or direct Icon usage.
 */

import React from 'react';
import { Icon } from '../icon';
import { IconProps, IconStyle } from '../icon-types';

/**
 * Adapter props for legacy components
 */
export interface IconAdapterProps {
  /**
   * The iconId to render with explicit variant suffix (required)
   * For SSOT compliance, prefer using the full ID with variant suffix:
   * e.g., "faChevronDownLight" instead of "faChevronDown"
   */
  iconId: string;
  
  /**
   * CSS classes to apply to the icon
   */
  className?: string;
  
  /**
   * @deprecated - Legacy prop, use iconId with Solid suffix instead
   * For SSOT compliance, prefer using iconId="faChevronDownSolid" over solid={true}
   */
  solid?: boolean;
  
  /**
   * Optional inline style
   */
  style?: React.CSSProperties;
  
  /**
   * Optional click handler
   */
  onClick?: () => void;
  
  /**
   * Optional title for the icon
   */
  title?: string;
  
  /**
   * @deprecated - Legacy prop, no longer used
   */
  iconType?: string;
  
  /**
   * Any additional props
   */
  [key: string]: any;
}

/**
 * Formats an icon name to ensure it has the correct variant suffix
 * This is essential for SSOT compliance as it ensures the icon ID
 * contains the explicit variant information.
 * 
 * @param id - The icon ID to format
 * @param solid - Whether to use the solid variant
 * @returns The formatted icon ID with correct variant suffix
 */
function formatIconId(id: string, solid: boolean = false): string {
  // If the ID already has a variant suffix, use it as is
  if (id.endsWith('Light') || id.endsWith('Solid')) {
    return id;
  }
  
  // Otherwise, add the appropriate variant suffix
  return solid ? `${id}Solid` : `${id}Light`;
}

/**
 * IconAdapter - Maps older FontAwesome icon usage to the unified Icon component
 * This provides backward compatibility for components using the old icon pattern
 * while maintaining the SSOT approach.
 */
export const IconAdapter: React.FC<IconAdapterProps> = ({
  iconId,
  className,
  solid = false,
  style,
  onClick,
  title,
  iconType,
  ...rest
}) => {
  // Skip rendering if no ID provided
  if (!iconId) {
    console.warn('IconAdapter: No icon ID provided');
    return null;
  }

  // Format the icon ID properly to include variant suffix
  // This ensures SSOT compliance even with legacy usage patterns
  const formattedIconId = formatIconId(iconId, solid);

  // In development, warn about deprecated solid prop usage
  if (process.env.NODE_ENV === 'development' && solid) {
    console.warn(
      `[IconAdapter] Using 'solid' prop is deprecated. ` +
      `Prefer using iconId with explicit suffix: "${formattedIconId}"`
    );
  }

  // Pass through to the core Icon component (SSOT implementation)
  return (
    <Icon
      iconId={formattedIconId}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      {...rest}
    />
  );
}; 