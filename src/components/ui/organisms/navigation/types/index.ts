/**
 * Navigation Types
 * 
 * This file contains shared types used across navigation components.
 */

/**
 * NavItem interface - represents a navigation item in the application
 */
export interface NavItem {
  /**
   * The label to display
   */
  label: string;

  /**
   * The URL to navigate to
   */
  href: string;

  /**
   * Optional icon name
   * For app icons, use the pattern "appName" e.g. "appHome", "appSettings"
   */
  icon?: string;

  /**
   * Optional child navigation items (for dropdowns/nested navigation)
   */
  children?: { label: string; href: string }[];
}

/**
 * Re-export types from other navigation components
 * but exclude NavItem to prevent naming conflicts
 */
export * from '../sidebar/types';
export * from '../mobile-menu/types';

// Selectively re-export from nav-bar/types to avoid conflicts
import type { NavigationBarProps } from '../nav-bar/types';
export type { NavigationBarProps };

/**
 * Tabs Component Types
 * 
 * This file contains type definitions for the Tabs component system.
 */

import React from 'react';

/**
 * Visual styles for tabs
 */
export type TabsVariant = 'underline' | 'pills' | 'enclosed' | 'button';

/**
 * Alignment options for the tab list
 */
export type TabsAlign = 'start' | 'center' | 'end' | 'full';

/**
 * Context value for the Tabs component
 */
export interface TabsContextValue {
  /**
   * ID of the currently active tab
   */
  activeTab: string;
  
  /**
   * Function to change the active tab
   */
  setActiveTab: (id: string) => void;
  
  /**
   * Current visual variant of the tabs
   */
  variant: TabsVariant;
}

/**
 * Props for the main Tabs component
 */
export interface TabsProps {
  /**
   * Child components (TabList, TabPanels, etc.)
   */
  children: React.ReactNode;
  
  /**
   * ID of the initially active tab
   */
  defaultTab?: string;
  
  /**
   * Visual style of the tabs
   * @default "underline"
   */
  variant?: TabsVariant;
  
  /**
   * Alignment of the tab list
   * @default "start"
   */
  align?: TabsAlign;
  
  /**
   * Additional className for the tabs container
   */
  className?: string;
  
  /**
   * Additional className for the tab list
   */
  tabListClassName?: string;
  
  /**
   * Additional className for the tab panels container
   */
  tabPanelsClassName?: string;
  
  /**
   * Callback when the active tab changes
   */
  onChange?: (tabId: string) => void;
}

/**
 * Props for the TabList component
 */
export interface TabListProps {
  /**
   * Child Tab components
   */
  children: React.ReactNode;
  
  /**
   * Additional className for the tab list
   */
  className?: string;
  
  /**
   * Alignment of the tabs within the list
   * @default "start"
   */
  align?: TabsAlign;
}

/**
 * Props for an individual Tab component
 */
export interface TabProps {
  /**
   * Content of the tab
   */
  children: React.ReactNode;
  
  /**
   * Unique identifier for the tab
   */
  id: string;
  
  /**
   * Additional className for the tab
   */
  className?: string;
  
  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props for the TabPanels container
 */
export interface TabPanelsProps {
  /**
   * Child TabPanel components
   */
  children: React.ReactNode;
  
  /**
   * Additional className for the panels container
   */
  className?: string;
}

/**
 * Props for an individual TabPanel component
 */
export interface TabPanelProps {
  /**
   * Content of the panel
   */
  children: React.ReactNode;
  
  /**
   * Unique identifier matching a Tab's id
   */
  id: string;
  
  /**
   * Additional className for the panel
   */
  className?: string;
} 