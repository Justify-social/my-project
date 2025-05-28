/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget using standard Card components.
 * @status 10th April
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import { IconButtonAction } from '@/components/ui/button-icon-action';
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
import { toast as _toast } from 'react-hot-toast';
import { Control, UseFormGetValues, useWatch } from 'react-hook-form';
import {
  Step4FormData,
  DraftCampaignData,
  DraftAsset,
} from '@/components/features/campaigns/types';
import { RemovableBadge } from '@/components/ui/removable-badge';

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
  fieldId?: string; // Added for form field array support
  name?: string;
  url?: string; // Will be populated by Mux webhook for videos once ready
  type?: string; // 'image', 'video'
  influencerHandle?: string; // Kept for potential display, though not directly edited here
  description?: string; // Used for display
  budget?: number | null | undefined;
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
  onDelete?: (assetId: number | string | undefined, assetIndex: number, assetName?: string) => void; // Delete handler
  // Removed [key: string]: any; pass specific Card props if needed
}

/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget using standard Card components.
 * @status 10th April
 */
export const AssetCardStep4 = React.memo(
  function AssetCardStep4({
    assetIndex,
    asset,
    control,
    getValues,
    saveProgress,
    availableInfluencers,
    currency = 'USD',
    className,
    cardClassName,
    onDelete,
  }: AssetCardProps) {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Watch for changes in this specific asset in the form
    const watchedAsset = useWatch({
      control,
      name: `assets.${assetIndex}`,
      defaultValue: asset as DraftAsset,
    });

    // Log data flow for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AssetCard ${assetIndex}] Data flow:`, {
        'asset prop': { name: asset.name, budget: asset.budget, rationale: asset.rationale },
        watchedAsset: {
          name: watchedAsset?.name,
          budget: watchedAsset?.budget,
          rationale: watchedAsset?.rationale,
        },
        'form current values': getValues(`assets.${assetIndex}`),
      });
    }

    // Merge the original asset with any updates from the form
    // IMPORTANT: Prioritize form values (watchedAsset) over prop values to show saved data
    const currentAsset = useMemo(() => {
      // Start with the asset prop as base
      const base = { ...asset };

      // If we have form data (watchedAsset), use it to override the base
      // This ensures saved form values take precedence over potentially stale prop data
      const merged = watchedAsset ? { ...base, ...watchedAsset } : base;

      // Ensure current asset has a fieldId
      if (!merged.fieldId) {
        merged.fieldId = `field-${merged.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }

      return merged;
    }, [asset, watchedAsset]);

    // Memoize field names to prevent unnecessary re-renders
    const fieldNames = useMemo(
      () => ({
        name: `assets.${assetIndex}.name` as const,
        rationale: `assets.${assetIndex}.rationale` as const,
        budget: `assets.${assetIndex}.budget` as const,
        associatedInfluencerIds: `assets.${assetIndex}.associatedInfluencerIds` as const,
      }),
      [assetIndex]
    );

    // Optimized auto-save handler with better error feedback
    const handleAutoSave = useCallback(async () => {
      try {
        setIsSaving(true);
        const formData = getValues();
        console.log(`[AssetCard ${assetIndex}] Auto-saving form data:`, {
          assetName: formData.assets[assetIndex]?.name,
          assetBudget: formData.assets[assetIndex]?.budget,
          assetRationale: formData.assets[assetIndex]?.rationale,
        });
        await saveProgress({ assets: formData.assets });
        console.log(`[AssetCard ${assetIndex}] Auto-save completed successfully`);
      } catch (error) {
        console.error(`[AssetCard ${assetIndex}] Auto-save failed:`, error);
      } finally {
        setIsSaving(false);
      }
    }, [getValues, saveProgress, assetIndex]);

    // Log crucial asset info only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[AssetCard ${assetIndex}] Final display values - Name: "${currentAsset?.name}", Budget: ${currentAsset?.budget} ${currency}, Rationale: "${currentAsset?.rationale}"`
      );
    }

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
      description: _description,
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

    return (
      <Card
        className={cn(
          'group flex flex-col overflow-hidden h-full relative',
          'border border-border rounded-lg shadow-sm',
          cardClassName
        )}
      >
        {/* Delete Button - Top Right Corner */}
        {onDelete && (
          <div className="absolute top-2 right-2 z-30">
            <IconButtonAction
              iconBaseName="faTrashCan"
              hoverColorClass="text-destructive"
              ariaLabel="Delete asset"
              defaultColorClass="text-muted-foreground"
              className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm border border-border/50"
              onClick={() =>
                onDelete(
                  currentAsset.internalAssetId || currentAsset.id,
                  assetIndex,
                  currentAsset.name
                )
              }
            />
          </div>
        )}

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="absolute top-2 left-2 z-20 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Icon iconId="faSpinnerLight" className="h-3 w-3 animate-spin" />
            Saving...
          </div>
        )}

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
            url={
              isVideoAsset && muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : url
            }
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
              name={fieldNames.name}
              render={({ field }) => (
                <FormItem className="flex-1 min-w-0">
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      className="text-sm font-medium leading-snug h-auto p-1 border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Untitled Asset"
                      onBlur={handleAutoSave}
                    />
                  </FormControl>
                </FormItem>
              )}
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

          {/* Influencer Association - Using Shadcn Combobox pattern */}
          <FormField
            control={control}
            name={fieldNames.associatedInfluencerIds}
            render={({ field }) => {
              const selectedInfluencerIds = field.value || [];
              // Find the full option objects for selected IDs
              const selectedOptions = availableInfluencers.filter((inf: InfluencerOption) =>
                selectedInfluencerIds.includes(inf.id)
              );

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
                                onSelect={() => {
                                  const currentIds = selectedInfluencerIds || [];
                                  const newValue = currentIds.includes(influencer.id)
                                    ? currentIds.filter((id: string) => id !== influencer.id)
                                    : [...currentIds, influencer.id];

                                  // Update the form field using proper React Hook Form API
                                  field.onChange(newValue);
                                  handleAutoSave();
                                }}
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
                      <RemovableBadge
                        key={influencer.id}
                        variant="secondary"
                        size="sm"
                        onRemove={() => {
                          const currentIds = selectedInfluencerIds || [];
                          const newValue = currentIds.filter(
                            (id: string) => id !== influencer.id
                          );

                          // Update the form field using proper React Hook Form API
                          field.onChange(newValue);
                          handleAutoSave();
                        }}
                        removeAriaLabel={`Remove ${influencer.handle}`}
                      >
                        {influencer.handle}
                      </RemovableBadge>
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
            name={fieldNames.rationale}
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
                    onBlur={handleAutoSave}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Budget - Enhanced with better currency display */}
          <FormField
            control={control}
            name={fieldNames.budget}
            render={({ field }) => {
              const symbol = getCurrencySymbol(currency);
              return (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Budget
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs font-medium border-primary/30 text-primary"
                    >
                      {currency}
                    </Badge>
                  </FormLabel>
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
                          field.onChange(numericValue);
                        }}
                        onBlur={handleAutoSave}
                        placeholder="0"
                        className="text-xs pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-medium"
                        min="0"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-semibold text-sm">
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
  },
  (prevProps, nextProps) => {
    // Smart memo comparison focusing on important fields that affect rendering
    const prevAsset = prevProps.asset;
    const nextAsset = nextProps.asset;

    // Check non-asset props first
    if (
      prevProps.assetIndex !== nextProps.assetIndex ||
      prevProps.currency !== nextProps.currency ||
      prevProps.availableInfluencers.length !== nextProps.availableInfluencers.length
    ) {
      return false; // Props changed, need re-render
    }

    // Check important asset fields that affect rendering
    if (
      prevAsset.id !== nextAsset.id ||
      prevAsset.name !== nextAsset.name ||
      prevAsset.muxProcessingStatus !== nextAsset.muxProcessingStatus ||
      prevAsset.muxPlaybackId !== nextAsset.muxPlaybackId ||
      prevAsset.url !== nextAsset.url ||
      prevAsset.rationale !== nextAsset.rationale ||
      prevAsset.budget !== nextAsset.budget ||
      JSON.stringify(prevAsset.associatedInfluencerIds) !==
      JSON.stringify(nextAsset.associatedInfluencerIds)
    ) {
      return false; // Important asset fields changed, need re-render
    }

    return true; // No important changes, skip re-render
  }
);

export default AssetCardStep4;
