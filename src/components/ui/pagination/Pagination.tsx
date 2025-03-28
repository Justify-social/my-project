'use client';

import React, { useMemo } from 'react';
import HTMLSelectElement from '../forms/Select';
import { Icon } from '@/components/ui/icons';
import { PaginationProps } from './types';
import { 
  getPaginationContainerClasses,
  getPageSizeSelectorClasses,
  getPageSizeSelectClasses,
  getInfoTextClasses,
  getPaginationControlsClasses,
  getPaginationButtonClasses
} from './styles/pagination.styles';

/**
 * Pagination component for controlling data pagination
 */
export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  showPageSizeSelector = true,
  className,
  maxPageButtons = 5,
  i18n = {
    rowsPerPage: 'Rows per page:',
    showing: 'Showing',
    of: 'of'
  }
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Calculate start and end item for display
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Calculate which page buttons to display
  const pageButtons = useMemo(() => {
    const buttons = [];
    const maxButtons = Math.min(maxPageButtons, totalPages);
    
    // Determine start and end page
    let startPage;
    let endPage;
    
    if (totalPages <= maxButtons) {
      // Show all pages if there are fewer than maxPageButtons
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage <= Math.ceil(maxButtons / 2)) {
      // Current page is near the start
      startPage = 1;
      endPage = maxButtons;
    } else if (currentPage >= totalPages - Math.floor(maxButtons / 2)) {
      // Current page is near the end
      startPage = totalPages - maxButtons + 1;
      endPage = totalPages;
    } else {
      // Current page is in the middle
      startPage = currentPage - Math.floor(maxButtons / 2);
      endPage = startPage + maxButtons - 1;
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    
    return buttons;
  }, [currentPage, totalPages, maxPageButtons]);

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  return (
    <div className={getPaginationContainerClasses({ className })}>
      {/* Page size selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <div className={getPageSizeSelectorClasses({})}>
          <span className={getInfoTextClasses({})}>{i18n.rowsPerPage}</span>
          <select
            className={getPageSizeSelectClasses({})}
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Select rows per page"
          >
            {pageSizeOptions.map((size: number) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info text */}
      <div className={getInfoTextClasses({})}>
        {i18n.showing} {totalItems > 0 ? startItem : 0}-{endItem} {i18n.of} {totalItems}
      </div>

      {/* Pagination controls */}
      <div className={getPaginationControlsClasses({})}>
        {/* First page button */}
        <button
          className={getPaginationButtonClasses({
            isDisabled: currentPage <= 1
          })}
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
        >
          <Icon name="angles-left" className="w-4 h-4" />
        </button>
        
        {/* Previous page button */}
        <button
          className={getPaginationButtonClasses({
            isDisabled: currentPage <= 1
          })}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <Icon name="angle-left" className="w-4 h-4" />
        </button>

        {/* Page number buttons */}
        {pageButtons.map((pageNum) => (
          <button
            key={pageNum}
            className={getPaginationButtonClasses({
              isActive: currentPage === pageNum
            })}
            onClick={() => onPageChange(pageNum)}
            aria-label={`Page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        {/* Next page button */}
        <button
          className={getPaginationButtonClasses({
            isDisabled: currentPage >= totalPages
          })}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <Icon name="angle-right" className="w-4 h-4" />
        </button>
        
        {/* Last page button */}
        <button
          className={getPaginationButtonClasses({
            isDisabled: currentPage >= totalPages
          })}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
        >
          <Icon name="angles-right" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Example pagination for documentation purposes
 */
export function PaginationExample() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const totalItems = 87;

  return (
    <div className="mb-6 border rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Pagination Example</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p>Current Page: <strong>{currentPage}</strong></p>
        <p>Page Size: <strong>{pageSize}</strong></p>
        <p>Total Items: <strong>{totalItems}</strong></p>
      </div>
      
      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
} 