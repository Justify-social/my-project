/**
 * @component AssetCard
 * @category organism
 * @subcategory card
 * @description Card component displaying asset information with preview, title, platform, and budget using standard Card components.
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon/icon';
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

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
 * Helper to check if platform should be displayed.
 * Handles null/undefined values for both platform and defaultPlatform.
 */
const hasPlatform = (platform?: string | undefined, defaultPlatform?: string | undefined): platform is string => {
  // Check if platform is a non-empty string, and not explicitly 'null' or 'undefined'
  const isPlatformValid = typeof platform === 'string' && platform.trim() !== '' && platform !== 'null' && platform !== 'undefined';

  if (!isPlatformValid) {
    return false; // Don't display if platform itself is invalid
  }

  // If defaultPlatform is not provided or invalid, display the valid platform
  const isDefaultPlatformValid = typeof defaultPlatform === 'string' && defaultPlatform.trim() !== '' && defaultPlatform !== 'null' && defaultPlatform !== 'undefined';
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
        "relative rounded-t-lg overflow-hidden bg-muted w-full aspect-square",
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
          alt={fileName ?? 'Asset preview'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Video preview with play/pause button */}
      {isVideo && (
        <div
          className="relative w-full h-full overflow-hidden cursor-pointer"
          onClick={togglePlayPause}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            muted
            playsInline
            loop
            preload="metadata"
          />

          {/* Play/Pause button overlay */}
          {(isHovering || !isPlaying) && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200">
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors duration-200 z-10 group"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <Icon
                  iconId={isPlaying ? "faPauseSolid" : "faPlaySolid"}
                  className="h-5 w-5 text-white"
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center h-full w-full p-8">
          <Icon
            iconId="faFileLinesLight"
            className="h-12 w-12 text-muted-foreground"
          />
        </div>
      )}
    </div>
  );
};

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
export function AssetCard({
  asset,
  currency = 'USD',
  defaultPlatform, // Now accepts undefined
  className,
  cardClassName,
  showTypeLabel = false,
  ...props
}: AssetCardProps) { // Uses updated AssetCardProps
  if (!asset) return null;

  const {
    name,
    url,
    type,
    platform, // Can be undefined
    influencerHandle,
    description,
    budget
  } = asset;

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden",
        "hover:shadow-md transition-shadow duration-200",
        props.onClick && "cursor-pointer",
        cardClassName
      )}
      {...props}
    >
      <AssetPreview
        url={url}
        fileName={name}
        type={type}
        showTypeLabel={showTypeLabel}
      />

      <CardHeader className="flex-row items-start justify-between pb-2 pt-4 px-4">
        <div className="flex items-center min-w-0 mr-2 flex-grow">
          <p className="font-semibold text-foreground flex-shrink truncate text-base mr-2">
            {name}
          </p>
          <div className="flex-shrink-0 text-muted-foreground">
            {type?.includes('video') && <Icon iconId="faVideoLight" className="h-4 w-4" title="Video" />}
            {type?.includes('image') && <Icon iconId="faCameraLight" className="h-4 w-4" title="Image" />}
            {!type?.includes('video') && !type?.includes('image') && <Icon iconId="faFileLight" className="h-4 w-4" title="File" />}
          </div>
        </div>
        {hasPlatform(platform, defaultPlatform) && (
          <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium flex items-center whitespace-nowrap">
            <Icon
              iconId={platform.toLowerCase() === 'instagram' ? 'faInstagram' :
                platform.toLowerCase() === 'tiktok' ? 'faTiktok' :
                  platform.toLowerCase() === 'youtube' ? 'faYoutube' :
                    'faHashtag'}
              className="h-3 w-3 mr-1"
            />
            {platform}
          </div>
        )}
      </CardHeader>

      <CardContent className={cn("px-4 pb-4 flex flex-col flex-grow", className)}>
        {influencerHandle && (
          <div className="mt-1 flex items-center text-muted-foreground">
            <Icon
              iconId="faUserLight"
              className="h-3 w-3 mr-1.5"
            />
            <span className="text-muted-foreground text-sm">
              {influencerHandle}
            </span>
          </div>
        )}

        {description && (
          <p className="mt-2 text-muted-foreground line-clamp-2 text-sm flex-grow">
            {description}
          </p>
        )}

        {budget !== undefined && budget !== null && (
          <div className="mt-auto pt-3 flex items-center text-foreground">
            <Icon
              iconId="faDollarSignLight"
              className="h-3 w-3 mr-1.5"
            />
            <span className="font-medium text-sm">
              {formatCurrency(budget, currency)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AssetCard; 