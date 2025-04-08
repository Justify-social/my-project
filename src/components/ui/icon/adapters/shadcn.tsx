'use client';

/**
 * ⚠️ DEPRECATED ADAPTER FILE ⚠️
 * 
 * This adapter file is deprecated and will be removed in future versions.
 * Please use 'shadcn-adapter.tsx' as the canonical shadcn adapter file.
 */

import React from 'react';
import { Icon } from '../icon';
import { IconProps } from '../icon-types';

/**
 * @deprecated Use ShadcnIconProps from shadcn-adapter.tsx
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
 * @deprecated Use ShadcnIcon from shadcn-adapter.tsx
 */
export const ShadcnIcon: React.FC<ShadcnIconProps> = ({
  name,
  color,
  size,
  className = '',
  onClick,
  ...rest
}) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[DEPRECATED] src/components/ui/icon/adapters/shadcn.tsx is deprecated. ' +
      'Please use shadcn-adapter.tsx as the canonical adapter file.'
    );
  }
  
  // Convert size to our internal size
  const iconSize = typeof size === 'number' 
    ? (size <= 16 ? 'sm' : size <= 24 ? 'md' : 'lg')
    : size;
  
  return (
    <Icon
      iconId={name}
      color={color}
      size={iconSize as any}
      className={className}
      onClick={onClick}
      {...rest}
    />
  );
};

/**
 * @deprecated Use ShadcnIcon with variant="solid" from shadcn-adapter.tsx
 */
export const ShadcnSolidIcon: React.FC<ShadcnIconProps> = (props) => {
  return <ShadcnIcon {...props} variant="solid" />;
};

/**
 * @deprecated Use ShadcnIcon from shadcn-adapter.tsx
 */
export const IconAdapter = ShadcnIcon; 