import React from 'react';
import Link from 'next/link';
import { CampaignSearchResult } from '@/lib/algolia';
import { useSearch } from '@/contexts/SearchContext';

export interface SearchResultsProps {
  className?: string;
}

/**
 * Search results component that displays campaign search results
 * Uses the SearchContext to get results and search state
 */
export const SearchResults: React.FC<SearchResultsProps> = ({ className = '' }) => {
  const { results, isSearching, query, isOpen, clearSearch, closeSearch } = useSearch();

  // Early return if search isn't open or there's no query
  if (!isOpen || !query.trim()) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border border-gray-200 max-h-96 overflow-auto z-50 ${className} font-work-sans`}>
      {isSearching ?
      <div className="flex items-center justify-center py-8 font-work-sans">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--accent-color)] font-work-sans"></div>
        </div> :
      results.length > 0 ?
      <div className="font-work-sans">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 font-work-sans">
            <p className="text-sm text-gray-500 font-work-sans">
              Found {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
            </p>
            <button
            onClick={closeSearch}
            className="text-xs text-gray-500 hover:text-gray-800 font-work-sans">

              Close
            </button>
          </div>
          <ul className="font-work-sans">
            {results.map((result) =>
          <li key={result.objectID} className="border-b border-gray-100 last:border-b-0 font-work-sans">
                <Link
              href={`/campaigns/${result.id}`}
              className="block p-3 hover:bg-gray-50 transition"
              onClick={() => {
                clearSearch();
                closeSearch();
              }}>

                  <div className="flex items-start font-work-sans">
                    <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center mr-3 flex-shrink-0 text-gray-500 text-xs font-medium font-work-sans">
                      {result.platform ? result.platform.slice(0, 2).toUpperCase() : 'CA'}
                    </div>
                    <div className="flex-1 min-w-0 font-work-sans">
                      <div className="flex items-start justify-between font-work-sans">
                        <h4 className="font-medium text-[var(--primary-color)] truncate font-sora">
                          {result.campaignName || 'Untitled Campaign'}
                        </h4>
                        {result.status &&
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    result.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                    result.status.toLowerCase() === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'} font-work-sans`
                    }>
                            {result.status}
                          </span>
                    }
                      </div>
                      {result.description &&
                  <p className="text-sm text-gray-600 line-clamp-1 mt-0.5 font-work-sans">
                          {result.description}
                        </p>
                  }
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 font-work-sans">
                        {result.brand &&
                    <span className="font-work-sans">{result.brand}</span>
                    }
                        {result.startDate &&
                    <span className="font-work-sans">
                            {formatDate(result.startDate)}
                            {result.endDate && ` - ${formatDate(result.endDate)}`}
                          </span>
                    }
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
          )}
          </ul>
        </div> :

      <div className="py-6 px-4 text-center font-work-sans">
          <p className="text-gray-500 font-work-sans">No campaigns found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-1 font-work-sans">Try using different keywords or check spelling</p>
        </div>
      }
    </div>);

};

export default SearchResults; 