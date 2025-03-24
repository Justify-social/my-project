import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearch } from '@/context/SearchContext';
import SearchResults from './SearchResults';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '' }) => {
  const { handleSearch, isOpen, openSearch, closeSearch } = useSearch();
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
    }, 500); // Increased debounce time for better performance
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
    <div className={`relative ${className} font-work-sans`} ref={searchBarRef}>
      <form onSubmit={handleSubmit}>
        <div
          className={`w-full bg-gray-200 rounded-md px-4 py-2 flex items-center transition-all ${isOpen ? 'bg-white border border-gray-300 shadow-sm' : 'hover:bg-gray-300'} font-work-sans`}
          onClick={openSearch}>

          <Image src="/app/magnifying-glass.svg" alt="Search" width={20} height={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search campaigns, influencers, or reports."
            className="flex-grow bg-transparent focus:outline-none px-2 text-sm font-work-sans"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={openSearch} />

          <span className="text-gray-500 text-xs font-work-sans">⌘ K</span>
        </div>
      </form>
      
      <SearchResults />
    </div>);

};

export default SearchBar;