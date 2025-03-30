/**
 * Tabs Component Styles
 * 
 * This file contains style utility functions for the Tabs component system.
 */

import { cn } from '@/utils/string/utils';
import { TabsVariant, TabsAlign } from '../types';

/**
 * Get classes for the tabs container
 */
export function getTabsContainerClasses(className?: string): string {
  return cn(
    'w-full',
    className
  );
}

/**
 * Get classes for the tab list container based on variant and alignment
 */
export function getTabListClasses({
  variant = 'underline',
  align = 'start',
  className = ''
}: {
  variant: TabsVariant;
  align: TabsAlign;
  className?: string;
}): string {
  return cn(
    'flex',
    // Variant styling
    {
      'border-b border-gray-200': variant === 'underline',
      'bg-gray-100 p-1 rounded-md': variant === 'pills',
      'border-b border-gray-200 rounded-t-md': variant === 'enclosed',
      'space-x-1': variant === 'button'
    },
    // Alignment
    {
      'justify-start': align === 'start',
      'justify-center': align === 'center',
      'justify-end': align === 'end',
      'w-full': align === 'full'
    },
    className
  );
}

/**
 * Get classes for an individual tab based on state and variant
 */
export function getTabClasses({
  variant = 'underline',
  isActive = false,
  disabled = false,
  className = ''
}: {
  variant: TabsVariant;
  isActive: boolean;
  disabled?: boolean;
  className?: string;
}): string {
  return cn(
    'px-4 py-2.5 text-sm font-medium focus:outline-none transition-all',
    {
      // Underline variant
      'text-[#3182CE] border-b-2 border-[#3182CE]': isActive && variant === 'underline',
      'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300': !isActive && variant === 'underline',

      // Pills variant
      'bg-white text-[#3182CE] shadow rounded-md': isActive && variant === 'pills',
      'text-gray-500 hover:text-gray-700': !isActive && variant === 'pills',

      // Enclosed variant
      'border-t border-l border-r border-gray-200 rounded-t-md -mb-px bg-white': isActive && variant === 'enclosed',
      'text-gray-500 hover:text-gray-700 bg-transparent': !isActive && variant === 'enclosed',

      // Button variant
      'bg-[#3182CE] text-white': isActive && variant === 'button',
      'bg-gray-100 text-gray-700 hover:bg-gray-200': !isActive && variant === 'button',
      'rounded': variant === 'button',

      // Disabled state
      'opacity-50 cursor-not-allowed': disabled
    },
    className
  );
}

/**
 * Get classes for the tab panels container
 */
export function getTabPanelsClasses(className?: string): string {
  return cn(
    'mt-4',
    className
  );
}

/**
 * Get classes for an individual tab panel
 */
export function getTabPanelClasses(className?: string): string {
  return cn(
    'focus:outline-none',
    className
  );
} 

// Default export added by auto-fix script
export default {};
