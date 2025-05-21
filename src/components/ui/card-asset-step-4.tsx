/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget using standard Card components.
 * @status 10th April
 */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AssetPreview } from './card-asset';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Control, UseFormGetValues, useWatch } from 'react-hook-form';
import { Step4FormData, DraftCampaignData } from '@/components/features/campaigns/types';

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
    console.error('Error formatting number:', e);
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
    case 'GBP':
      return '£';
    case 'EUR':
      return '€';
    case 'USD':
    default:
      return '$';
  }
};
// --- END: Currency Formatting Helpers ---

// Refined AssetData based on usage
interface AssetData {
  id?: number | string;
  name?: string;
  url?: string; // Will be populated by Mux webhook for videos once ready
  type?: string; // 'image', 'video'
  influencerHandle?: string; // Kept for potential display, though not directly edited here
  description?: string; // Used for display
  budget?: number | string;
  rationale?: string; // Added based on usage
  associatedInfluencerIds?: string[]; // Added based on usage

  // Mux-specific fields for frontend state
  internalAssetId?: number;
  muxAssetId?: string;
  muxPlaybackId?: string;
  muxProcessingStatus?: string; // e.g., 'AWAITING_UPLOAD', 'MUX_PROCESSING', 'READY', 'ERROR'
  fileName?: string; // Already present in DraftAssetSchema, good to have here
  fileSize?: number; // Already present in DraftAssetSchema
}

// Updated AssetCardProps with specific types
export interface AssetCardProps {
  assetIndex: number;
  asset: AssetData; // Made required as the component returns null otherwise
  control: Control<Step4FormData>; // Use specific Control type
  getValues: UseFormGetValues<Step4FormData>; // Use specific getValues type
  saveProgress: (payload: Partial<DraftCampaignData>) => Promise<string | null>; // Use specific saveProgress type
  availableInfluencers: InfluencerOption[];
  currency?: string;
  className?: string; // Applies to CardContent
  cardClassName?: string; // Applies to Card root
  // Removed [key: string]: any; pass specific Card props if needed
}

/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget using standard Card components.
 * @status 10th April
 */
export function AssetCardStep4({
  assetIndex,
  asset,
  control,
  getValues,
  saveProgress,
  availableInfluencers,
  currency = 'USD',
  className,
  cardClassName,
}: AssetCardProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // Watch for changes in this specific asset in the form
  const watchedAsset = useWatch({
    control,
    name: `assets.${assetIndex}`,
    defaultValue: asset as any, // Use type assertion to bypass strict typing
  });

  // Merge the original asset with any updates from the form
  const currentAsset = { ...asset, ...watchedAsset };

  // Ensure current asset has a fieldId
  if (!currentAsset.fieldId) {
    currentAsset.fieldId = `field-${currentAsset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Log all props received by AssetCardStep4
  console.log(`[AssetCardStep4 assetIndex: ${assetIndex}] Rendering. All props:`, {
    assetIndex,
    asset,
    control,
    getValues,
    saveProgress,
    availableInfluencers,
    currency,
    className,
    cardClassName,
  });
  // Specifically log crucial asset fields for Mux status
  console.log(
    `[AssetCardStep4 assetIndex: ${assetIndex}] Mux Status: ${currentAsset?.muxProcessingStatus}, URL: ${currentAsset?.url}, PlaybackID: ${currentAsset?.muxPlaybackId}, Name: ${currentAsset?.name}, ID: ${currentAsset?.id}, InternalAssetID: ${currentAsset?.internalAssetId}, fieldId: ${currentAsset?.fieldId}`
  );

  // Uses updated AssetCardProps
  if (!currentAsset) {
    console.warn(
      `[AssetCardStep4 assetIndex: ${assetIndex}] Asset prop is null or undefined. Not rendering card.`
    );
    return null;
  }

  const {
    name,
    url,
    type,
    influencerHandle,
    description,
    muxProcessingStatus = currentAsset.muxProcessingStatus,
    muxPlaybackId = currentAsset.muxPlaybackId,
  } = currentAsset;

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
  console.log(`AssetCardStep4[${assetIndex}] - Watched Data:`, currentAsset);

  // Ensure field names are defined correctly in scope - ADJUSTED
  const nameFieldName: `assets.${number}.name` = `assets.${assetIndex}.name`;
  const rationaleFieldName: `assets.${number}.rationale` = `assets.${assetIndex}.rationale`;
  const budgetFieldName: `assets.${number}.budget` = `assets.${assetIndex}.budget`;
  const associatedInfluencerIdsFieldName: `assets.${number}.associatedInfluencerIds` = `assets.${assetIndex}.associatedInfluencerIds`;

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden h-full',
        'border border-border rounded-lg shadow-sm',
        cardClassName
      )}
    >
      {isVideoAsset && muxProcessingStatus && muxProcessingStatus !== 'READY' && (
        <div className="aspect-video bg-muted flex flex-col items-center justify-center p-4">
          <Icon iconId="faCircleNotchLight" className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-xs text-muted-foreground">
            {muxProcessingStatus === 'MUX_PROCESSING' || muxProcessingStatus === 'AWAITING_UPLOAD'
              ? 'Video is processing...'
              : muxProcessingStatus === 'ERROR' || muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID'
                ? 'Video processing error'
                : `Status: ${muxProcessingStatus}`}
          </p>
        </div>
      )}
      {(!isVideoAsset || (isVideoAsset && muxProcessingStatus === 'READY' && muxPlaybackId)) && (
        <AssetPreview
          url={isVideoAsset && muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : url}
          fileName={name}
          type={type}
          mediaTypeIconId={mediaTypeIconId}
          mediaTypeLabel={mediaTypeLabel}
          muxPlaybackId={muxPlaybackId}
          muxProcessingStatus={muxProcessingStatus}
        />
      )}
      {/* Fallback for video assets without a definitive status yet, or if AssetPreview handles initial state */}
      {isVideoAsset && !muxProcessingStatus && (
        <AssetPreview
          url={url}
          fileName={name}
          type={type}
          mediaTypeIconId={mediaTypeIconId}
          mediaTypeLabel={mediaTypeLabel}
        />
      )}

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

              // Ensure all assets have a fieldId and required fields are properly formatted
              const assetsWithFieldIds = currentData.assets.map(asset => ({
                ...asset,
                fieldId: asset.fieldId || `field-${asset.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                // Ensure these fields are explicitly included for saving
                rationale: asset.rationale || '',
                budget: typeof asset.budget === 'number' ? asset.budget : 0,
                associatedInfluencerIds: Array.isArray(asset.associatedInfluencerIds) ? asset.associatedInfluencerIds : []
              }));

              console.log(`[Save icon] Prepared assets for save, including rationale, budget:`, assetsWithFieldIds);

              const payload = {
                ...currentData,
                assets: assetsWithFieldIds,
                currentStep: 4
              };
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

        {/* Influencer Association - Using Shadcn Combobox pattern */}
        <FormField
          control={control}
          name={associatedInfluencerIdsFieldName}
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
              console.log(
                `AssetCardStep4[${assetIndex}] - Updating ${associatedInfluencerIdsFieldName} to:`,
                newValue
              );
              field.onChange(newValue);
            };

            const handleRemove = (influencerId: string) => {
              const newValue = selectedInfluencerIds.filter((id: string) => id !== influencerId);
              console.log(
                `AssetCardStep4[${assetIndex}] - Updating ${associatedInfluencerIdsFieldName} to:`,
                newValue
              );
              field.onChange(newValue);
            };

            return (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Associated Influencer(s)
                </FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className={cn(
                          'w-full justify-between h-9 font-normal text-xs',
                          !selectedInfluencerIds.length && 'text-muted-foreground'
                        )}
                      >
                        <span className="truncate">
                          {selectedOptions.length > 0
                            ? selectedOptions.length === 1
                              ? selectedOptions[0].handle // Show handle if only one selected
                              : `${selectedOptions.length} influencers selected`
                            : 'Select Influencers...'}
                        </span>
                        <Icon
                          iconId="faChevronDownLight"
                          className="ml-2 h-3 w-3 shrink-0 opacity-50"
                        />
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
                                  'mr-2 h-3 w-3',
                                  selectedInfluencerIds.includes(influencer.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
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
                    <Badge key={influencer.id} variant="secondary" className="pl-2 pr-1 text-xs">
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
          name={rationaleFieldName}
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
                  onChange={e => {
                    console.log(
                      `AssetCardStep4[${assetIndex}] - Updating ${rationaleFieldName} to:`,
                      e.target.value
                    );
                    field.onChange(e.target.value);
                  }}
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
                        const numericValue =
                          parsedValue === '' ? undefined : parseFloat(parsedValue);
                        console.log(
                          `AssetCardStep4[${assetIndex}] - Updating ${budgetFieldName} to:`,
                          numericValue
                        );
                        field.onChange(numericValue);
                      }}
                      placeholder="0"
                      className="text-xs pl-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      {symbol}
                    </span>
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
