'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext, Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { influencerService } from '@/services/influencer';
import { InfluencerSummary } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/lib/logger';
import { toast } from 'react-hot-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { cn } from '@/lib/utils';

// Import the same platform data from Step1Content
const supportedPlatforms = [
  {
    value: PlatformEnum.Facebook,
    label: 'Facebook',
    iconId: 'brandsFacebook',
  },
  {
    value: PlatformEnum.Instagram,
    label: 'Instagram',
    iconId: 'brandsInstagram',
  },
  {
    value: PlatformEnum.LinkedIn,
    label: 'LinkedIn',
    iconId: 'brandsLinkedin',
  },
  {
    value: PlatformEnum.TikTok,
    label: 'TikTok',
    iconId: 'brandsTiktok',
  },
  {
    value: PlatformEnum.Twitter,
    label: 'Twitter/X',
    iconId: 'brandsXTwitter',
  },
  {
    value: PlatformEnum.YouTube,
    label: 'YouTube',
    iconId: 'brandsYoutube',
  },
];

interface InfluencerSearchEntryProps {
  index: number;
  control: Control<any>;
  errors: FieldErrors<any>;
  remove: (index: number) => void;
}

interface InfluencerSearchResult {
  id: string;
  name: string | null;
  handle: string | null;
  platform: PlatformEnum;
  avatarUrl: string | null;
  followersCount: number | null;
  isVerified: boolean;
  engagementRate: number | null;
}

export const InfluencerSearchEntry: React.FC<InfluencerSearchEntryProps> = ({
  index,
  control,
  errors,
  remove,
}) => {
  const { watch, setValue } = useFormContext();

  // Watch current form values
  const currentPlatform = watch(`Influencer.${index}.platform`);
  const currentHandle = watch(`Influencer.${index}.handle`);

  // State for search functionality
  const [searchResults, setSearchResults] = useState<InfluencerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerSearchResult | null>(null);

  // Format follower count for display
  const formatFollowerCount = (count: number | null): string => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get platform info by value
  const getPlatformInfo = (platform: PlatformEnum) => {
    return supportedPlatforms.find(p => p.value === platform);
  };

  // Search function
  const searchInfluencers = useCallback(async (searchTerm: string, platform?: PlatformEnum) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    logger.info(`[InfluencerSearchEntry] Searching for: "${searchTerm}" on platform: ${platform}`);

    try {
      const filters: any = {
        searchTerm: searchTerm,
      };

      // If platform is selected, filter by it
      if (platform) {
        filters.platforms = [platform];
      }

      const response = await influencerService.getInfluencers({
        pagination: { page: 1, limit: 10 },
        filters,
      });

      const results: InfluencerSearchResult[] = response.influencers.map(
        (influencer: InfluencerSummary) => ({
          id: influencer.id,
          name: influencer.name,
          handle: influencer.handle,
          platform: influencer.platformEnum || influencer.platforms?.[0] || PlatformEnum.Instagram,
          avatarUrl: influencer.avatarUrl,
          followersCount: influencer.followersCount,
          isVerified: influencer.isVerified,
          engagementRate: influencer.engagementRate ?? null,
        })
      );

      setSearchResults(results);
      logger.info(`[InfluencerSearchEntry] Found ${results.length} results`);
    } catch (error) {
      logger.error('[InfluencerSearchEntry] Search error:', {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error('Failed to search influencers');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
    searchInfluencers(searchTerm, currentPlatform);
  }, 500);

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setSelectedInfluencer(null);

    // Update form value immediately for typing experience
    setValue(`Influencer.${index}.handle`, value);

    // Trigger search
    if (value.length >= 2) {
      debouncedSearch(value);
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  // Handle influencer selection from search results
  const handleInfluencerSelect = (influencer: InfluencerSearchResult) => {
    setSelectedInfluencer(influencer);
    setSearchInput(influencer.handle || '');
    setValue(`Influencer.${index}.handle`, influencer.handle || '');
    setValue(`Influencer.${index}.platform`, influencer.platform);
    setSearchOpen(false);
    setSearchResults([]);
    logger.info(`[InfluencerSearchEntry] Selected influencer:`, {
      id: influencer.id,
      handle: influencer.handle,
      platform: influencer.platform,
    });
  };

  // Handle platform change
  const handlePlatformChange = (platform: PlatformEnum) => {
    setValue(`Influencer.${index}.platform`, platform);

    // Re-search if there's a search term
    if (searchInput.length >= 2) {
      searchInfluencers(searchInput, platform);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedInfluencer(null);
    setSearchInput('');
    setValue(`Influencer.${index}.handle`, '');
    setSearchResults([]);
    setSearchOpen(false);
  };

  // Update search input when form value changes externally
  useEffect(() => {
    if (currentHandle !== searchInput && !selectedInfluencer) {
      setSearchInput(currentHandle || '');
    }
  }, [currentHandle, searchInput, selectedInfluencer]);

  return (
    <Card className="mb-4 border-border bg-card/50 relative overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 space-y-4">
        {/* Only show trash icon for second influencer and beyond */}
        {index > 0 && (
          <div className="flex justify-end absolute top-2 right-2">
            <IconButtonAction
              iconBaseName="faTrashCan"
              hoverColorClass="text-destructive"
              ariaLabel="Remove Influencer"
              className="h-7 w-7"
              onClick={() => remove(index)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Platform Selection */}
          <FormField
            control={control}
            name={`Influencer.${index}.platform`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform *</FormLabel>
                <Select
                  onValueChange={value => {
                    field.onChange(value);
                    handlePlatformChange(value as PlatformEnum);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedPlatforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center">
                          <Icon iconId={platform.iconId} className="h-4 w-4 mr-3 text-foreground" />
                          <span className="font-medium">{platform.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage>{(errors as any)?.Influencer?.[index]?.platform?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Enhanced Handle/Search Input */}
          <FormField
            control={control}
            name={`Influencer.${index}.handle`}
            render={() => (
              <FormItem>
                <FormLabel>Handle / Username *</FormLabel>
                <div className="space-y-3">
                  <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Search by handle or name..."
                              value={searchInput}
                              onChange={e => handleSearchInputChange(e.target.value)}
                              onFocus={() => {
                                if (searchResults.length > 0) {
                                  setSearchOpen(true);
                                }
                              }}
                              className={cn(
                                'transition-all duration-200 focus:ring-2 focus:ring-primary/20',
                                selectedInfluencer &&
                                  'border-green-500 bg-green-50 dark:bg-green-950/20'
                              )}
                            />
                            {/* Search icon when not loading */}
                            {!isSearching && searchInput.length < 2 && (
                              <Icon
                                iconId="faMagnifyingGlassLight"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                              />
                            )}
                            {/* Loading spinner - using same pattern as Draft button */}
                            {isSearching && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Icon
                                  iconId="faSpinnerLight"
                                  className="h-4 w-4 animate-spin text-primary"
                                  style={{ animation: 'spin 1s linear infinite' }}
                                />
                              </div>
                            )}
                            {/* Clear button when selected */}
                            {selectedInfluencer && !isSearching && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={handleClear}
                              >
                                <Icon
                                  iconId="faXmarkLight"
                                  className="h-3 w-3 text-muted-foreground hover:text-red-500"
                                />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                      </div>
                    </PopoverTrigger>

                    {searchResults.length > 0 && (
                      <PopoverContent
                        className="w-[--radix-popover-trigger-width] p-0"
                        align="start"
                        sideOffset={4}
                      >
                        <Command>
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>No influencers found.</CommandEmpty>
                            <CommandGroup>
                              {searchResults.map(influencer => {
                                const platformInfo = getPlatformInfo(influencer.platform);
                                return (
                                  <CommandItem
                                    key={influencer.id}
                                    onSelect={() => handleInfluencerSelect(influencer)}
                                    className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors duration-150"
                                  >
                                    <div className="flex-shrink-0">
                                      {influencer.avatarUrl ? (
                                        <img
                                          src={influencer.avatarUrl}
                                          alt={influencer.name || influencer.handle || ''}
                                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                      ) : (
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-white shadow-sm">
                                          <Icon
                                            iconId="faUserLight"
                                            className="h-6 w-6 text-muted-foreground"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="font-semibold text-sm truncate text-foreground">
                                          {influencer.name || influencer.handle}
                                        </p>
                                        {influencer.isVerified && (
                                          <Icon
                                            iconId="faCircleCheckLight"
                                            className="h-4 w-4 text-blue-500 flex-shrink-0"
                                          />
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                        <span className="truncate">@{influencer.handle}</span>
                                        {influencer.followersCount && (
                                          <>
                                            <span>•</span>
                                            <span className="font-medium">
                                              {formatFollowerCount(influencer.followersCount)}{' '}
                                              followers
                                            </span>
                                          </>
                                        )}
                                        {influencer.engagementRate && (
                                          <>
                                            <span>•</span>
                                            <span>
                                              {(influencer.engagementRate * 100).toFixed(1)}%
                                              engagement
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {platformInfo && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Icon
                                            iconId={platformInfo.iconId}
                                            className="h-3 w-3 mr-1"
                                          />
                                          {platformInfo.label}
                                        </Badge>
                                      )}
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    )}
                  </Popover>

                  {/* Selected Influencer Preview */}
                  {selectedInfluencer && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md transition-all duration-200">
                      <div className="flex-shrink-0">
                        {selectedInfluencer.avatarUrl ? (
                          <img
                            src={selectedInfluencer.avatarUrl}
                            alt={selectedInfluencer.name || selectedInfluencer.handle || ''}
                            className="h-10 w-10 rounded-full object-cover border-2 border-green-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-green-200">
                            <Icon iconId="faUserLight" className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-sm text-green-800 dark:text-green-200 truncate">
                            {selectedInfluencer.name || selectedInfluencer.handle}
                          </p>
                          {selectedInfluencer.isVerified && (
                            <Icon
                              iconId="faCircleCheckLight"
                              className="h-4 w-4 text-blue-500 flex-shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          {selectedInfluencer.followersCount &&
                            `${formatFollowerCount(selectedInfluencer.followersCount)} followers`}
                          {selectedInfluencer.engagementRate &&
                            ` • ${(selectedInfluencer.engagementRate * 100).toFixed(1)}% engagement`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPlatformInfo(selectedInfluencer.platform) && (
                          <Icon
                            iconId={getPlatformInfo(selectedInfluencer.platform)!.iconId}
                            className="h-4 w-4 text-green-600"
                          />
                        )}
                        <Icon iconId="faCheckLight" className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  )}
                </div>
                <FormMessage>{(errors as any)?.Influencer?.[index]?.handle?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
