import { ReactNode } from 'react';
import { SidebarItem } from '../../sidebar/types';
import { NavItem } from '../../config';
import { UserProfile } from '@auth0/nextjs-auth0/client';

/**
 * Props for the BaseMobileMenu component
 */
export interface BaseMobileMenuProps {
  /**
   * Whether the mobile menu is open
   */
  isOpen: boolean;
  
  /**
   * Function to close the mobile menu
   */
  onClose: () => void;
  
  /**
   * Navigation items to display in the menu
   */
  items: SidebarItem[];
  
  /**
   * Content to display in the header of the menu
   */
  header?: ReactNode;
  
  /**
   * Content to display in the footer of the menu
   */
  footer?: ReactNode;
  
  /**
   * Custom class name for the menu container
   */
  className?: string;
  
  /**
   * Function called when a navigation item is clicked
   */
  onItemClick?: (item: SidebarItem) => void;
}

/**
 * Props for the MobileMenu component
 */
export interface MobileMenuProps {
  /**
   * Whether the mobile menu is open
   */
  isOpen: boolean;
  
  /**
   * Function to close the mobile menu
   */
  onClose: () => void;
  
  /**
   * Navigation items to display in the menu
   */
  navItems: NavItem[];
  
  /**
   * Settings navigation item
   */
  settingsNavItem: NavItem;
  
  /**
   * Number of remaining credits to display
   */
  remainingCredits: number;
  
  /**
   * Number of notifications to display
   */
  notificationsCount: number;
  
  /**
   * Company name to display in the header
   */
  companyName: string;
  
  /**
   * User profile information
   */
  user?: UserProfile;
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
