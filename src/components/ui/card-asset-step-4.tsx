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
import { Card, CardHeader as _CardHeader, CardContent as _CardContent } from '@/components/ui/card';
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
    className: _className,
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
          // Premium Polaroid-inspired design matching display component with Apple/Shopify quality
          'group flex flex-col overflow-hidden h-full relative max-w-sm mx-auto',
          'bg-white border-0 rounded-xl shadow-lg',
          'hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out',
          // Enhanced Polaroid-style depth and dimension
          'before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:via-transparent before:to-black/5 before:pointer-events-none before:z-10',
          'after:absolute after:inset-0 after:shadow-inner after:pointer-events-none after:z-10',
          cardClassName
        )}
        style={{
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Delete Button - Top Right Corner with enhanced styling */}
        {onDelete && (
          <div className="absolute top-3 right-3 z-30">
            <IconButtonAction
              iconBaseName="faTrashCan"
              hoverColorClass="text-destructive"
              ariaLabel="Delete asset"
              defaultColorClass="text-muted-foreground"
              className="h-8 w-8 bg-white/95 hover:bg-white shadow-lg border border-slate-200/60 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105"
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

        {/* Auto-save indicator with enhanced styling */}
        {isSaving && (
          <div className="absolute top-3 left-3 z-20 bg-blue-500 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <Icon iconId="faSpinnerLight" className="h-3 w-3 animate-spin" />
            <span className="font-medium">Saving...</span>
          </div>
        )}

        {/* Polaroid-style image area with generous white border */}
        <div className="p-5 pb-3 bg-white">
          {isVideoAsset && muxProcessingStatus && muxProcessingStatus !== 'READY' && (
            <div className="aspect-square bg-slate-50 flex flex-col items-center justify-center p-4 rounded-md border border-slate-200/60 shadow-sm relative">
              <div className="bg-white rounded-sm shadow-sm w-full h-full flex flex-col items-center justify-center">
                <Icon
                  iconId="faCircleNotchLight"
                  className="h-10 w-10 text-primary animate-spin mb-3"
                />
                <p className="text-xs text-muted-foreground text-center px-2 leading-relaxed">
                  {muxProcessingStatus === 'MUX_PROCESSING' ||
                  muxProcessingStatus === 'AWAITING_UPLOAD'
                    ? 'Video is processing...'
                    : muxProcessingStatus === 'ERROR' ||
                        muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID'
                      ? 'Video processing error'
                      : `Status: ${muxProcessingStatus}`}
                </p>
              </div>
              {/* File type icon positioned exactly like trash can but on left */}
              <div className="absolute top-3 left-3 z-10">
                <Badge
                  variant="secondary"
                  className="px-2 py-1.5 rounded-md text-xs inline-flex items-center bg-slate-900/90 border border-slate-700/50 shadow-lg backdrop-blur-sm"
                  title={mediaTypeLabel}
                >
                  <Icon iconId={mediaTypeIconId} className="h-3 w-3 text-white" />
                </Badge>
              </div>
            </div>
          )}
          {(!isVideoAsset ||
            (isVideoAsset && muxProcessingStatus === 'READY' && muxPlaybackId)) && (
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
              className="rounded-md overflow-hidden border border-slate-200/60 shadow-sm"
            />
          )}
          {/* Fallback for video assets without a definitive status yet */}
          {isVideoAsset && !muxProcessingStatus && (
            <AssetPreview
              url={url}
              fileName={name}
              type={type}
              mediaTypeIconId={mediaTypeIconId}
              mediaTypeLabel={mediaTypeLabel}
              className="rounded-md overflow-hidden border border-slate-200/60 shadow-sm"
            />
          )}
        </div>

        {/* Polaroid-style content area with generous spacing */}
        <div className="bg-white px-6 pb-6 pt-4">
          {/* Asset Name Field - Styled like premium Polaroid caption */}
          <div className="mb-5">
            <FormField
              control={control}
              name={fieldNames.name}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      className="font-sora text-base font-bold text-slate-900 h-auto p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50/50 focus:bg-white transition-colors shadow-sm"
                      placeholder="Untitled Asset"
                      onBlur={handleAutoSave}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {influencerHandle && (
            <div className="mb-4 flex items-center text-slate-600">
              <Icon
                iconId="faUserCircleLight"
                className="h-4 w-4 mr-2 flex-shrink-0 text-slate-500"
              />
              <span className="text-sm font-medium truncate" title={influencerHandle}>
                {influencerHandle}
              </span>
            </div>
          )}

          <div className="space-y-5">
            {/* Influencer Association with enhanced styling */}
            <FormField
              control={control}
              name={fieldNames.associatedInfluencerIds}
              render={({ field }) => {
                const selectedInfluencerIds = field.value || [];
                const selectedOptions = availableInfluencers.filter((inf: InfluencerOption) =>
                  selectedInfluencerIds.includes(inf.id)
                );

                return (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
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
                              'w-full justify-between h-11 font-normal text-sm border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 shadow-sm',
                              !selectedInfluencerIds.length && 'text-muted-foreground'
                            )}
                          >
                            <span className="truncate">
                              {selectedOptions.length > 0
                                ? selectedOptions.length === 1
                                  ? selectedOptions[0].handle
                                  : `${selectedOptions.length} influencers selected`
                                : 'Select Influencers...'}
                            </span>
                            <Icon
                              iconId="faChevronDownLight"
                              className="ml-2 h-4 w-4 shrink-0 opacity-50"
                            />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search influencers..."
                            className="h-9 text-sm"
                          />
                          <CommandList>
                            <CommandEmpty>No influencers found.</CommandEmpty>
                            <CommandGroup>
                              {availableInfluencers.map((influencer: InfluencerOption) => (
                                <CommandItem
                                  key={influencer.id}
                                  value={influencer.handle}
                                  onSelect={() => {
                                    const currentIds = selectedInfluencerIds || [];
                                    const newValue = currentIds.includes(influencer.id)
                                      ? currentIds.filter((id: string) => id !== influencer.id)
                                      : [...currentIds, influencer.id];
                                    field.onChange(newValue);
                                    handleAutoSave();
                                  }}
                                  className="cursor-pointer text-sm"
                                >
                                  <Icon
                                    iconId="faCheckSolid"
                                    className={cn(
                                      'mr-2 h-4 w-4',
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
                    {/* Display selected as badges with enhanced styling */}
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[24px]">
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
                            field.onChange(newValue);
                            handleAutoSave();
                          }}
                          removeAriaLabel={`Remove ${influencer.handle}`}
                          className="px-3 py-1"
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

            {/* Justification with enhanced styling */}
            <FormField
              control={control}
              name={fieldNames.rationale}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center mb-3">
                    <div className="h-px bg-gradient-to-r from-slate-300 via-slate-200 to-transparent flex-1"></div>
                    <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-widest px-4 bg-white">
                      Why this content?
                    </FormLabel>
                    <div className="h-px bg-gradient-to-l from-slate-300 via-slate-200 to-transparent flex-1"></div>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder="Explain the purpose or strategy..."
                      rows={3}
                      className="text-sm resize-none border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white transition-colors shadow-sm px-4 py-3"
                      onBlur={handleAutoSave}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Budget with premium Polaroid styling */}
            <FormField
              control={control}
              name={fieldNames.budget}
              render={({ field }) => {
                const symbol = getCurrencySymbol(currency);
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                      Budget
                      <Badge
                        variant="outline"
                        className="ml-3 text-xs font-semibold border-slate-300 bg-slate-100 text-slate-700 px-2 py-1"
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
                          className="text-base pl-10 pr-4 py-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white transition-colors shadow-sm rounded-lg"
                          min="0"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-bold text-base">
                          {symbol}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>
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
