'use client';

import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/atoms/icons'
import { Table, ColumnDef, SortDirection, SortState, TableProps } from '../table';

// Types
export interface Filter<T> {
  id: string;
  field: keyof T;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte';
}

/**
 * Toolbar component for the DataGrid
 */
const DataGridToolbar = <T extends Record<string, unknown>>() => {
  const {
    filters,
    setFilters,
    filterOptions,
    selectedRows,
    deselectAllRows,
    searchTerm,
    setSearchTerm
  } = useDataGridContext<T>();
  
  // ... existing code ...
  
  return (
    <div className="mb-4 space-y-2">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon name="faSearch" className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md"
            placeholder="Search..."
          />
        </div>
        
        {/* Add filter button */}
        <button
          type="button"
          onClick={handleAddFilter}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
        >
          <span className="flex items-center">
            <Icon name="faFilter" className="h-4 w-4 mr-1" />
            Add Filter
          </span>
        </button>
        
        {/* Selection actions */}
        {selectedRows.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{selectedRows.length} selected</span>
            <button
              type="button"
              onClick={deselectAllRows}
              className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      {/* Active filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => {
            const filterOption = filterOptions.find(opt => opt.field === filter.field);
            const operatorLabel = filterOption?.operators.find(op => op.id === filter.operator)?.label || filter.operator;
            
            return (
              <div key={filter.id} className="flex items-center bg-gray-100 rounded-md px-2 py-1 text-sm">
                <select
                  value={String(filter.field)}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value as keyof T, null, null)}
                  className="bg-transparent border-none outline-none text-gray-700 pr-1 font-medium"
                >
                  {filterOptions.map(option => (
                    <option key={String(option.field)} value={String(option.field)}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filter.operator}
                  onChange={(e) => handleFilterChange(filter.id, null, e.target.value as Filter<T>['operator'], null)}
                  className="bg-transparent border-none outline-none text-gray-700 px-1"
                >
                  {filterOption?.operators.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>
                
                <input
                  type={filterOption?.type === 'number' ? 'number' : 'text'}
                  value={filter.value}
                  onChange={(e) => handleFilterChange(filter.id, null, null, e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-700 px-1 w-20"
                />
                
                <button
                  type="button"
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <Icon name="faTimes" className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ... existing code ...

// Export CSV button in bottom toolbar with fixed icon
{exportable && (
  <button
    type="button"
    onClick={exportToCSV}
    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium ml-auto"
  >
    <span className="flex items-center">
      <Icon name="faDownload" className="h-4 w-4 mr-1" />
      Export CSV
    </span>
  </button>
)}

/**
 * DataGrid component
 *
 * Extends Table with additional features like filtering, search, export, and selection.
 */
export const DataGrid = <T extends Record<string, unknown>>(props: DataGridProps<T>) => {
  // ... existing implementation ...
};

// Add default export to ensure proper component loading
export default DataGrid; 