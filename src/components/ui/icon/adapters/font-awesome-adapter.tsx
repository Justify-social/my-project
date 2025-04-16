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
 * // Explicit solid usage
 * <IconAdapter iconId="faChevronDownSolid" />
 * ```
 *
 * For new components, prefer the ShadcnIcon adapter or direct Icon usage.
 */

import React from 'react';
import { Icon } from '../icon';

/**
 * Adapter props for legacy components
 */
export interface IconAdapterProps extends React.HTMLAttributes<HTMLElement> {
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
  // solid?: boolean; // Removed deprecated prop

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
  // iconType?: string; // Removed deprecated prop
}

/**
 * IconAdapter - Maps older FontAwesome icon usage to the unified Icon component
 * This provides backward compatibility for components using the old icon pattern
 * while maintaining the SSOT approach.
 */
export const IconAdapter: React.FC<IconAdapterProps> = ({
  iconId,
  className,
  style,
  onClick,
  title,
  ...rest
}) => {
  // Skip rendering if no ID provided
  if (!iconId) {
    console.warn('IconAdapter: No icon ID provided');
    return null;
  }

  // Pass through to the core Icon component (SSOT implementation)
  return (
    <Icon
      iconId={iconId}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      {...rest}
    />
  );
};
