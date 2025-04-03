'use client';

import React from 'react';
import { TabList, Tab, TabPanel } from './Tabs';
import { cn } from '@/utils/string/utils';

/**
 * TabsList component - Compatibility wrapper for TabList
 * 
 * This provides a consistent naming convention with other component libraries
 * and ensures compatibility with ComponentPreview.tsx imports
 */
export interface TabsListProps {
  /**
   * The tab list content
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Alignment of tabs within the list
   * @default "start"
   */
  align?: 'start' | 'center' | 'end' | 'full';
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, align = 'start', ...props }, ref) => {
    return (
      <TabList 
        className={cn('flex-wrap', className)} 
        align={align} 
        {...props}
      >
        {children}
      </TabList>
    );
  }
);

TabsList.displayName = 'TabsList';

/**
 * TabsTrigger component - Compatibility wrapper for Tab
 * 
 * This provides a consistent naming convention with other component libraries
 * and ensures compatibility with ComponentPreview.tsx imports
 */
export interface TabsTriggerProps {
  /**
   * The tab trigger content
   */
  children: React.ReactNode;
  
  /**
   * Unique identifier for this tab
   */
  value: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ children, value, className, disabled = false, ...props }, ref) => {
    return (
      <Tab 
        id={value} 
        className={className} 
        disabled={disabled} 
        {...props}
      >
        {children}
      </Tab>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

/**
 * TabsContent component - Compatibility wrapper for TabPanel
 * 
 * This provides a consistent naming convention with other component libraries
 * and ensures compatibility with ComponentPreview.tsx imports
 */
export interface TabsContentProps {
  /**
   * The tab panel content
   */
  children: React.ReactNode;
  
  /**
   * Value that corresponds to the TabsTrigger value
   */
  value: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, value, className, ...props }, ref) => {
    return (
      <TabPanel 
        id={value} 
        className={className} 
        {...props}
      >
        {children}
      </TabPanel>
    );
  }
);

TabsContent.displayName = 'TabsContent';

export { TabsList as default }; 