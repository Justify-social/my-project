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
      videoRef.current.play().catch(error => {
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
        'relative rounded-t-lg overflow-hidden bg-muted/50 w-full aspect-square',
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
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      )}

      {/* Video preview with play/pause button */}
      {isVideo && (
        <div
          className="relative w-full h-full overflow-hidden cursor-pointer group"
          onClick={togglePlayPause}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            muted
            playsInline
            loop
            preload="metadata"
          />

          {/* Play/Pause button overlay */}
          {(isHovering || !isPlaying) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={togglePlayPause}
                className="w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors duration-200 z-10"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                <Icon
                  iconId={isPlaying ? 'faPauseSolid' : 'faPlaySolid'}
                  className="h-4 w-4 text-white"
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center h-full w-full p-4 bg-muted">
          <Icon iconId="faFileCircleQuestionLight" className="h-10 w-10 text-muted-foreground/50" />
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
}: AssetCardProps) {
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
    ? 'faVideoLight'
    : isImageAsset
      ? 'faCameraLight'
      : 'faFileLight';
  const mediaTypeLabel = isVideoAsset ? 'Video' : isImageAsset ? 'Image' : 'File';

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden h-full',
        'border border-border rounded-lg shadow-sm',
        'hover:shadow-lg transition-shadow duration-300 ease-in-out',
        props.onClick && 'cursor-pointer',
        cardClassName
      )}
      {...props}
    >
      <AssetPreview url={url} fileName={name} type={type} showTypeLabel={showTypeLabel} />

      <CardHeader className="flex-row items-center justify-between gap-2 pb-2 pt-3 px-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Icon
            iconId={mediaTypeIconId}
            className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
            title={mediaTypeLabel}
          />
          <CardTitle className="text-sm font-medium leading-snug truncate" title={name}>
            {name || 'Untitled Asset'}
          </CardTitle>
        </div>
        {hasPlatform(platform, defaultPlatform) && (
          <Badge
            variant="outline"
            className="flex-shrink-0 items-center gap-1 px-1.5 py-0.5 border-border"
          >
            <Icon iconId={platformIconId} className="h-3 w-3" />
            <span className="text-xs font-medium text-muted-foreground">{platform}</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className={cn('px-3 pb-3 flex flex-col flex-grow', className)}>
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
              <span className="font-medium text-xs">{formatCurrency(budget, currency)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AssetCard;
