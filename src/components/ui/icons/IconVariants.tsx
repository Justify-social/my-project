import React from 'react';
import { SvgIcon, SvgIconProps } from './SvgIcon';

// Create a type that omits iconType but keeps name as required
type StaticIconProps = Omit<SvgIconProps, 'iconType'>;

// Create a type that omits iconType but keeps name as required
type ButtonIconProps = Omit<SvgIconProps, 'iconType'>;

// Create a type that omits iconType and action but keeps name as required
type ActionIconProps = Omit<SvgIconProps, 'iconType' | 'action'>;

/**
 * StaticIcon Component - Non-interactive icon with no hover effects
 * Use for decorative or informational icons that don't change appearance
 */
export const StaticIcon = React.forwardRef<SVGSVGElement, StaticIconProps>(
  (props, ref) => {
    return <SvgIcon {...props} iconType="static" ref={ref} />;
  }
);
StaticIcon.displayName = 'StaticIcon';

/**
 * ButtonIcon Component - Interactive icon with hover effects
 * Changes from light to solid on hover and changes color based on action
 * Must be wrapped in a parent with the 'group' class for hover effects to work
 */
export const ButtonIcon = React.forwardRef<SVGSVGElement, ButtonIconProps>(
  (props, ref) => {
    return <SvgIcon {...props} iconType="button" action="default" ref={ref} />;
  }
);
ButtonIcon.displayName = 'ButtonIcon';

/**
 * DeleteIcon Component - Interactive icon with red hover color
 * Specialized for delete/remove operations
 */
export const DeleteIcon = React.forwardRef<SVGSVGElement, ActionIconProps>(
  (props, ref) => {
    return <SvgIcon {...props} iconType="button" action="delete" ref={ref} />;
  }
);
DeleteIcon.displayName = 'DeleteIcon';

/**
 * WarningIcon Component - Interactive icon with yellow hover color
 * Specialized for warning/caution operations
 */
export const WarningIcon = React.forwardRef<SVGSVGElement, ActionIconProps>(
  (props, ref) => {
    return <SvgIcon {...props} iconType="button" action="warning" ref={ref} />;
  }
);
WarningIcon.displayName = 'WarningIcon';

/**
 * SuccessIcon Component - Interactive icon with green hover color
 * Specialized for success/confirmation operations
 */
export const SuccessIcon = React.forwardRef<SVGSVGElement, ActionIconProps>(
  (props, ref) => {
    return <SvgIcon {...props} iconType="button" action="success" ref={ref} />;
  }
);
SuccessIcon.displayName = 'SuccessIcon'; 