import { cva } from 'class-variance-authority';

/**
 * NavigationBar container style variants
 */
export const navBarStyles = cva(
  [
    'w-full', 
    'flex', 
    'items-center', 
    'justify-between', 
    'px-4', 
    'transition-all', 
    'duration-200'
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white',
          'dark:bg-gray-900', 
          'text-gray-900', 
          'dark:text-white',
          'border-b',
          'border-gray-200',
          'dark:border-gray-800'
        ],
        transparent: [
          'bg-transparent', 
          'text-white'
        ],
        subtle: [
          'bg-gray-50', 
          'dark:bg-gray-800', 
          'text-gray-900', 
          'dark:text-white'
        ],
      },
      position: {
        relative: 'relative',
        fixed: 'fixed top-0 left-0 right-0 z-50',
        sticky: 'sticky top-0 z-50',
      },
      withShadow: {
        true: 'shadow-md',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      position: 'relative',
      withShadow: true,
    },
  }
);

/**
 * Navigation item style variants
 */
export const navItemStyles = cva(
  [
    'px-3',
    'py-2',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-colors',
    'duration-200',
    'flex',
    'items-center',
    'gap-2'
  ],
  {
    variants: {
      isActive: {
        true: [
          'bg-primary-color',
          'text-white',
          'dark:bg-primary-color',
          'dark:text-white'
        ],
        false: [
          'text-gray-700',
          'dark:text-gray-300',
          'hover:bg-gray-100',
          'dark:hover:bg-gray-800',
          'hover:text-gray-900',
          'dark:hover:text-white'
        ],
      },
      isDisabled: {
        true: [
          'opacity-50',
          'cursor-not-allowed',
          'pointer-events-none'
        ],
        false: [
          'cursor-pointer'
        ],
      },
    },
    defaultVariants: {
      isActive: false,
      isDisabled: false,
    },
  }
);

/**
 * Mobile menu button style
 */
export const mobileMenuButtonStyles = cva(
  [
    'md:hidden',
    'inline-flex',
    'items-center',
    'justify-center',
    'p-2',
    'rounded-md',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-inset',
    'focus:ring-primary-color'
  ],
  {
    variants: {
      variant: {
        default: [
          'text-gray-500',
          'hover:text-gray-700',
          'hover:bg-gray-100',
          'dark:text-gray-400',
          'dark:hover:text-white',
          'dark:hover:bg-gray-700'
        ],
        transparent: [
          'text-white',
          'hover:text-gray-200',
          'hover:bg-gray-800/20'
        ],
        subtle: [
          'text-gray-500',
          'hover:text-gray-700',
          'hover:bg-gray-200',
          'dark:text-gray-400',
          'dark:hover:text-white',
          'dark:hover:bg-gray-700'
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Mobile menu style
 */
export const mobileMenuStyles = cva(
  [
    'md:hidden',
    'absolute',
    'top-full',
    'left-0',
    'right-0',
    'z-40',
    'transition-all',
    'duration-200',
    'transform',
    'origin-top',
    'overflow-hidden'
  ],
  {
    variants: {
      isOpen: {
        true: [
          'scale-y-100',
          'opacity-100'
        ],
        false: [
          'scale-y-0',
          'opacity-0',
          'pointer-events-none'
        ],
      },
      variant: {
        default: [
          'bg-white',
          'dark:bg-gray-900',
          'border-b',
          'border-gray-200',
          'dark:border-gray-800',
          'shadow-lg'
        ],
        transparent: [
          'bg-gray-900/95',
          'backdrop-blur-sm'
        ],
        subtle: [
          'bg-gray-50',
          'dark:bg-gray-800',
          'shadow-lg'
        ],
      }
    },
    defaultVariants: {
      isOpen: false,
      variant: 'default',
    },
  }
); 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
