import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/string/utils';
import { useSearch } from '@/contexts/SearchContext';
import { CommandMenu } from '../../molecules/command-menu';
import { Icon } from '@/components/ui/atoms/icons';

export interface SearchBarProps {
  /**
   * Additional CSS classes to apply to the component
   */
  className?: string;
  
  /**
   * Placeholder text to display in the search input
   */
  placeholder?: string;
  
  /**
   * Keyboard shortcut to display
   */
  shortcut?: string;
}

/**
 * SearchBar component that provides a search input with keyboard shortcuts
 * and integrates with the command menu for enhanced navigation
 */
export function SearchBar({
  className = '',
  placeholder = 'Search campaigns, influencers, or reports.',
  shortcut = '⌘K'
}: SearchBarProps) {
  const { handleSearch, isOpen, openSearch, closeSearch, results, isSearching, query } = useSearch();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeSearch]);

  // Add keyboard shortcut for search (⌘K)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }

      // Escape key to close search
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [openSearch, closeSearch, isOpen]);

  // Cleanup the timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500); // Debounce time for better performance
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear existing timeout to prevent race conditions
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    handleSearch(inputValue);
  };

  return (
    <div className={cn("relative", className)} ref={searchBarRef}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "w-full rounded-md px-4 py-2 flex items-center transition-all",
            isOpen 
              ? "bg-white border border-gray-300 shadow-sm" 
              : "bg-gray-200 hover:bg-gray-300"
          )}
          onClick={openSearch}>

          <Icon name="search" size="sm" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="flex-grow bg-transparent focus:outline-none px-2 text-sm"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={openSearch} />

          <span className="text-gray-500 text-xs">{shortcut}</span>
        </div>
      </form>
      
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border border-gray-200 max-h-96 overflow-auto z-50 mt-1">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <p className="text-sm text-gray-500">
                  Found {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
                </p>
                <button
                  onClick={closeSearch}
                  className="text-xs text-gray-500 hover:text-gray-800">
                  Close
                </button>
              </div>
              <ul>
                {results.map((result) => (
                  <li key={result.objectID} className="border-b border-gray-100 last:border-b-0">
                    {/* Result item UI would go here */}
                    <div className="p-3 hover:bg-gray-50 transition">
                      <div className="font-medium text-blue-600">{result.title || result.name || 'Untitled'}</div>
                      {result.description && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">{result.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="py-6 px-4 text-center">
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try using different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar; 