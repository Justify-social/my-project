/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget using standard Card components.
 * @status 10th April
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { DraftAssetSchema, DraftCampaignData } from '@/components/features/campaigns/types';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AssetPreview } from './card-asset';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

type DraftAsset = z.infer<typeof DraftAssetSchema>;

// Define InfluencerOption type used in props and internally
interface InfluencerOption {
  id: string;
  handle: string;
}

// --- START: Currency Formatting Helpers (Copied from Step1Content) ---
/** Formats a number string into a currency-like string with commas. */
const formatCurrencyInput = (value: string | number | undefined | null): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/[^\d]/g, ''); // Remove non-digits
  if (stringValue === '') return '';
  try {
    return new Intl.NumberFormat('en-US').format(parseInt(stringValue, 10));
  } catch (e) {
    console.error("Error formatting number:", e);
    return stringValue;
  }
};

/** Parses a formatted currency string back into a raw number string. */
const parseCurrencyInput = (formattedValue: string): string => {
  return formattedValue.replace(/[^\d]/g, ''); // Remove non-digits
};

/** Gets currency symbol */
const getCurrencySymbol = (currencyCode: string = 'USD') => {
  switch (currencyCode.toUpperCase()) {
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'USD':
    default: return '$';
  }
}
// --- END: Currency Formatting Helpers ---

/**
 * Helper to get the correct brand icon ID based on platform name.
 */
const getPlatformIconId = (platform?: string): string => {
  const platformLower = platform?.toLowerCase() || '';
  switch (platformLower) {
    case 'facebook':
      return 'brandsFacebook';
    case 'instagram':
      return 'brandsInstagram';
    case 'tiktok':
      return 'brandsTiktok';
    case 'youtube':
      return 'brandsYoutube';
    case 'linkedin':
      return 'brandsLinkedin';
    case 'x':
    case 'twitter':
      return 'brandsXTwitter';
    case 'github':
      return 'brandsGithub';
    default:
      return 'faHashtag'; // Fallback icon
  }
};

/**
 * Helper to check if platform should be displayed.
 * Handles null/undefined values for both platform and defaultPlatform.
 */
const hasPlatform = (
  platform?: string | undefined,
  defaultPlatform?: string | undefined
): platform is string => {
  // Check if platform is a non-empty string, and not explicitly 'null' or 'undefined'
  const isPlatformValid =
    typeof platform === 'string' &&
    platform.trim() !== '' &&
    platform !== 'null' &&
    platform !== 'undefined';

  if (!isPlatformValid) {
    return false; // Don't display if platform itself is invalid
  }

  // If defaultPlatform is not provided or invalid, display the valid platform
  const isDefaultPlatformValid =
    typeof defaultPlatform === 'string' &&
    defaultPlatform.trim() !== '' &&
    defaultPlatform !== 'null' &&
    defaultPlatform !== 'undefined';
  if (!isDefaultPlatformValid) {
    return true; // Display valid platform if default is invalid/missing
  }

  // Only display if platform is valid AND different from the valid defaultPlatform
  return platform !== defaultPlatform;
};

/**
 * @component AssetPreview
 * @category molecule
 * @subcategory display
 * @description Renders a preview for image or video assets with hover controls for video.
 */
interface AssetPreviewProps {
  url?: string;
  fileName?: string;
  type?: string;
  showTypeLabel?: boolean;
  className?: string;
  [key: string]: any;
}

// --- Local Types (or import from shared) ---
interface AssetData {
  id?: number | string;
  name?: string;
  url?: string;
  type?: string;
  platform?: string | undefined; // Allow undefined
  influencerHandle?: string;
  description?: string;
  budget?: number | string;
}

// Ensure this interface is defined
export interface AssetCardProps {
  asset?: AssetData;
  currency?: string;
  defaultPlatform?: string | undefined; // Allow undefined
  className?: string; // Will apply to CardContent
  cardClassName?: string; // Will apply to Card root
  showTypeLabel?: boolean;
  [key: string]: any; // Allow passing other props like onClick
}

/**
 * AssetCard component displays a card with asset information including preview, title, platform,
 * influencer details, description, and budget, using standard Card components.
 * Handles optional platform property.
 */
export function AssetCardStep4({
  assetIndex,
  asset,
  control,
  setValue,
  getValues,
  saveProgress,
  availableInfluencers,
  currency = 'USD',
  className,
  cardClassName,
  ...props
}: AssetCardProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // Uses updated AssetCardProps
  if (!asset) return null;

  const {
    name,
    url,
    type,
    platform, // Can be undefined
    influencerHandle,
    description,
    budget,
  } = asset;

  const platformIconId = getPlatformIconId(platform);
  const isVideoAsset = type?.includes('video');
  const isImageAsset = type?.includes('image');
  const mediaTypeIconId = isVideoAsset
    ? 'faFileVideoLight'
    : isImageAsset
      ? 'faFileImageLight'
      : 'faFileLight';
  const mediaTypeLabel = isVideoAsset ? 'Video' : isImageAsset ? 'Image' : 'File';

  // Log props and watched data
  console.log(`AssetCardStep4[${assetIndex}] - Props:`, { assetIndex, availableInfluencers });
  console.log(`AssetCardStep4[${assetIndex}] - Watched Data:`, asset);

  // Ensure field names are defined correctly in scope
  const nameFieldName = `assets.${assetIndex}.name`;
  const justificationFieldName = `assets.${assetIndex}.justification`;
  const budgetFieldName = `assets.${assetIndex}.budget`;
  const influencerIdsFieldName = `assets.${assetIndex}.influencerIds`;

  const assetData = {
    name,
    url,
    type,
    platform,
    influencerHandle,
    description,
    budget,
  };

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden h-full',
        'border border-border rounded-lg shadow-sm',
        cardClassName
      )}
      {...props}
    >
      <AssetPreview
        url={url}
        fileName={name}
        type={type}
        mediaTypeIconId={mediaTypeIconId}
        mediaTypeLabel={mediaTypeLabel}
      />

      <CardHeader className="flex-row items-center justify-between gap-2 pb-2 pt-3 px-3">
        <div className="flex items-center border border-input rounded-sm flex-1 min-w-0 group relative bg-transparent hover:bg-muted/50 focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1">
          <FormField
            control={control}
            name={nameFieldName}
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0">
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    className="text-sm font-medium leading-snug h-auto p-1 border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Untitled Asset"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Icon
            iconId="faFloppyDiskLight"
            className="h-4 w-4 text-muted-foreground/60 mr-1 cursor-pointer hover:text-muted-foreground"
            title="Save name change (saves entire step)"
            onClick={async () => {
              console.log('Save icon clicked');
              const currentData = getValues();
              const payload = { ...currentData, currentStep: 4 };
              await saveProgress(payload);
              toast.success('Step 4 progress saved.');
            }}
          />
        </div>
        <FormMessage className="text-xs px-1 w-full" />
      </CardHeader>

      <CardContent className={cn('px-3 pb-3 flex flex-col flex-grow space-y-3', className)}>
        {influencerHandle && (
          <div className="mt-1 mb-2 flex items-center text-muted-foreground">
            <Icon iconId="faUserLight" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="text-muted-foreground text-xs truncate" title={influencerHandle}>
              {influencerHandle}
            </span>
          </div>
        )}

        {description && (
          <p className="mb-2 text-muted-foreground line-clamp-2 text-xs flex-grow">{description}</p>
        )}

        <div className="mt-auto pt-2 space-y-2">
          {(influencerHandle || description || budget !== undefined) && <Separator />}
          {budget !== undefined && budget !== null && (
            <div className="flex justify-end items-center text-foreground">
              <Icon iconId="faDollarSignLight" className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="font-medium text-xs">{formatCurrencyInput(budget)}</span>
            </div>
          )}
        </div>

        {/* Influencer Association - Using Shadcn Combobox pattern */}
        <FormField
          control={control}
          name={influencerIdsFieldName}
          render={({ field }) => {
            const selectedInfluencerIds = field.value || [];
            // Find the full option objects for selected IDs
            const selectedOptions = availableInfluencers.filter((inf: InfluencerOption) =>
              selectedInfluencerIds.includes(inf.id)
            );

            const handleSelect = (influencerId: string) => {
              const newValue = selectedInfluencerIds.includes(influencerId)
                ? selectedInfluencerIds.filter((id: string) => id !== influencerId)
                : [...selectedInfluencerIds, influencerId];
              field.onChange(newValue);
            };

            const handleRemove = (influencerId: string) => {
              field.onChange(selectedInfluencerIds.filter((id: string) => id !== influencerId));
            };

            return (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Associated Influencer(s)</FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className={cn(
                          "w-full justify-between h-9 font-normal text-xs",
                          !selectedInfluencerIds.length && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">
                          {selectedOptions.length > 0
                            ? selectedOptions.length === 1
                              ? selectedOptions[0].handle // Show handle if only one selected
                              : `${selectedOptions.length} influencers selected`
                            : "Select Influencers..."}
                        </span>
                        <Icon iconId="faChevronDownLight" className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search influencers..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty>No influencers found.</CommandEmpty>
                        <CommandGroup>
                          {availableInfluencers.map((influencer: InfluencerOption) => (
                            <CommandItem
                              key={influencer.id}
                              value={influencer.handle} // Use handle for searching
                              onSelect={() => handleSelect(influencer.id)}
                              className="cursor-pointer text-xs"
                            >
                              <Icon
                                iconId="faCheckSolid" // Use FontAwesome check
                                className={cn(
                                  "mr-2 h-3 w-3",
                                  selectedInfluencerIds.includes(influencer.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {influencer.handle}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Display selected as badges */}
                <div className="flex flex-wrap gap-1 pt-1 min-h-[20px]">
                  {selectedOptions.map((influencer: InfluencerOption) => (
                    <Badge
                      key={influencer.id}
                      variant="secondary"
                      className="pl-2 pr-1 text-xs"
                    >
                      {influencer.handle}
                      <button
                        type="button"
                        onClick={() => handleRemove(influencer.id)} // Use ID for removal
                        className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 text-secondary-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${influencer.handle}`}
                      >
                        <Icon iconId="faXmarkLight" className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            );
          }}
        />

        {/* Justification */}
        <FormField
          control={control}
          name={justificationFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Why this content?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Explain the purpose or strategy..."
                  rows={2}
                  className="text-xs resize-none" // Added resize-none
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Budget */}
        <FormField
          control={control}
          name={budgetFieldName}
          render={({ field }) => {
            const symbol = getCurrencySymbol(currency);
            return (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Budget ({currency})</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      {...field}
                      value={formatCurrencyInput(field.value)}
                      onChange={e => {
                        const parsedValue = parseCurrencyInput(e.target.value);
                        field.onChange(parsedValue === '' ? undefined : parseFloat(parsedValue));
                      }}
                      placeholder="0"
                      className="text-xs pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{symbol}</span>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            );
          }}
        />

      </CardContent>
    </Card>
  );
}

export default AssetCardStep4;
