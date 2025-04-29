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
  isPhylloVerified?: boolean;
}

interface MarketplaceFiltersProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentFilters: FilterValues; // Receive the applied filters from parent
  onApplyFilters: (newFilters: FilterValues) => void;
  onResetFilters: () => void;
}

export function MarketplaceFilters({
  isOpen,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}: MarketplaceFiltersProps) {
  // Use local state synced with props for controlled components
  const [localFilters, setLocalFilters] = React.useState<FilterValues>(currentFilters);

  // Sync local state when currentFilters prop changes (e.g., on reset from parent)
  React.useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // --- Handlers for updating local state ---

  // Handle platform changes (assuming single select for now)
  const handlePlatformChange = (value: string) => {
    // If multi-select is implemented later, this needs adjustment
    setLocalFilters(prev => ({ ...prev, platforms: value ? [value as PlatformEnum] : undefined }));
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
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 md:w-96 h-full flex flex-col overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Filter Influencers</SheetTitle>
          <SheetDescription>Refine the list based on your criteria.</SheetDescription>
        </SheetHeader>

        <div className="p-4 flex-grow space-y-6">
          {/* Platforms Filter - Controlled Component */}
          <div className="space-y-2">
            <Label htmlFor="platforms">Platforms</Label>
            <Select
              value={localFilters.platforms?.[0] ?? ''} // Reflect local state (first item for single select)
              onValueChange={handlePlatformChange}
            >
              <SelectTrigger id="platforms">
                <SelectValue placeholder="Select a platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Platform</SelectItem> {/* Added reset option */}
                <SelectItem value={PlatformEnum.Instagram}>Instagram</SelectItem>
                <SelectItem value={PlatformEnum.YouTube}>YouTube</SelectItem>
                <SelectItem value={PlatformEnum.TikTok}>TikTok</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select a platform.</p>
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
              name="audienceAge"
              value={localFilters.audienceAge ?? ''}
              onValueChange={value =>
                setLocalFilters(prev => ({ ...prev, audienceAge: value || undefined }))
              }
            >
              <SelectTrigger id="audienceAge">
                <SelectValue placeholder="Select age range..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Age</SelectItem> {/* Added reset option */}
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

          {/* Phyllo Verified Filter - Controlled Component */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isPhylloVerified"
              name="isPhylloVerified"
              checked={localFilters.isPhylloVerified ?? false}
              onCheckedChange={checked => handleCheckboxChange(checked, 'isPhylloVerified')}
            />
            <Label htmlFor="isPhylloVerified">Phyllo Verified Only</Label>
          </div>
        </div>

        <SheetFooter className="mt-auto pt-4 border-t border-border sticky bottom-0 bg-background py-4 px-4 flex flex-row justify-end gap-2">
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
