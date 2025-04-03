'use client';

import React from 'react';
import { Icon } from '../Icon';
import { IconProps, IconStyle } from '../types';

/**
 * Adapter props for legacy components
 */
interface IconAdapterProps {
  /**
   * The iconId to render with explicit variant suffix (required)
   */
  iconId: string;
  
  /**
   * CSS classes to apply to the icon
   */
  className?: string;
  
  /**
   * @deprecated - Legacy prop, use iconId with Solid suffix instead
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
 * Formats an icon name to ensure it has the correct prefix and casing
 */
function formatIconId(id: string, solid: boolean = false): string {
  // Ensure id has a variant suffix
  if (!id.endsWith('Light') && !id.endsWith('Solid')) {
    return solid ? `${id}Solid` : `${id}Light`;
  }
  return id;
}

/**
 * IconAdapter - Maps older FontAwesome icon usage to the unified Icon component
 * This provides backward compatibility for components using the old icon pattern
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
  // Skip rendering if no name provided
  if (!iconId) {
    console.warn('IconAdapter: No icon ID provided');
    return null;
  }

  // Format the icon ID properly to include variant suffix
  const formattedIconId = formatIconId(iconId, solid);

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