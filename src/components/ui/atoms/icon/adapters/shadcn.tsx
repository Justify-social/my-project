'use client';

import React from 'react';
import { Icon } from '../Icon';
import { IconProps } from '../types';

/**
 * Interface for the ShadcnIcon component (matches Lucide icon interface)
 */
export interface ShadcnIconProps {
  name: string;
  color?: string;
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

/**
 * ShadcnIcon adapter
 * Converts Shadcn/Lucide-style props to our internal Icon component props
 */
export const ShadcnIcon: React.FC<ShadcnIconProps> = ({
  name,
  color,
  size,
  className = '',
  onClick,
  ...rest
}) => {
  // Convert size to our internal size
  const iconSize = typeof size === 'number' 
    ? (size <= 16 ? 'sm' : size <= 24 ? 'md' : 'lg')
    : size;
  
  return (
    <Icon
      name={name}
      color={color}
      size={iconSize as any}
      className={className}
      onClick={onClick}
      {...rest}
    />
  );
};

/**
 * Variant adapter for solid icons
 */
export const ShadcnSolidIcon: React.FC<ShadcnIconProps> = (props) => {
  return <ShadcnIcon {...props} variant="solid" />;
};

/**
 * IconAdapter base class
 * @deprecated Use the ShadcnIcon directly
 */
export const IconAdapter = ShadcnIcon; 