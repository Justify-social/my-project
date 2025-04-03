'use client';

import { Icon } from '@/components/ui/atoms/icon';
import React, { useEffect, useRef, useState } from 'react';
import { IconAdapter } from "@/components/ui/utils/font-awesome-adapter";
import { Input } from '@/components/ui/atoms/input';
import { cn } from '@/lib/utils';
import { useSearch } from '@/contexts/SearchContext';
import SearchResults from './search-results/SearchResults';

export interface SearchBarProps {
  /**
   * Additional class names
   */
  className?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether to autoFocus the input
   */
  autoFocus?: boolean;
}

/**
 * SearchBar component that integrates with Algolia via SearchContext
 * Includes the search input and displays search results
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search campaigns...',
  autoFocus = false
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { query, handleSearch, isOpen, openSearch, closeSearch, clearSearch } = useSearch();
  const [localQuery, setLocalQuery] = useState(query);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local query with context query
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Handle clicks outside the search bar to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeSearch]);

  // Handle escape key to close search results
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [closeSearch]);

  // Focus the input when autoFocus is true
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalQuery(newQuery);
    
    if (newQuery.trim()) {
      openSearch();
      handleSearch(newQuery);
    } else {
      clearSearch();
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    if (localQuery.trim()) {
      openSearch();
    }
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      handleSearch(localQuery);
      openSearch();
    }
  };

  return (
    <div 
      ref={searchBarRef} 
      className={cn('relative w-full font-work-sans', className)}
    >
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={searchInputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-4 h-10 w-full font-work-sans bg-white', 
            'border border-gray-200 focus:border-[var(--accent-color)]',
            'focus-visible:ring-1 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-0',
            isFocused && 'border-[var(--accent-color)]'
          )}
        />
        <button
          type="submit"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-label="Search"
        >
          <Icon iconId="faMagnifyingGlassLight" className="w-4 h-4"/>
        </button>
        {localQuery && (
          <button
            type="button"
            onClick={() => {
              setLocalQuery('');
              clearSearch();
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <Icon iconId="faTimesLight" className="w-4 h-4"/>
          </button>
        )}
      </form>

      {/* Search Results */}
      <SearchResults />
    </div>
  );
};

export default SearchBar; 