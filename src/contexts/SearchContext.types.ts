import { ReactNode } from 'react';
import { CampaignSearchResult } from '@/lib/algolia';

export interface SearchContextProps {
  query: string;
  results: CampaignSearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  handleSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export interface SearchProviderProps {
  children: ReactNode;
}

export default SearchContextProps;
