/**
 * Pagination Component Types
 * 
 * This file contains type definitions for the Pagination component system.
 */

import React from 'react';

/**
 * Pagination component props
 */
export interface PaginationProps {
  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Current page number (1-based)
   */
  currentPage: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;

  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (size: number) => void;

  /**
   * Available page size options
   */
  pageSizeOptions?: number[];

  /**
   * Whether to show the page size selector
   */
  showPageSizeSelector?: boolean;

  /**
   * Custom CSS class for the pagination container
   */
  className?: string;

  /**
   * Maximum number of page buttons to show
   */
  maxPageButtons?: number;

  /**
   * Custom i18n text for labels 
   */
  i18n?: {
    rowsPerPage?: string;
    showing?: string;
    of?: string;
  };
} 