import React from 'react';
import { SvgIcon } from '../icons/SvgIcon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--accent-color)] text-white hover:bg-opacity-90';
      case 'secondary':
        return 'bg-[var(--secondary-color)] text-white hover:bg-opacity-90';
      case 'outline':
        return 'border border-[var(--divider-color)] text-[var(--primary-color)] hover:bg-gray-50';
      case 'ghost':
        return 'text-[var(--primary-color)] hover:bg-gray-100';
      default:
        return 'bg-[var(--accent-color)] text-white hover:bg-opacity-90';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'md': return 'px-4 py-2 text-base';
      case 'lg': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <button
      type={type}
      className={`group inline-flex items-center justify-center rounded-md ${getVariantClasses()} ${getSizeClasses()} ${fullWidth ? 'w-full' : ''} ${className} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <span className="mr-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      {leftIcon && !isLoading && (
        <SvgIcon 
          name={leftIcon} 
          className={`${getIconSize()} mr-2`} 
          iconType="button"
        />
      )}
      
      {children}
      
      {rightIcon && (
        <SvgIcon 
          name={rightIcon} 
          className={`${getIconSize()} ml-2`} 
          iconType="button"
        />
      )}
    </button>
  );
};

export default Button; 