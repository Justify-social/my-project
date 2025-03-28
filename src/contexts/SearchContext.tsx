import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import SearchContextProps from './SearchContext.types';
import SearchProviderProps from './SearchContext.types';
import { searchCampaigns, CampaignSearchResult } from '@/lib/algolia';

interface SearchContextProps {
  query: string;
  results: CampaignSearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  handleSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CampaignSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Use an abort controller to cancel pending requests
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    // Don't search if the query is the same as the current one and we already have results
    if (searchQuery === query && results.length > 0) {
      return;
    }
    
    // Reset state
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
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
    try {
      const searchResults = await searchCampaigns(searchQuery);
      
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
    }
  }, [query, results.length]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    query,
    results,
    isSearching,
    isOpen,
    handleSearch,
    clearSearch,
    openSearch,
    closeSearch,
  }), [
    query,
    results,
    isSearching,
    isOpen,
    handleSearch,
    clearSearch,
    openSearch,
    closeSearch,
  ]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext; 