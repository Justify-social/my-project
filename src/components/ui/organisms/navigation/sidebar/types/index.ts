import { ReactNode } from 'react';

/**
 * SidebarItem interface for navigation items in the sidebar
 */
export interface SidebarItem {
  /**
   * Unique identifier for the item
   */
  id: string;
  
  /**
   * Display text for the item
   */
  label: string;
  
  /**
   * The URL the item should navigate to
   */
  href: string;
  
  /**
   * Optional icon for the item
   */
  icon?: string;
  
  /**
   * Whether this item is currently active
   */
  isActive?: boolean;
  
  /**
   * Whether this item is disabled
   */
  isDisabled?: boolean;
  
  /**
   * Optional badge to display (e.g., count of notifications)
   */
  badge?: string | number;
  
  /**
   * Children items for nested navigation
   */
  children?: SidebarItem[];
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /**
   * Items to display in the sidebar
   */
  items: SidebarItem[];
  
  /**
   * Optional header content for the sidebar
   */
  header?: ReactNode;
  
  /**
   * Optional footer content for the sidebar
   */
  footer?: ReactNode;
  
  /**
   * Whether the sidebar is collapsed
   * @default false
   */
  isCollapsed?: boolean;
  
  /**
   * Whether the sidebar is open on mobile devices
   * @default false
   */
  isMobileOpen?: boolean;
  
  /**
   * Function to toggle the collapsed state
   */
  onToggleCollapse?: () => void;
  
  /**
   * Function to close the sidebar on mobile
   */
  onMobileClose?: () => void;
  
  /**
   * Custom class name for the sidebar container
   */
  className?: string;
  
  /**
   * Width of the sidebar when expanded
   * @default '240px'
   */
  width?: string;
  
  /**
   * Width of the sidebar when collapsed
   * @default '64px'
   */
  collapsedWidth?: string;
  
  /**
   * Function called when a navigation item is clicked
   */
  onItemClick?: (item: SidebarItem) => void;
} 