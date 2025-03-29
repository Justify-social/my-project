'use client';

import React from 'react';
import Image from 'next/image';
import { Icon } from '@/components/ui/atoms/icons';
import AssetPreview from './asset-preview';

interface AssetCardProps {
  asset: {
    id?: string | number;
    name?: string;
    assetName?: string;
    url: string;
    type: string;
    platform?: string;
    influencerHandle?: string;
    description?: string;
    whyInfluencer?: string;
    budget?: number;
    size?: number;
    duration?: number;
  };
  currency?: string;
  defaultPlatform?: string;
  className?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  currency = 'USD',
  defaultPlatform = 'Instagram',
  className = ''
}) => {
  // Format currency with better type handling
  const formatCurrency = (value: number | string) => {
    // Convert string to number if needed
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Default to 0 if NaN
    const safeValue = isNaN(numericValue) ? 0 : numericValue;
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(safeValue);
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback format without currency style
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(safeValue);
    }
  };

  const assetName = asset.assetName || asset.name || 'Untitled Asset';
  const platformValue = asset.platform || defaultPlatform || '';
  const platform = typeof platformValue === 'string' ? platformValue : '';
  const description = asset.description || asset.whyInfluencer || 'No details provided';

  // For debugging
  console.log('AssetCard platform data:', { 
    assetName,
    assetPlatform: asset.platform, 
    defaultPlatform, 
    usedPlatform: platform,
    hasPlatform: !!platform
  });

  // Helper function to determine if a platform is actually specified
  const isPlatformSpecified = () => {
    if (!platform) return false;
    if (platform.toLowerCase() === 'not specified') return false;
    if (platform.toLowerCase() === 'n/a') return false;
    return true;
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col transform hover:-translate-y-1 hover:border-[var(--accent-color)] font-work-sans ${className}`}>
      {/* Asset Preview - Square/Tiled */}
      <div className="aspect-square w-full overflow-hidden relative bg-gray-50">
        <AssetPreview 
          url={asset.url} 
          fileName={assetName} 
          type={asset.type} 
          className="w-full h-full" 
        />
        
        {/* Asset Type Badge */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
          {asset.type === 'video' || (typeof asset.type === 'string' && asset.type.includes('video')) 
            ? <div className="flex items-center"><Icon name="faVideo" className="h-3 w-3 mr-1" iconType="static" solid={false} /> Video</div> 
            : <div className="flex items-center"><Icon name="faImage" className="h-3 w-3 mr-1" iconType="static" solid={false} /> Image</div>}
        </div>
      </div>
      
      {/* Asset Name - Made more prominent */}
      <div className="px-4 pt-4 pb-2 bg-gradient-to-r from-[rgba(0,191,255,0.05)] to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight truncate pr-2 font-sora">
            {assetName}
          </h3>
          {/* Platform Icon */}
          {isPlatformSpecified() && (
            <div className="flex-shrink-0 bg-[rgba(0,191,255,0.1)] rounded-full p-1.5 ml-1">
              {(() => {
                // Ensure case-insensitive matching
                const platformLower = platform.toLowerCase();
                
                // Instagram
                if (platformLower.includes('insta') || platformLower === 'ig') {
                  return <Image src="/icons/brands/instagram.svg" width={16} height={16} alt="Instagram" className="h-4 w-4" />;
                } 
                // Facebook
                else if (platformLower.includes('face') || platformLower === 'fb') {
                  return <Image src="/icons/brands/facebook.svg" width={16} height={16} alt="Facebook" className="h-4 w-4" />;
                } 
                // Twitter/X
                else if (platformLower.includes('twit') || platformLower === 'x' || platformLower.includes('x-twitter')) {
                  return <Image src="/icons/brands/x-twitter.svg" width={16} height={16} alt="Twitter" className="h-4 w-4" />;
                } 
                // TikTok
                else if (platformLower.includes('tik') || platformLower.includes('tok')) {
                  return <Image src="/icons/brands/tiktok.svg" width={16} height={16} alt="TikTok" className="h-4 w-4" />;
                } 
                // YouTube
                else if (platformLower.includes('you') || platformLower.includes('tube') || platformLower === 'yt') {
                  return <Image src="/icons/brands/youtube.svg" width={16} height={16} alt="YouTube" className="h-4 w-4" />;
                } 
                // LinkedIn
                else if (platformLower.includes('link') || platformLower.includes('lin')) {
                  return <Image src="/icons/brands/linkedin.svg" width={16} height={16} alt="LinkedIn" className="h-4 w-4" />;
                } 
                // Pinterest
                else if (platformLower.includes('pin') || platformLower.includes('pint')) {
                  return <Image src="/icons/brands/pinterest.svg" width={16} height={16} alt="Pinterest" className="h-4 w-4" />;
                } 
                // Reddit
                else if (platformLower.includes('red')) {
                  return <Image src="/icons/brands/reddit.svg" width={16} height={16} alt="Reddit" className="h-4 w-4" />;
                } 
                // Default: Globe icon
                else {
                  return (
                    <Icon 
                      name="faGlobe"
                      className="h-4 w-4 text-[var(--accent-color)]" 
                      iconType="static" 
                      solid={true} 
                    />
                  );
                }
              })()}
            </div>
          )}
        </div>
      </div>
      
      {/* Asset Details Section */}
      <div className="p-4 bg-white flex-grow">
        <div className="space-y-4">
          {/* Influencer */}
          <div className="flex items-start">
            <Icon name="faUser" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Influencer</p>
              <p className="text-sm text-gray-800 font-medium">{asset.influencerHandle || 'Not specified'}</p>
            </div>
          </div>
          
          {/* Platform (only show if not displayed in header) */}
          {!isPlatformSpecified() && (
            <div className="flex items-start">
              <Icon name="faGlobe" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Platform</p>
                <p className="text-sm text-gray-800 font-medium">Not specified</p>
              </div>
            </div>
          )}
          
          {/* Description */}
          <div className="flex items-start">
            <Icon name="faCircleInfo" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-800">{description}</p>
            </div>
          </div>
          
          {/* Budget */}
          <div className="flex items-start">
            <Icon name="faDollarSign" className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" iconType="static" solid={false} />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Budget</p>
              <p className="text-sm text-gray-800 font-medium">
                {asset.budget ? formatCurrency(asset.budget) : 'Not specified'}
              </p>
            </div>
          </div>
          
          {/* Optional: File Size for images or Duration for videos */}
          {(asset.size || asset.duration) && (
            <div className="flex items-start">
              <Icon 
                name={asset.type === 'video' ? "faClock" : "faFileSize"} 
                className="h-5 w-5 text-[var(--accent-color)] mr-3 mt-1 flex-shrink-0" 
                iconType="static" 
                solid={false} 
              />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{asset.type === 'video' ? "Duration" : "File Size"}</p>
                <p className="text-sm text-gray-800">
                  {asset.type === 'video' && asset.duration 
                    ? `${asset.duration} seconds`
                    : asset.size
                      ? formatFileSize(asset.size)
                      : 'Not available'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default AssetCard; 