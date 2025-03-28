'use client';

import React, { forwardRef, useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import TableCellProps from './Table';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/icons';

// Types
type SortDirection = 'asc' | 'desc' | undefined;
interface SortState<T> {
  column: keyof T | undefined;
  direction: SortDirection;
}
interface TableContextValue<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sortState: SortState<T>;
  setSortState: (state: SortState<T>) => void;
  pagination: boolean;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  onRowClick?: (row: T) => void;
  hoverable: boolean;
  striped: boolean;
  highlightedRowIndex?: number;
  compact: boolean;
  headerBgColor?: 'white' | 'gray' | 'blue';
}

// Create context
const TableContext = createContext<TableContextValue<any> | undefined>(undefined);

// Context hook
function useTableContext<T>() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context as TableContextValue<T>;
}

// Column definition
export interface ColumnDef<T> {
  /**
   * Unique identifier for the column
   */
  id: string;

  /**
   * Header title or custom render function
   */
  header: string | React.ReactNode;

  /**
   * Accessor function to get the cell value
   */
  accessor?: keyof T | ((row: T) => any);

  /**
   * Custom cell renderer
   */
  cell?: (props: {
    row: T;
    value: any;
  }) => React.ReactNode;

  /**
   * Whether the column is sortable
   */
  sortable?: boolean;

  /**
   * Custom sort function
   */
  sortFn?: (a: T, b: T, direction: SortDirection) => number;

  /**
   * Column width (e.g., "100px", "20%")
   */
  width?: string;

  /**
   * Custom CSS class for the cell
   */
  className?: string;

  /**
   * Text alignment for the cell
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Whether to hide the column on small screens
   */
  hideOnMobile?: boolean;
}

// Root table component props
export interface TableProps<T> {
  /**
   * Data array to display in the table
   */
  data: T[];

  /**
   * Column definitions
   */
  columns: ColumnDef<T>[];

  /**
   * Whether to enable sorting
   */
  sortable?: boolean;

  /**
   * Default sort column
   */
  defaultSort?: {
    column: keyof T;
    direction: SortDirection;
  };

  /**
   * Whether to use pagination
   */
  pagination?: boolean;

  /**
   * Default page size
   */
  pageSize?: number;

  /**
   * Sizes to display in the page size selector
   */
  pageSizeOptions?: number[];

  /**
   * Whether to show zebra striping
   */
  striped?: boolean;

  /**
   * Whether to show hover effects
   */
  hoverable?: boolean;

  /**
   * Whether to show borders
   */
  bordered?: boolean;

  /**
   * Whether to use compact sizing
   */
  compact?: boolean;

  /**
   * Custom CSS class for the table
   */
  className?: string;

  /**
   * Custom CSS class for the table container
   */
  containerClassName?: string;

  /**
   * Whether the table has a sticky header
   */
  stickyHeader?: boolean;

  /**
   * Custom empty state component
   */
  emptyState?: React.ReactNode;

  /**
   * Custom loading state component
   */
  loadingState?: React.ReactNode;

  /**
   * Whether the table is in a loading state
   */
  isLoading?: boolean;

  /**
   * Aria label for the table
   */
  ariaLabel?: string;

  /**
   * Callback when a row is clicked
   */
  onRowClick?: (row: T) => void;

  /**
   * Index of row to highlight
   */
  highlightedRowIndex?: number;

  /**
   * Background color for the table header
   */
  headerBgColor?: 'white' | 'gray' | 'blue';
}

// Internal components
const TableHeader = <T extends {}>() => {
  const {
    columns,
    sortState,
    setSortState,
    compact,
    headerBgColor = 'white'
  } = useTableContext<T>();
  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return;
    const id = column.id as keyof T;
    let direction: SortDirection = 'asc';
    if (sortState.column === id) {
      if (sortState.direction === 'asc') {
        direction = 'desc';
      } else if (sortState.direction === 'desc') {
        direction = undefined;
      }
    }
    setSortState({
      column: direction ? id : undefined,
      direction
    });
  };
  const headerBgColorClass = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50'
  };
  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';
  return <thead className={cn(headerBgColorClass.white, 'border-b border-gray-200')}>
      <tr>
        {columns.map((column) => {
        const isSorted = sortState.column === column.id;
        const sortDirection = sortState.direction;
        return <th key={column.id} style={{
          width: column.width
        }} className={cn(paddingClass, 'text-left text-xs font-medium text-gray-500 uppercase tracking-wider', column.sortable && 'cursor-pointer', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right', column.className, column.hideOnMobile && 'hidden sm:table-cell')} onClick={() => column.sortable && handleSort(column)} aria-sort={!isSorted ? 'none' : sortDirection === 'asc' ? 'ascending' : 'descending'}>

              <div className={`flex items-center ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-between'} font-work-sans`}>
                {typeof column.header === 'string' ? <span className="font-work-sans">{column.header}</span> : column.header}
                
                {column.sortable && <div className="ml-2 flex flex-col font-work-sans">
                    <Icon name="faChevronUp" className={cn('h-2 w-2 -mb-0.5', isSorted && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400')} solid={false} />

                    <Icon name="faChevronDown" className={cn('h-2 w-2', isSorted && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400')} solid={false} />

                  </div>}
              </div>
            </th>;
      })}
      </tr>
    </thead>;
};
const TableBody = <T extends {}>() => {
  const {
    data,
    columns,
    pagination,
    currentPage,
    pageSize,
    onRowClick,
    hoverable,
    striped,
    highlightedRowIndex,
    compact
  } = useTableContext<T>();
  const paginatedData = useMemo(() => {
    if (!pagination) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, pagination, currentPage, pageSize]);
  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      return row[column.accessor as keyof T];
    }
    return undefined;
  };
  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';
  if (paginatedData.length === 0) {
    return <tbody>
        <tr>
          <td colSpan={columns.length} className={`${paddingClass} text-center text-sm text-gray-500 font-work-sans`}>
            No data available
          </td>
        </tr>
      </tbody>;
  }
  return <tbody className="bg-white divide-y divide-gray-200">
      {paginatedData.map((row, rowIndex) => {
      const isHighlighted = highlightedRowIndex !== undefined && rowIndex === highlightedRowIndex;
      return <tr key={rowIndex} className={cn(hoverable && 'hover:bg-gray-50', striped && rowIndex % 2 === 1 && 'bg-gray-50', isHighlighted && 'bg-blue-50', onRowClick && 'cursor-pointer')} onClick={() => onRowClick && onRowClick(row)}>

            {columns.map((column) => {
          const value = getCellValue(row, column);
          return <td key={column.id} className={cn(paddingClass, 'text-sm whitespace-nowrap', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right', column.className, column.hideOnMobile && 'hidden sm:table-cell')}>

                  {column.cell ? column.cell({
              row,
              value
            }) : value}
                </td>;
        })}
          </tr>;
    })}
    </tbody>;
};
const TablePagination = <T extends {}>() => {
  const {
    data,
    pagination,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    compact
  } = useTableContext<T>();
  if (!pagination) return null;
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, data.length);
  return <div className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} flex items-center justify-between border-t border-gray-200 bg-white font-work-sans`}>
      <div className="flex-1 flex justify-between sm:hidden font-work-sans">
        <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-work-sans">

          Previous
        </button>
        <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-work-sans">

          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between font-work-sans">
        <div className="font-work-sans">
          <p className="text-sm text-gray-700 font-work-sans">
            Showing <span className="font-medium font-work-sans">{data.length > 0 ? startIndex : 0}</span> to{' '}
            <span className="font-medium font-work-sans">{endIndex}</span> of{' '}
            <span className="font-medium font-work-sans">{data.length}</span> results
          </p>
        </div>
        <div className="flex items-center font-work-sans">
          <div className="mr-4 font-work-sans">
            <label htmlFor="pageSize" className="mr-2 text-sm text-gray-700 font-work-sans">
              Rows per page:
            </label>
            <select id="pageSize" value={pageSize} onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1); // Reset to first page when changing page size
          }} className="border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-work-sans">

              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px font-work-sans" aria-label="Pagination">
            <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-work-sans">

              <span className="sr-only font-work-sans">Previous</span>
              <Icon name="faChevronLeft" className="h-5 w-5" solid={false} />
            </button>
            
            {/* Simple pagination for simplicity, could be expanded to show page numbers */}
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 font-work-sans">
              {currentPage} / {totalPages || 1}
            </span>
            
            <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-work-sans">

              <span className="sr-only font-work-sans">Next</span>
              <Icon name="faChevronRight" className="h-5 w-5" solid={false} />
            </button>
          </nav>
        </div>
      </div>
    </div>;
};

// Main Table component
export const Table = <T extends {}>({
  data,
  columns,
  sortable = true,
  defaultSort,
  pagination = false,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  striped = false,
  hoverable = true,
  bordered = true,
  compact = false,
  className,
  containerClassName,
  stickyHeader = false,
  emptyState,
  loadingState,
  isLoading = false,
  ariaLabel = 'Data table',
  onRowClick,
  highlightedRowIndex,
  headerBgColor = 'white'
}: TableProps<T>) => {
  // State
  const [sortState, setSortState] = useState<SortState<T>>({
    column: defaultSort?.column,
    direction: defaultSort?.direction
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return [...data];
    }
    return [...data].sort((a, b) => {
      const column = columns.find((col) => col.id === sortState.column);
      if (column?.sortFn) {
        return column.sortFn(a, b, sortState.direction);
      }
      const valueA = column?.accessor ? typeof column.accessor === 'function' ? column.accessor(a) : a[column.accessor as keyof T] : null;
      const valueB = column?.accessor ? typeof column.accessor === 'function' ? column.accessor(b) : b[column.accessor as keyof T] : null;

      // Handle different value types
      if (valueA === valueB) return 0;

      // Handle null/undefined
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      // Handle dates
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortState.direction === 'asc' ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
      }

      // Handle strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortState.direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      // Handle numbers
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortState.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Default comparison
      return sortState.direction === 'asc' ? String(valueA).localeCompare(String(valueB)) : String(valueB).localeCompare(String(valueA));
    });
  }, [data, columns, sortState]);

  // Context value
  const contextValue = {
    data: sortedData,
    columns,
    sortState,
    setSortState,
    pagination,
    currentPage,
    pageSize: internalPageSize,
    setCurrentPage,
    setPageSize: setInternalPageSize,
    onRowClick,
    hoverable,
    striped,
    highlightedRowIndex,
    compact,
    headerBgColor
  };
  if (isLoading && loadingState) {
    return <div className="min-w-full font-work-sans">{loadingState}</div>;
  }
  if (data.length === 0 && emptyState) {
    return <div className="min-w-full font-work-sans">{emptyState}</div>;
  }
  return <TableContext.Provider value={contextValue}>
      <div className={`${cn('overflow-x-auto rounded-lg', containerClassName)} font-work-sans`}>
        <table className={cn('min-w-full divide-y divide-gray-200', bordered && 'border border-gray-200', className)} aria-label={ariaLabel}>

          <TableHeader<T> />
          <TableBody<T> />
        </table>
        <TablePagination<T> />
      </div>
    </TableContext.Provider>;
};

// TableCell component for compound pattern
interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}
export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  className
}) => {
  return <td className={cn('px-4 py-3 text-sm', align === 'center' && 'text-center', align === 'right' && 'text-right', className)}>

      {children}
    </td>;
};

// Create an example usage component to demonstrate how to use the Table
export function TableExample() {
  // Example data
  const data = [{
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active'
  }, {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Inactive'
  }, {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'Editor',
    status: 'Active'
  }, {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'User',
    status: 'Pending'
  }, {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'Admin',
    status: 'Active'
  }];

  // Example columns
  const columns: ColumnDef<typeof data[0]>[] = [{
    id: 'id',
    header: 'ID',
    accessor: 'id',
    width: '50px',
    align: 'center'
  }, {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    cell: ({
      value
    }) => <span className="text-blue-600 hover:underline cursor-pointer font-work-sans">{value}</span>
  }, {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true
  }, {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    sortable: true
  }, {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: ({
      value
    }) => <span className={`${cn('px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', value === 'Active' && 'bg-green-100 text-green-800', value === 'Inactive' && 'bg-red-100 text-red-800', value === 'Pending' && 'bg-yellow-100 text-yellow-800')} font-work-sans`}>

          {value}
        </span>
  }];
  return <div className="space-y-6 font-work-sans">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-2 font-sora">Basic Table</h2>
        <Table data={data} columns={columns} sortable={true} pagination={true} pageSize={2} hoverable={true} bordered={true} onRowClick={(row) => console.log('Row clicked:', row)} />

      </div>
      
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-2 font-sora">Striped Table</h2>
        <Table data={data} columns={columns} sortable={true} striped={true} hoverable={true} bordered={true} />

      </div>
      
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-2 font-sora">Compact Table</h2>
        <Table data={data} columns={columns} sortable={true} compact={true} hoverable={true} bordered={true} />

      </div>
    </div>;
}