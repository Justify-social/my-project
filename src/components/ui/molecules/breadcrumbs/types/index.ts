import { ReactNode } from 'react';

/**
 * Interface for an individual breadcrumb item
 */
export interface BreadcrumbItem {
  /**
   * Unique identifier for the breadcrumb item
   */
  id: string;
  
  /**
   * The display text for the breadcrumb
   */
  label: string;
  
  /**
   * The URL to navigate to when this breadcrumb is clicked
   */
  href: string;
  
  /**
   * Optional icon to display before the label
   */
  icon?: string;
  
  /**
   * Whether this is the current page/active breadcrumb
   * If true, it will be rendered without a link and with active styling
   */
  isCurrent?: boolean;
}

/**
 * Props for the Breadcrumbs component
 */
export interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items to display
   * If not provided, only a home breadcrumb will be shown
   */
  items?: BreadcrumbItem[];
  
  /**
   * Maximum number of breadcrumbs to show before truncating
   * If there are more items than this number, they will be truncated in the middle
   * @default undefined (show all)
   */
  maxItems?: number;
  
  /**
   * Text to show for the home breadcrumb
   * @default 'Home'
   */
  homeText?: string;
  
  /**
   * Icon to show for the home breadcrumb
   * @default 'fa-home'
   */
  homeIcon?: string;
  
  /**
   * URL for the home breadcrumb
   * @default '/'
   */
  homeHref?: string;
  
  /**
   * Character or node to use as the separator between breadcrumbs
   * @default '/'
   */
  separator?: ReactNode;
  
  /**
   * Additional CSS class name for the breadcrumbs container
   */
  className?: string;
  
  /**
   * Additional CSS class name for each individual breadcrumb item
   */
  itemClassName?: string;
  
  /**
   * Additional CSS class name for the current/active breadcrumb
   */
  activeClassName?: string;
  
  /**
   * Additional CSS class name for the separator
   */
  separatorClassName?: string;
} 