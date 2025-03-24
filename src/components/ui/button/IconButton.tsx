import React from 'react';
import { SvgIcon } from '../icons/SvgIcon';

interface IconButtonProps {
  name: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  name,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  ariaLabel,
  disabled = false
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
      case 'sm':return 'p-1';
      case 'md':return 'p-2';
      case 'lg':return 'p-3';
      default:return 'p-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':return 'w-4 h-4';
      case 'md':return 'w-5 h-5';
      case 'lg':return 'w-6 h-6';
      default:return 'w-5 h-5';
    }
  };

  return (
    <button
      className={`group rounded-md ${getVariantClasses()} ${getSizeClasses()} ${className} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] font-work-sans`}
      onClick={onClick}
      aria-label={ariaLabel || `Button with ${name} icon`}
      disabled={disabled}>

      <SvgIcon
        name={name}
        className={getIconSize()}
        iconType="button" />

    </button>);

};

export default IconButton;