'use client';

import React from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/atoms/icons'
import { Text } from '@/components/ui/atoms/typography'
import { AssetCardProps } from './types';
import AssetPreview from './components/AssetPreview';

/**
 * Formats currency values for display
 */
const formatCurrency = (value?: number | string, currency: string = 'USD') => {
  if (!value && value !== 0) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Helper to check if platform is specified
 */
const hasPlatform = (platform?: string, defaultPlatform?: string) => {
  return platform && platform !== 'null' && platform !== 'undefined' && 
         (!defaultPlatform || platform !== defaultPlatform);
};

/**
 * AssetCard component displays a card with asset information including preview, title, platform, 
 * influencer details, description, and budget.
 */
export function AssetCard({
  asset,
  currency = 'USD',
  defaultPlatform,
  className,
  showTypeLabel = false,
  ...props
}: AssetCardProps) {
  if (!asset) return null;

  const { 
    name, 
    url, 
    type, 
    platform, 
    influencerHandle, 
    description, 
    budget 
  } = asset;

  return (
    <div 
      className={cn(
        "flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {/* Asset Preview */}
      <div className="w-full aspect-video relative">
        <AssetPreview 
          url={url} 
          fileName={name} 
          type={type} 
          className="h-full w-full"
          showTypeLabel={showTypeLabel}
        />
      </div>
      
      {/* Asset Information */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          {/* Asset Name */}
          <Text 
            as="p" 
            className="font-semibold text-gray-900 flex-grow truncate mr-2 text-lg"
          >
            {name}
          </Text>
          
          {/* Platform (if specified and different from default) */}
          {hasPlatform(platform, defaultPlatform) && (
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <Icon 
                name={platform?.toLowerCase() === 'instagram' ? 'faInstagram' : 
                      platform?.toLowerCase() === 'tiktok' ? 'faTiktok' : 
                      platform?.toLowerCase() === 'youtube' ? 'faYoutube' : 
                      'faHashtag'}
                className="h-3 w-3 mr-1" 
                iconType="static" 
                solid={false} 
              />
              {platform}
            </div>
          )}
        </div>
        
        {/* Influencer Handle (if available) */}
        {influencerHandle && (
          <div className="mt-2 flex items-center text-gray-600">
            <Icon 
              name="faUser" 
              className="h-3 w-3 mr-1"
              iconType="static" 
              solid={false} 
            />
            <Text as="span" className="text-gray-600 text-sm">
              {influencerHandle}
            </Text>
          </div>
        )}
        
        {/* Description (if available) */}
        {description && (
          <Text 
            as="p" 
            className="mt-3 text-gray-600 line-clamp-2 text-sm"
          >
            {description}
          </Text>
        )}
        
        {/* Budget (if available) */}
        {budget !== undefined && budget !== null && (
          <div className="mt-auto pt-3 flex items-center text-gray-800">
            <Icon 
              name="faWallet" 
              className="h-3 w-3 mr-2"
              iconType="static" 
              solid={false} 
            />
            <Text as="span" className="font-medium text-sm">
              {formatCurrency(budget, currency)}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetCard; 