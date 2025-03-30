import React, { useMemo } from 'react';
import { cn } from '@/utils/string/utils';
import { PaginationProps } from './types';
import { Icon } from '@/components/ui/atoms/icons'

/**
 * Pagination component for navigating through multiple pages of content
 * 
 * Features:
 * - Responsive design with configurable number of visible page buttons
 * - First/last and next/previous navigation
 * - Customizable button appearance
 * - Accessible keyboard navigation
 * - Support for custom rendering of page buttons
 */
export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  showNextPrevious = true,
  previousLabel = <><Icon name="faChevronLeft" className="mr-1" size="sm" /> Previous</>,
  nextLabel = <>Next <Icon name="faChevronRight" className="ml-1" size="sm" /></>,
  renderPageButton,
  className,
  activeClassName,
  buttonClassName,
  disabled = false,
  size = 'md'
}: PaginationProps) {
  // Calculate which page buttons to display
  const pageButtons = useMemo(() => {
    const buttons: number[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // If the total number of pages is less than or equal to the maximum visible pages,
      // simply show all pages
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Calculate the range of pages to show
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(currentPage - halfVisible, 1);
      const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      
      // Adjust if we're near the end
      if (endPage === totalPages) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      // Add ellipsis at the start if needed
      if (startPage > 1) {
        buttons.push(1);
        if (startPage > 2) {
          buttons.push(-1); // -1 represents an ellipsis
        }
      }
      
      // Add the visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }
      
      // Add ellipsis at the end if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push(-2); // -2 represents an ellipsis
        }
        buttons.push(totalPages);
      }
    }
    
    return buttons;
  }, [totalPages, currentPage, maxVisiblePages]);
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'h-8 min-w-8 text-xs',
    md: 'h-10 min-w-10 text-sm',
    lg: 'h-12 min-w-12 text-base'
  };
  
  // Base button classes
  const baseButtonClasses = cn(
    'flex items-center justify-center px-3 rounded-md border',
    'transition-colors duration-200 mx-0.5',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50',
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100',
    sizeClasses[size],
    buttonClassName
  );
  
  // Render a page button
  const renderButton = (page: number, isActive: boolean) => {
    // If it's an ellipsis
    if (page < 0) {
      return (
        <span key={`ellipsis-${page}`} className="px-2 flex items-center justify-center">
          &hellip;
        </span>
      );
    }
    
    // If custom rendering is provided
    if (renderPageButton) {
      return (
        <button
          key={page}
          onClick={() => !disabled && onPageChange(page)}
          disabled={disabled || isActive}
          aria-current={isActive ? 'page' : undefined}
          className={baseButtonClasses}
        >
          {renderPageButton(page, isActive)}
        </button>
      );
    }
    
    // Default rendering
    return (
      <button
        key={page}
        onClick={() => !disabled && onPageChange(page)}
        disabled={disabled || isActive}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          baseButtonClasses,
          isActive 
            ? cn('bg-[var(--accent-color)] text-white border-[var(--accent-color)]', activeClassName)
            : 'border-gray-300'
        )}
      >
        {page}
      </button>
    );
  };
  
  return (
    <nav 
      aria-label="Pagination" 
      className={cn('flex items-center justify-center', className)}
    >
      <ul className="flex items-center list-none p-0">
        {/* First Page Button */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => !disabled && currentPage > 1 && onPageChange(1)}
              disabled={disabled || currentPage === 1}
              className={cn(
                baseButtonClasses,
                'border-gray-300',
                (disabled || currentPage === 1) && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Go to first page"
            >
              <Icon name="faAnglesLeft" size={size === 'sm' ? 'xs' : 'sm'} />
            </button>
          </li>
        )}
        
        {/* Previous Button */}
        {showNextPrevious && (
          <li>
            <button
              onClick={() => !disabled && currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={disabled || currentPage === 1}
              className={cn(
                baseButtonClasses,
                'border-gray-300',
                (disabled || currentPage === 1) && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Go to previous page"
            >
              {previousLabel}
            </button>
          </li>
        )}
        
        {/* Page Buttons */}
        {pageButtons.map(page => (
          <li key={page}>
            {renderButton(page, page === currentPage)}
          </li>
        ))}
        
        {/* Next Button */}
        {showNextPrevious && (
          <li>
            <button
              onClick={() => !disabled && currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={disabled || currentPage === totalPages}
              className={cn(
                baseButtonClasses,
                'border-gray-300',
                (disabled || currentPage === totalPages) && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Go to next page"
            >
              {nextLabel}
            </button>
          </li>
        )}
        
        {/* Last Page Button */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => !disabled && currentPage < totalPages && onPageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              className={cn(
                baseButtonClasses,
                'border-gray-300',
                (disabled || currentPage === totalPages) && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Go to last page"
            >
              <Icon name="faAnglesRight" size={size === 'sm' ? 'xs' : 'sm'} />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Pagination; 