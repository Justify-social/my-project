'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import Image from 'next/image'; // Add import for Next/Image

interface GifSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGifSelected: (gifUrl: string) => void;
  initialSearchTerm?: string;
  giphyApiKey: string;
}

// Giphy Helper Function (encapsulated for this component)
async function fetchGifFromGiphyInternal(
  searchTerm: string,
  apiKey: string,
  limit: number = 12
): Promise<string[]> {
  if (!apiKey) {
    // console.warn('[Giphy] API key not configured for modal. Skipping GIF fetch.');
    // Using console.warn directly to avoid issues if logger is problematic
    return [];
  }
  if (!searchTerm || searchTerm.trim() === '') {
    // console.info('[Giphy] Empty search term in modal. Skipping GIF fetch.');
    return [];
  }

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
    searchTerm
  )}&limit=${limit}&offset=0&rating=g&lang=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Giphy] Modal API Error:', { status: response.status, data: errorData });
      throw new Error('Failed to fetch GIFs from Giphy.');
    }
    const data = await response.json();
    if (data.data && Array.isArray(data.data)) {
      return data.data
        .map(
          (gif: {
            images?: { downsized_medium?: { url?: string }; original?: { url?: string } };
          }) => gif.images?.downsized_medium?.url || gif.images?.original?.url
        )
        .filter((gifUrl: string | undefined): gifUrl is string => typeof gifUrl === 'string');
    }
    // console.info('[Giphy] No GIFs found for term in modal:', { searchTerm });
    return [];
  } catch (error) {
    console.error('[Giphy] Modal Fetch error:', { error });
    throw error; // Re-throw to be caught by executeSearch
  }
}

export function GifSearchModal({
  isOpen,
  onClose,
  onGifSelected,
  initialSearchTerm = '',
  giphyApiKey,
}: GifSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update search term if initialSearchTerm prop changes while modal is open
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm, isOpen]); // Rerun if isOpen changes, to reset if modal is reopened

  const executeSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    try {
      const gifs = await fetchGifFromGiphyInternal(searchTerm, giphyApiKey);
      setSearchResults(gifs);
      if (gifs.length === 0) {
        setError('No GIFs found for that term.');
      }
    } catch (e) {
      setError((e as Error).message || 'Failed to search for GIFs.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, giphyApiKey]);

  // Effect to trigger search when initialSearchTerm is set and modal opens
  // Useful if the modal should search immediately upon opening with a term
  useEffect(() => {
    if (isOpen && initialSearchTerm && searchTerm === initialSearchTerm) {
      // Avoids re-searching if user types then modal re-opens with old initial term
      // executeSearch(); // Option: uncomment to auto-search when opened with initial term
    }
  }, [isOpen, initialSearchTerm, searchTerm, executeSearch]);

  const handleGifClick = (gifUrl: string) => {
    onGifSelected(gifUrl);
    onClose(); // Typically, selecting a GIF also closes the modal
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // setSearchTerm(initialSearchTerm); // Option: reset to initial or empty
      // setSearchTerm(''); // More common to clear search term on close
      setSearchResults([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, initialSearchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Search for a GIF</DialogTitle>
          <DialogDescription>
            Enter a term to search for a GIF. Multiple results will be shown.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              id="gif-search-term-modal"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && executeSearch()}
              placeholder="e.g., happy cat, thumbs up"
              className="flex-grow"
            />
            <Button
              type="button"
              onClick={executeSearch}
              disabled={isLoading || !searchTerm.trim()}
            >
              {isLoading ? (
                <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Icon iconId="faMagnifyingGlassLight" className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <Icon iconId="faSpinnerLight" className="animate-spin h-8 w-8 text-primary" />
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchResults.length > 0 && !isLoading && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2 text-center">
                Results (click to use):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-1">
                {searchResults.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`} // Using URL and index for key
                    className="aspect-square relative cursor-pointer border hover:border-primary rounded overflow-hidden group bg-muted/30"
                    onClick={() => handleGifClick(url)}
                  >
                    <Image
                      src={url}
                      alt={`Search result ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" // Adjust sizes as needed
                      className="absolute top-0 left-0 w-full h-full object-contain"
                      loading="lazy" // Lazy load GIF images
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon iconId="faCircleCheckSolid" className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          {/* Optional: Keep search button if needed for re-search, but primary interaction is via input + Enter/Search Button above results */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exporting the component
export default GifSearchModal;
