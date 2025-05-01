'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';

// Define the shape of the filter values
// Matches the structure used in MarketplacePage state (to be added in Ticket 1.7)
export interface FilterValues {
  platforms?: PlatformEnum[]; // Use array for potential multi-select later
  minScore?: number;
  maxScore?: number;
  minFollowers?: number;
  maxFollowers?: number;
  audienceAge?: string;
  audienceLocation?: string;
  isInsightIQVerified?: boolean;
  audienceQuality?: 'High' | 'Medium' | 'Low';
}

interface MarketplaceFiltersProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentFilters: FilterValues; // Receive the applied filters from parent
  onApplyFilters: (newFilters: FilterValues) => void;
  onResetFilters: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export function MarketplaceFilters({
  isOpen,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onResetFilters,
  searchTerm,
  onSearchTermChange,
}: MarketplaceFiltersProps) {
  // Use local state synced with props for controlled components
  const [localFilters, setLocalFilters] = React.useState<FilterValues>(currentFilters);

  // Sync local state when currentFilters prop changes (e.g., on reset from parent)
  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // --- Handlers for updating local state ---

  // Handle platform checkbox changes
  const handlePlatformChange = (platform: PlatformEnum, checked: boolean | 'indeterminate') => {
    setLocalFilters(prev => {
      const currentPlatforms = prev.platforms ?? [];
      if (checked === true) {
        // Add platform if not already present
        return { ...prev, platforms: [...currentPlatforms, platform] };
      } else {
        // Remove platform
        return { ...prev, platforms: currentPlatforms.filter(p => p !== platform) };
      }
    });
  };

  // Handle score range changes from Slider
  const handleScoreSliderChange = (value: number[]) => {
    if (value.length === 2) {
      setLocalFilters(prev => ({
        ...prev,
        minScore: value[0] === 0 ? undefined : value[0], // Treat 0 as undefined/no filter
        maxScore: value[1] === 100 ? undefined : value[1], // Treat 100 as undefined/no filter
      }));
    }
  };

  // Generic handler for Input fields (Text and Number)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const parsedValue = type === 'number' ? parseFloat(value) || undefined : value || undefined;
    setLocalFilters(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (checked: boolean | 'indeterminate', name: keyof FilterValues) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: checked === true ? true : undefined, // Store true or undefined
    }));
  };

  // Handle Audience Quality changes
  const handleAudienceQualityChange = (value: string) => {
    // Map empty string OR our specific 'any' value back to undefined
    const qualityValue =
      value === '' || value === 'any' ? undefined : (value as 'High' | 'Medium' | 'Low');
    setLocalFilters(prev => ({ ...prev, audienceQuality: qualityValue }));
  };

  // --- Action Handlers ---

  const handleApply = () => {
    logger.debug('[MarketplaceFilters] Applying local filters:', localFilters);
    onApplyFilters(localFilters);
    onOpenChange(false); // Close sheet on apply
  };

  const handleReset = () => {
    logger.debug('[MarketplaceFilters] Resetting filters');
    onResetFilters(); // Parent handles resetting the activeFilters state
    // localFilters will update via useEffect when currentFilters prop changes
    onSearchTermChange(''); // Explicitly clear search term on reset
    onOpenChange(false); // Close sheet
  };

  // Handle search input change directly via prop function
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(event.target.value);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 md:w-96 h-full flex flex-col" side="right">
        <SheetHeader className="mb-4 border-b pb-4 px-4 pt-4">
          <SheetTitle>Filter Influencers</SheetTitle>
          <SheetDescription>Refine the list based on your criteria.</SheetDescription>
        </SheetHeader>

        <div className="p-4 flex-grow space-y-6 overflow-y-auto">
          {/* Search Term Input */}
          <div className="space-y-2">
            <Label htmlFor="search-term">Search by Name/Keyword</Label>
            <Input
              id="search-term"
              placeholder="e.g., cooking, tech blogger..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <p className="text-xs text-muted-foreground">
              Searches name, handle, bio, and content keywords.
            </p>
          </div>

          {/* Platforms Filter - Checkboxes */}
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex flex-col space-y-1">
              {[PlatformEnum.Instagram, PlatformEnum.YouTube, PlatformEnum.TikTok].map(platform => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={localFilters.platforms?.includes(platform) ?? false}
                    onCheckedChange={checked => handlePlatformChange(platform, checked)}
                  />
                  <Label htmlFor={`platform-${platform}`} className="font-normal">
                    {platform} {/* Display enum value directly */}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Select one or more platforms.</p>
          </div>

          {/* Justify Score Filter - Controlled Component */}
          <div className="space-y-2">
            <Label>
              Justify Score ({localFilters.minScore ?? 0} - {localFilters.maxScore ?? 100})
            </Label>
            <Slider
              value={[localFilters.minScore ?? 0, localFilters.maxScore ?? 100]} // Reflect local state
              onValueChange={handleScoreSliderChange}
              max={100}
              step={1}
              minStepsBetweenThumbs={1} // Prevent min > max
            />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          {/* Followers Count Filter - Controlled Component */}
          <div className="space-y-2">
            <Label>Followers</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                name="minFollowers"
                value={localFilters.minFollowers ?? ''}
                onChange={handleInputChange}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max"
                name="maxFollowers"
                value={localFilters.maxFollowers ?? ''}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          {/* Audience Age Filter - Controlled Component */}
          <div className="space-y-2">
            <Label htmlFor="audienceAge">Audience Age Range</Label>
            <Select
              name="audienceAge" // Keep name for potential form handling
              value={localFilters.audienceAge ?? ''} // Use empty string for uncontrolled state when undefined
              onValueChange={
                value => setLocalFilters(prev => ({ ...prev, audienceAge: value || undefined })) // Set to undefined if empty string selected
              }
            >
              <SelectTrigger id="audienceAge">
                <SelectValue placeholder="Select age range..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">18-24</SelectItem>
                <SelectItem value="25-34">25-34</SelectItem>
                <SelectItem value="35-44">35-44</SelectItem>
                <SelectItem value="45-54">45-54</SelectItem>
                <SelectItem value="55-64">55-64</SelectItem>
                <SelectItem value="65+">65+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audience Location Filter - Controlled Component */}
          <div className="space-y-2">
            <Label htmlFor="audienceLocation">Audience Location</Label>
            <Input
              id="audienceLocation"
              name="audienceLocation"
              placeholder="Enter location (e.g., United States)"
              value={localFilters.audienceLocation ?? ''}
              onChange={handleInputChange}
            />
          </div>

          {/* InsightIQ Verified Filter - Controlled Component */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isInsightIQVerified"
              name="isInsightIQVerified"
              checked={localFilters.isInsightIQVerified ?? false}
              onCheckedChange={checked => handleCheckboxChange(checked, 'isInsightIQVerified')}
            />
            <Label htmlFor="isInsightIQVerified">InsightIQ Verified Only</Label>
          </div>

          {/* Audience Quality Filter - Controlled Component */}
          <div className="space-y-2">
            <Label htmlFor="audienceQuality">Audience Quality</Label>
            <Select
              name="audienceQuality"
              value={localFilters.audienceQuality ?? ''}
              onValueChange={handleAudienceQualityChange}
            >
              <SelectTrigger id="audienceQuality">
                <SelectValue placeholder="Select quality..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Medium">Medium or High</SelectItem>
                <SelectItem value="High">High Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer remains fixed at the bottom */}
        {/* Apply fixed height, adjust padding, ensure vertical centering */}
        <SheetFooter className="h-[65px] border-t border-border bg-background px-4 flex items-center justify-end gap-2 flex-shrink-0">
          <Button onClick={handleApply}>Apply Filters</Button>
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          {/* Removed SheetClose as closing is handled by onOpenChange */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
