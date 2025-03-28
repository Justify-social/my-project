/**
 * Icon Variants
 * 
 * This file provides pre-configured variants of the base Icon component
 * for common use cases like button icons, warning icons, etc.
 */

'use client';

import React from 'react';
import { SvgIcon } from './SvgIcon';
import type { SvgIconProps } from '../types';

// Base Icon component
export const Icon = SvgIcon;

// Static version (no hover effects)
export const StaticIcon: React.FC<SvgIconProps> = (props) => (
  <Icon iconType="static" {...props} />
);

// Button-style icon (with hover effects)
export const ButtonIcon: React.FC<SvgIconProps> = (props) => (
  <Icon iconType="button" {...props} />
);

// Delete action icon - allows custom name to be passed, but defaults to trash icon
export const DeleteIcon: React.FC<Omit<SvgIconProps, 'action'>> = ({ name = "faTrashCan", ...props }) => (
  <Icon name={name} action="delete" iconType="button" {...props} />
);

// Warning icon - allows custom name to be passed, but defaults to warning triangle
export const WarningIcon: React.FC<Omit<SvgIconProps, 'action'>> = ({ name = "faTriangleExclamation", ...props }) => (
  <Icon name={name} action="warning" iconType="static" {...props} />
);

// Success icon - allows custom name to be passed, but defaults to check circle
export const SuccessIcon: React.FC<Omit<SvgIconProps, 'action'>> = ({ name = "faCircleCheck", ...props }) => (
  <Icon name={name} action="success" iconType="static" {...props} />
);

// Helper factory function for creating specialized icon components
export const iconComponentFactory = (name: string, prefix: string) => {
  const Icon = (props: SvgIconProps) => {
    // Destructure to separate name from other props
    const { name: propName, ...otherProps } = props;
    return <SvgIcon name={name} prefix={prefix} {...otherProps} />;
  };
  
  Icon.displayName = `${name}Icon`;
  return Icon;
}; 