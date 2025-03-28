// Auto-generated styles file for button
import { cn } from '@/utils/string/utils';
import type { ButtonProps } from '../types';

// Define button style utility
interface GetButtonClassesProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const getButtonClasses = ({
  variant = 'default',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = ''
}: GetButtonClassesProps): string => {
  // Base button classes
  const classes = 'font-medium rounded inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 box-border';
  
  // Size variants
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
    xl: 'text-xl px-8 py-4'
  };
  
  // Variant styles
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent',
    destructive: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
    outline: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-transparent',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent',
    link: 'bg-transparent text-blue-600 hover:underline p-0 h-auto border-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent'
  };

  // Loading classes
  const loadingClasses = loading ? 'opacity-70 cursor-not-allowed' : '';
  
  // Full width class
  const fullWidthClass = fullWidth ? 'w-full' : '';

  return cn(
    classes,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size],
    loadingClasses,
    fullWidthClass,
    className
  );
};
