/**
 * @deprecated This file is maintained for backwards compatibility.
 * Please import from '@/components/ui/icons' instead.
 * 
 * Example:
 * import { StaticIcon, ButtonIcon } from '@/components/ui/icons';
 */

import React from 'react';
import { Icon } from './icons';
import type { SvgIconProps } from './icons/SvgIcon';

/**
 * StaticIcon - A wrapper for the Icon component that always uses static mode
 * Use for decorative, informational icons that should not change on hover
 */
export const StaticIcon: React.FC<Omit<SvgIconProps, 'iconType'>> = props => {
  return <Icon {...props} iconType="static" name={props.name || "faCircleInfo"} solid={false} className="text-[var(--secondary-color)]" />;
};

/**
 * ButtonIcon - A wrapper for the Icon component that uses button mode with hover effects
 * Use for interactive elements like buttons, links, etc.
 */
export const ButtonIcon: React.FC<Omit<SvgIconProps, 'iconType'>> = props => {
  return <Icon {...props} iconType="button" name={props.name || "faCircleInfo"} solid={false} className="text-[var(--secondary-color)]" />;
};

/**
 * DeleteIcon - A specialized button icon for delete/remove actions
 * Automatically uses red color on hover
 */
export const DeleteIcon: React.FC<Omit<SvgIconProps, 'iconType' | 'action'>> = props => {
  return <Icon {...props} iconType="button" action="delete" name={props.name || "faTrashCan"} solid={false} />;
};

/**
 * WarningIcon - A specialized button icon for warning actions
 * Automatically uses yellow color on hover
 */
export const WarningIcon: React.FC<Omit<SvgIconProps, 'iconType' | 'action'>> = props => {
  return <Icon {...props} iconType="button" action="warning" name={props.name || "faTriangleExclamation"} solid={false} />;
};

/**
 * SuccessIcon - A specialized button icon for success/confirmation actions
 * Automatically uses green color on hover
 */
export const SuccessIcon: React.FC<Omit<SvgIconProps, 'iconType' | 'action'>> = props => {
  return <Icon {...props} iconType="button" action="success" name={props.name || "faCircleCheck"} solid={false} />;
};
export * from './icons';