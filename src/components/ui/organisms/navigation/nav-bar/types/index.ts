import { ReactNode } from 'react';

/**
 * Navigation item definition
 */
export interface NavItem {
  /**
   * Unique identifier for the navigation item
   */
  id: string;
  
  /**
   * Display label for the navigation item
   */
  label: string;
  
  /**
   * URL to navigate to when clicked
   */
  href: string;
  
  /**
   * Icon name to display (uses the standardized Icon component)
   */
  icon?: string;
  
  /**
   * Whether the item is currently active
   */
  isActive?: boolean;
  
  /**
   * Whether the item is disabled
   */
  isDisabled?: boolean;
  
  /**
   * Optional badge text or count to display
   */
  badge?: string | number;
  
  /**
   * Children navigation items (for dropdown menus)
   */
  children?: NavItem[];
}

/**
 * NavigationBar component props
 */
export interface NavigationBarProps {
  /**
   * Logo content to display in the navigation bar
   */
  logo: ReactNode;
  
  /**
   * Main navigation items
   */
  items: NavItem[];
  
  /**
   * Additional content to display on the right side
   */
  rightContent?: ReactNode;
  
  /**
   * Whether to show a mobile menu toggle button
   * @default true
   */
  mobileMenuEnabled?: boolean;
  
  /**
   * Custom class name for the navigation bar
   */
  className?: string;
  
  /**
   * Variant of the navigation bar
   * @default 'default'
   */
  variant?: 'default' | 'transparent' | 'subtle';
  
  /**
   * Position of the navigation bar
   * @default 'relative'
   */
  position?: 'relative' | 'fixed' | 'sticky';
  
  /**
   * Whether to show a shadow
   * @default true
   */
  withShadow?: boolean;
  
  /**
   * Callback for when a navigation item is clicked
   */
  onItemClick?: (item: NavItem) => void;
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
