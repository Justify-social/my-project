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
import {
  Card,
  CardHeader as _CardHeader,
  CardContent as _CardContent,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import MuxPlayer from '@mux/mux-player-react';

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
interface AssetPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
  fileName?: string;
  type?: string;
  mediaTypeIconId?: string;
  mediaTypeLabel?: string;
  className?: string;
  muxPlaybackId?: string;
  muxProcessingStatus?: string;
}

export const AssetPreview = ({
  url,
  fileName,
  type,
  mediaTypeIconId,
  mediaTypeLabel,
  className,
  muxPlaybackId,
  muxProcessingStatus,
  ...props
}: AssetPreviewProps) => {
  console.log(
    `[AssetPreview RENDER] PlaybackID: ${muxPlaybackId}, Status: ${muxProcessingStatus}, Type: ${type}, FileName: ${fileName}`
  );
  const isVideo = type === 'video' || (typeof type === 'string' && type.includes('video'));
  const isImage = type === 'image' || (typeof type === 'string' && type.includes('image'));

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.readyState < videoRef.current.HAVE_METADATA) return;

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(error => console.warn('Play was prevented:', error));
    } else {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (isVideo && currentVideoRef && !muxPlaybackId) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      currentVideoRef.addEventListener('play', handlePlay);
      currentVideoRef.addEventListener('playing', handlePlay);
      currentVideoRef.addEventListener('pause', handlePause);
      currentVideoRef.addEventListener('ended', handleEnded);

      setIsPlaying(!currentVideoRef.paused && !currentVideoRef.ended);

      return () => {
        currentVideoRef.removeEventListener('play', handlePlay);
        currentVideoRef.removeEventListener('playing', handlePlay);
        currentVideoRef.removeEventListener('pause', handlePause);
        currentVideoRef.removeEventListener('ended', handleEnded);
      };
    }
  }, [isVideo, muxPlaybackId, url]);

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    if (isVideo && currentVideoRef && url && !muxPlaybackId) {
      const playVideo = () => {
        currentVideoRef.play().catch(error => {
          console.warn('Auto-play was prevented for HTML5 video:', error);
          setIsPlaying(false);
        });
      };

      if (currentVideoRef.readyState >= currentVideoRef.HAVE_ENOUGH_DATA) {
        playVideo();
      } else {
        currentVideoRef.addEventListener('canplaythrough', playVideo, { once: true });
      }

      return () => {
        currentVideoRef.removeEventListener('canplaythrough', playVideo);
      };
    }
  }, [isVideo, url, muxPlaybackId]);

  if (isVideo && muxPlaybackId && muxProcessingStatus === 'READY') {
    return (
      <div
        className={cn('relative overflow-hidden bg-black w-full aspect-square', className)}
        {...props}
      >
        <MuxPlayer
          playbackId={muxPlaybackId}
          streamType="on-demand"
          style={{ height: '100%', width: '100%' }}
          title={fileName}
          autoPlay="any"
          muted={true}
          preload="auto"
        />
        {mediaTypeIconId && (
          <Badge
            variant="secondary"
            className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md text-xs inline-flex items-center"
            title={mediaTypeLabel}
          >
            <Icon iconId={mediaTypeIconId} className="h-3 w-3" />
          </Badge>
        )}
      </div>
    );
  } else if (isImage && url) {
    return (
      <div
        className={cn('relative overflow-hidden bg-muted/50 w-full aspect-square p-3', className)}
        {...props}
      >
        <Image
          src={url}
          alt={fileName ?? 'Asset preview'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-md"
          width={300}
          height={300}
          unoptimized
        />
        {mediaTypeIconId && (
          <Badge
            variant="secondary"
            className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md text-xs inline-flex items-center"
            title={mediaTypeLabel}
          >
            <Icon iconId={mediaTypeIconId} className="h-3 w-3" />
          </Badge>
        )}
      </div>
    );
  } else if (isVideo && url && !muxPlaybackId) {
    return (
      <div
        className={cn('relative overflow-hidden bg-muted/50 w-full aspect-square p-3', className)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={togglePlayPause}
        {...props}
      >
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-md"
          muted
          playsInline
          loop
          preload="metadata"
        />
        {(isHovering || !isPlaying) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              <Icon
                iconId={isPlaying ? 'faPauseSolid' : 'faPlaySolid'}
                className="h-4 w-4 text-white"
              />
            </button>
          </div>
        )}
        {mediaTypeIconId && (
          <Badge
            variant="secondary"
            className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md text-xs inline-flex items-center"
            title={mediaTypeLabel}
          >
            <Icon iconId={mediaTypeIconId} className="h-3 w-3" />
          </Badge>
        )}
      </div>
    );
  } else if (isVideo && (!muxPlaybackId || muxProcessingStatus !== 'READY')) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-muted/50 w-full aspect-square p-3 flex flex-col items-center justify-center',
          className
        )}
        {...props}
      >
        <Icon
          iconId={
            mediaTypeIconId ||
            (muxProcessingStatus === 'ERROR' || muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID'
              ? 'faCircleXmarkLight'
              : 'faCircleNotchLight')
          }
          className={`h-10 w-10 text-muted-foreground ${(muxProcessingStatus === 'MUX_PROCESSING' || muxProcessingStatus === 'AWAITING_UPLOAD') && !muxPlaybackId ? 'animate-spin' : ''}`}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {muxProcessingStatus === 'MUX_PROCESSING' || muxProcessingStatus === 'AWAITING_UPLOAD'
            ? 'Processing...'
            : muxProcessingStatus === 'ERROR' || muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID'
              ? 'Error'
              : 'Video unavailable'}
        </p>
        {mediaTypeIconId && (
          <Badge
            variant="secondary"
            className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md text-xs inline-flex items-center"
            title={mediaTypeLabel}
          >
            <Icon iconId={mediaTypeIconId} className="h-3 w-3" />
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted/50 w-full aspect-square p-3 flex flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      <Icon
        iconId={mediaTypeIconId || 'faFileCircleQuestionLight'}
        className="h-10 w-10 text-muted-foreground/50 mb-1"
      />
      {mediaTypeLabel && <p className="text-xs text-muted-foreground">{mediaTypeLabel}</p>}
      {fileName && (
        <p className="text-xs text-muted-foreground truncate max-w-full px-1">{fileName}</p>
      )}
      {mediaTypeIconId && !mediaTypeLabel && (
        <Badge
          variant="secondary"
          className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md text-xs inline-flex items-center"
        >
          <Icon iconId={mediaTypeIconId} className="h-3 w-3" />
        </Badge>
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
  budget?: number | null | undefined; // Align with DraftAssetSchema (number | null | undefined)
  muxPlaybackId?: string;
  muxProcessingStatus?: string;
  fieldId?: string;
  muxAssetId?: string;
  rationale?: string;
}

// Ensure this interface is defined
export interface AssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  asset?: AssetData;
  currency?: string;
  defaultPlatform?: string | undefined; // Allow undefined
  className?: string; // Will apply to CardContent
  cardClassName?: string; // Will apply to Card root
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
  ...props
}: AssetCardProps) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AssetCard STEP 5 RENDER] Full props:', { asset, currency, defaultPlatform }); // Added for Step 5 debugging
  }
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
    muxPlaybackId,
    muxProcessingStatus,
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

  return (
    <Card
      className={cn(
        'relative group flex flex-col overflow-hidden h-full',
        'border border-border rounded-lg shadow-lg',
        'hover:shadow-xl transition-shadow duration-300 ease-in-out',
        props.onClick && 'cursor-pointer',
        cardClassName
      )}
      {...props}
    >
      <AssetPreview
        url={isVideoAsset && muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : url}
        fileName={name}
        type={type}
        mediaTypeIconId={mediaTypeIconId}
        mediaTypeLabel={mediaTypeLabel}
        muxPlaybackId={muxPlaybackId}
        muxProcessingStatus={muxProcessingStatus}
      />

      {/* Content Area with padding and flex-grow */}
      <div className={cn('flex flex-col flex-grow', className)}>
        <div className="p-4">
          {/* Header section moved inside content padding */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* Optional: Icon before title? If needed 
            <Icon iconId={mediaTypeIconId} className="h-4 w-4 text-muted-foreground flex-shrink-0" /> 
            */}
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
          </div>

          {/* Influencer Handle */}
          {influencerHandle && (
            <div className="mb-2 flex items-center text-muted-foreground">
              <Icon iconId="faUserLight" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="text-muted-foreground text-xs truncate" title={influencerHandle}>
                {influencerHandle}
              </span>
            </div>
          )}

          {/* Description - takes remaining space */}
          {description && (
            <div className="mb-2 flex-grow">
              <span className="text-xs font-medium text-muted-foreground underline">
                Why this content?
              </span>
              <p className="text-sm text-foreground mt-0.5 line-clamp-3">{description}</p>
            </div>
          )}

          {/* Spacer to push budget down if no description */}
          {!description && <div className="flex-grow"></div>}

          {/* Budget - Absolute positioned in bottom-right corner */}
          {budget !== undefined && budget !== null && (
            <div className="absolute bottom-3 right-3 z-10">
              <Badge variant="secondary" className="text-sm font-medium">
                {formatCurrency(budget, currency)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default AssetCard;
