import React from 'react';
import { Icon, IconProps } from './Icon';
import { iconConfig } from './IconConfig';

/**
 * StaticIcon - A wrapper for the Icon component that always uses static mode
 * Use for decorative, informational icons that should not change on hover
 */
export const StaticIcon: React.FC<Omit<IconProps, 'iconType'>> = (props) => {
  return <Icon {...props} iconType="static" />;
};

/**
 * ButtonIcon - A wrapper for the Icon component that uses button mode with hover effects
 * Use for interactive elements like buttons, links, etc.
 */
export const ButtonIcon: React.FC<Omit<IconProps, 'iconType'>> = (props) => {
  return <Icon {...props} iconType="button" />;
};

/**
 * DeleteIcon - A specialized button icon for delete/remove actions
 * Automatically uses red color on hover
 */
export const DeleteIcon: React.FC<Omit<IconProps, 'iconType' | 'action'>> = (props) => {
  return <Icon {...props} iconType="button" action="delete" />;
};

/**
 * WarningIcon - A specialized button icon for warning actions
 * Automatically uses yellow color on hover
 */
export const WarningIcon: React.FC<Omit<IconProps, 'iconType' | 'action'>> = (props) => {
  return <Icon {...props} iconType="button" action="warning" />;
};

/**
 * SuccessIcon - A specialized button icon for success/confirmation actions
 * Automatically uses green color on hover
 */
export const SuccessIcon: React.FC<Omit<IconProps, 'iconType' | 'action'>> = (props) => {
  return <Icon {...props} iconType="button" action="success" />;
}; 