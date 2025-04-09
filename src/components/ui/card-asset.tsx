/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/icon/icon';
// Remove typography import until we create it
// import { Text } from '@/components/ui/typography'
import { AssetCardProps } from './types';

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
 * Props for the AssetPreview component
 */
interface AssetPreviewProps {
  url?: string;
  fileName?: string;
  type?: string;
  showTypeLabel?: boolean;
  className?: string;
  [key: string]: any;
}

/**
 * Asset preview component for images and videos
 */
const AssetPreview = ({
  url,
  fileName,
  type,
  showTypeLabel = false,
  className,
  ...props
}: AssetPreviewProps) => {
  const isVideo = type === 'video' || (typeof type === 'string' && type.includes('video'));
  const isImage = type === 'image' || (typeof type === 'string' && type.includes('image'));
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Toggle play/pause when the button is clicked or video area is clicked
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .catch(error => {
          console.warn('Play was prevented:', error);
        });
      setIsPlaying(true);
    }
  };

  // Update play state based on video events
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [isVideo]);

  // Effect to handle video autoplay and looping
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Auto-play the video when component mounts
      const playVideo = () => {
        video.play().catch(error => {
          console.warn('Auto-play was prevented:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      };

      // Handle video looping - restart after 5 seconds or when ended
      const handleTimeUpdate = () => {
        if (video.currentTime >= 5) {
          video.currentTime = 0;
          if (isPlaying) {
            video.play().catch(err => {
              console.error('Error replaying video:', err);
              setIsPlaying(false);
            });
          }
        }
      };

      const handleEnded = () => {
        video.currentTime = 0;
        if (isPlaying) {
          video.play().catch(err => {
            console.error('Error replaying video:', err);
            setIsPlaying(false);
          });
        }
      };

      // Add event listeners
      video.addEventListener('loadedmetadata', playVideo);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      // Remove event listeners on cleanup
      return () => {
        video.removeEventListener('loadedmetadata', playVideo);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [isVideo, url, isPlaying]);

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-gray-100 w-full aspect-square",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {/* Image preview */}
      {isImage && (
        <img
          src={url}
          alt={fileName}
          className="w-full h-full object-cover"
        />
      )}

      {/* Video preview with play/pause button */}
      {isVideo && (
        <div
          className="relative w-full h-full overflow-hidden"
          onClick={togglePlayPause}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            loop
          />

          {/* Play/Pause button that appears on hover */}
          {isHovering && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-200">
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 bg-gray-600 bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all duration-200 z-10 absolute group"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <Icon
                  iconId={isPlaying ? "faPauseSolid" : "faPlaySolid"}
                  className="h-6 w-6 text-white"
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8">
          <Icon
            iconId="faInfoLight"
            className="h-12 w-12 text-gray-400"
          />
        </div>
      )}
    </div>
  );
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
      <AssetPreview
        url={url}
        fileName={name}
        type={type}
        showTypeLabel={showTypeLabel}
      />

      {/* Asset Information */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          {/* Asset Name & Type Icon */}
          <div className="flex items-center min-w-0 mr-2"> { /* Container for name and icon */}
            <p className="font-semibold text-gray-900 flex-shrink truncate text-lg mr-2">
              {name}
            </p>
            {/* Add Type Icon Here */}
            <div className="flex-shrink-0 text-gray-400">
              {type?.includes('video') && <Icon iconId="faVideoLight" className="h-4 w-4" title="Video" />}
              {type?.includes('image') && <Icon iconId="faCameraLight" className="h-4 w-4" title="Image" />}
              {!type?.includes('video') && !type?.includes('image') && <Icon iconId="faFileLight" className="h-4 w-4" title="File" />}
            </div>
          </div>

          {/* Platform (if specified and different from default) */}
          {hasPlatform(platform, defaultPlatform) && (
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <Icon
                iconId={platform?.toLowerCase() === 'instagram' ? 'faInstagramLight' :
                  platform?.toLowerCase() === 'tiktok' ? 'faTiktokLight' :
                    platform?.toLowerCase() === 'youtube' ? 'faYoutubeLight' :
                      'faHashtagLight'}
                className="h-3 w-3 mr-1"
              />
              {platform}
            </div>
          )}
        </div>

        {/* Influencer Handle (if available) */}
        {influencerHandle && (
          <div className="mt-2 flex items-center text-gray-600">
            <Icon
              iconId="faUserLight"
              className="h-3 w-3 mr-1"
            />
            <span className="text-gray-600 text-sm">
              {influencerHandle}
            </span>
          </div>
        )}

        {/* Description (if available) */}
        {description && (
          <p className="mt-3 text-gray-600 line-clamp-2 text-sm">
            {description}
          </p>
        )}

        {/* Budget (if available) */}
        {budget !== undefined && budget !== null && (
          <div className="mt-auto pt-3 flex items-center text-gray-800">
            <Icon
              iconId="faDollarSignLight"
              className="h-3 w-3 mr-2"
            />
            <span className="font-medium text-sm">
              {formatCurrency(budget, currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetCard; 