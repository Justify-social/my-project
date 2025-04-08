import { ReactNode } from 'react';
import { CampaignSearchResult } from '@/lib/algolia';

// Interface for the Search Context value
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

// Interface for the Search Provider component props
export interface SearchProviderProps {
    children: ReactNode;
}

// Optional: Export a default if needed by specific import styles, 
// but named exports are generally preferred for interfaces.
// export default SearchContextProps; 