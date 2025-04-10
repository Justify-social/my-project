'use client';

import React from 'react';
import Link from 'next/link';
import { useSearch } from '@/providers/SearchProvider';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';

export function SearchResultsDisplay() {
    const { results, isOpen, isSearching, query, closeSearch } = useSearch();

    if (!isOpen || !query) {
        return null; // Don't render if search isn't open or query is empty
    }

    return (
        <div
            className={cn(
                'absolute top-full left-0 w-full z-[100] mt-1',
                'bg-white border border-gray-300 rounded-md shadow-lg',
                'max-h-80 overflow-y-auto'
            )}
        >
            {isSearching && (
                <div className="p-4 text-sm text-gray-600 flex items-center justify-center">
                    <Icon iconId="faCircleNotchLight" className="animate-spin mr-2 w-4 h-4" />
                    Loading...
                </div>
            )}

            {!isSearching && results.length === 0 && query && (
                <div className="p-4 text-sm text-gray-500 text-center">
                    No campaigns found matching "{query}".
                </div>
            )}

            {!isSearching && results.length > 0 && (
                <ul className="divide-y divide-gray-200">
                    {results.map((campaign) => (
                        <li key={campaign.objectID}>
                            <Link
                                href={`/campaigns/${campaign.objectID}`}
                                className={cn(
                                    'block px-4 py-3 hover:bg-sky-50 transition-colors duration-150',
                                    'text-sm text-gray-800 hover:text-sky-700'
                                )}
                                onClick={closeSearch}
                            >
                                <span className="font-medium">{campaign.campaignName}</span>
                                {campaign.description && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {campaign.description}
                                    </p>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 