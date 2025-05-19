'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs'; // Import useAuth
// Revert to standard type import
import { SearchContextProps, SearchProviderProps } from './SearchProvider.types';
import { searchAlgoliaCampaigns, CampaignSearchResult } from '@/lib/algolia';

// Keep context name as SearchContext for clarity internally
const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { orgId } = useAuth(); // Get orgId from Clerk
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CampaignSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use an abort controller to cancel pending requests
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      // Immediately update the query state for consistency
      setQuery(searchQuery);
      setIsOpen(true); // Open results pane when searching

      // Clear previous results immediately if there is a new search query
      if (searchQuery.trim()) {
        setResults([]); // Clear old results from UI
      } else {
        // If search query is empty or just whitespace
        setResults([]);
        setIsOpen(false); // Close if query is cleared
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsSearching(true);
      console.time(`Search Execution: ${searchQuery}`); // Start timer
      try {
        // Pass orgId to searchAlgoliaCampaigns
        // searchAlgoliaCampaigns handles orgId being potentially null/undefined
        const searchResults = await searchAlgoliaCampaigns(searchQuery, orgId ?? undefined);

        // Only update if this is still the latest request
        if (!abortController.signal.aborted) {
          setResults(searchResults);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Search error:', error);
          setResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
        console.timeEnd(`Search Execution: ${searchQuery}`); // End timer
      }
    },
    [orgId] // Add orgId to dependencies of useCallback
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false); // Close when clearing
  }, []);

  // Keep openSearch/closeSearch for potential manual control later
  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      query,
      results,
      isSearching,
      isOpen,
      handleSearch,
      clearSearch,
      openSearch,
      closeSearch,
    }),
    [query, results, isSearching, isOpen, handleSearch, clearSearch, openSearch, closeSearch]
  );

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};

// Export hook for consuming the context
export const useSearch = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Optional: Export context itself if needed elsewhere, though hook is preferred
// export default SearchContext;
