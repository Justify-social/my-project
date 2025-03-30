import { ReactNode } from 'react';

/**
 * Props for the Pagination component
 */
export interface PaginationProps {
  /**
   * The total number of pages
   */
  totalPages: number;
  
  /**
   * The current active page (1-based index)
   */
  currentPage: number;
  
  /**
   * Callback function when a page is clicked
   */
  onPageChange: (page: number) => void;
  
  /**
   * Maximum number of page buttons to show
   * @default 5
   */
  maxVisiblePages?: number;
  
  /**
   * Whether to show the first and last page buttons
   * @default true
   */
  showFirstLast?: boolean;
  
  /**
   * Whether to show the next and previous buttons
   * @default true
   */
  showNextPrevious?: boolean;
  
  /**
   * Text for the previous button
   * @default 'Previous'
   */
  previousLabel?: ReactNode;
  
  /**
   * Text for the next button
   * @default 'Next'
   */
  nextLabel?: ReactNode;
  
  /**
   * Custom rendering for page buttons
   */
  renderPageButton?: (page: number, isActive: boolean) => ReactNode;
  
  /**
   * Additional CSS class name for the pagination container
   */
  className?: string;
  
  /**
   * CSS class name for active page button
   */
  activeClassName?: string;
  
  /**
   * CSS class name for page buttons
   */
  buttonClassName?: string;
  
  /**
   * Whether to disable the pagination
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Size variant for the pagination component
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
} 
// Default export added by auto-fix script
export default {
  // All exports from this file
};
