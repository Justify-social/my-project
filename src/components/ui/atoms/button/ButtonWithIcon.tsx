import React from 'react';
import { Icon } from '@/components/ui/atoms/icons'

/**
 * Props for the ButtonWithIcon component
 */
export interface ButtonWithIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The name of the icon to display
   */
  iconName?: string;
  
  /**
   * Content to display next to the icon
   */
  children: React.ReactNode;
  
  /**
   * Optional click handler
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Additional classes for the button element
   */
  className?: string;
  
  /**
   * Classes for the icon
   */
  iconClassName?: string;
  
  /**
   * Additional props to pass to the Icon component
   */
  iconProps?: Partial<IconProps>;

  /**
   * The type of action this button performs (affects hover color)
   */
  actionType?: 'default' | 'delete' | 'warning' | 'success';
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Position of the icon relative to the text
   */
  iconPosition?: 'left' | 'right';
}

/**
 * A button component with an icon that properly handles hover effects
 * Has the 'group' class built-in to ensure proper icon behavior
 */
export const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({
  iconName,
  children,
  onClick,
  className = "",
  iconClassName = "h-4 w-4 mr-2",
  iconProps = {},
  actionType = 'default',
  disabled = false,
  iconPosition = 'left',
  ...rest
}) => {
  // Determine the action prop for the icon
  const iconAction = actionType !== 'default' ? actionType : undefined;
  
  // Adjust icon margin based on position
  const iconClasses = iconPosition === 'right' 
    ? iconClassName.replace('mr-', 'ml-')
    : iconClassName;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group ${className}`}
      {...rest}
    >
      {iconPosition === 'left' && iconName && (
        <Icon 
          name={iconName} 
          className={iconClasses} 
          action={iconAction}
          {...iconProps} 
        />
      )}
      
      {children}
      
      {iconPosition === 'right' && iconName && (
        <Icon 
          name={iconName} 
          className={iconClasses} 
          action={iconAction}
          {...iconProps} 
        />
      )}
    </button>
  );
};

/**
 * LinkWithIcon component - similar to ButtonWithIcon but for anchor tags
 */
export interface LinkWithIconProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  iconName?: string;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  iconProps?: Partial<IconProps>;
  actionType?: 'default' | 'delete' | 'warning' | 'success';
  iconPosition?: 'left' | 'right';
}

export const LinkWithIcon: React.FC<LinkWithIconProps> = ({
  iconName,
  children,
  className = "",
  iconClassName = "h-4 w-4 mr-2",
  iconProps = {},
  actionType = 'default',
  iconPosition = 'left',
  ...rest
}) => {
  // Determine the action prop for the icon
  const iconAction = actionType !== 'default' ? actionType : undefined;
  
  // Adjust icon margin based on position
  const iconClasses = iconPosition === 'right' 
    ? iconClassName.replace('mr-', 'ml-') 
    : iconClassName;
  
  return (
    <a
      className={`group ${className}`}
      {...rest}
    >
      {iconPosition === 'left' && iconName && (
        <Icon 
          name={iconName} 
          className={iconClasses} 
          action={iconAction}
          {...iconProps} 
        />
      )}
      
      {children}
      
      {iconPosition === 'right' && iconName && (
        <Icon 
          name={iconName} 
          className={iconClasses}
          action={iconAction}
          {...iconProps} 
        />
      )}
    </a>
  );
}; 
/**
 * Default export for ButtonWithIcon
 */
export default ButtonWithIcon;
