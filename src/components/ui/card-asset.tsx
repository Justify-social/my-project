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
import { Card, CardHeader as _CardHeader, CardContent as _CardContent } from '@/components/ui/card';
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
        {/* File type icon - positioned exactly like trash can but on left */}
        {mediaTypeIconId && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="px-2 py-1.5 rounded-md text-xs inline-flex items-center bg-slate-900/90 border border-slate-700/50 shadow-lg backdrop-blur-sm"
              title={mediaTypeLabel}
            >
              <Icon iconId={mediaTypeIconId} className="h-3 w-3 text-white" />
            </Badge>
          </div>
        )}
      </div>
    );
  } else if (isImage && url) {
    return (
      <div
        className={cn('relative overflow-hidden bg-white w-full aspect-square p-3', className)}
        {...props}
      >
        <Image
          src={url}
          alt={fileName ?? 'Asset preview'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-sm shadow-sm"
          width={300}
          height={300}
          unoptimized
        />
        {/* File type icon - positioned exactly like trash can but on left */}
        {mediaTypeIconId && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="px-2 py-1.5 rounded-md text-xs inline-flex items-center bg-slate-900/90 border border-slate-700/50 shadow-lg backdrop-blur-sm"
              title={mediaTypeLabel}
            >
              <Icon iconId={mediaTypeIconId} className="h-3 w-3 text-white" />
            </Badge>
          </div>
        )}
      </div>
    );
  } else if (isVideo && url && !muxPlaybackId) {
    return (
      <div
        className={cn('relative overflow-hidden bg-white w-full aspect-square p-3', className)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={togglePlayPause}
        {...props}
      >
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-sm shadow-sm"
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
              className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-10 shadow-lg"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              <Icon
                iconId={isPlaying ? 'faPauseSolid' : 'faPlaySolid'}
                className="h-5 w-5 text-white"
              />
            </button>
          </div>
        )}
        {/* File type icon - positioned exactly like trash can but on left */}
        {mediaTypeIconId && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="px-2 py-1.5 rounded-md text-xs inline-flex items-center bg-slate-900/90 border border-slate-700/50 shadow-lg backdrop-blur-sm"
              title={mediaTypeLabel}
            >
              <Icon iconId={mediaTypeIconId} className="h-3 w-3 text-white" />
            </Badge>
          </div>
        )}
      </div>
    );
  } else if (isVideo && (!muxPlaybackId || muxProcessingStatus !== 'READY')) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-slate-50 w-full aspect-square p-3 flex flex-col items-center justify-center',
          className
        )}
        {...props}
      >
        <div className="bg-white rounded-sm shadow-sm w-full h-full flex flex-col items-center justify-center">
          <Icon
            iconId={
              mediaTypeIconId ||
              (muxProcessingStatus === 'ERROR' || muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID'
                ? 'faCircleXmarkLight'
                : 'faCircleNotchLight')
            }
            className={`h-10 w-10 text-muted-foreground ${(muxProcessingStatus === 'MUX_PROCESSING' || muxProcessingStatus === 'AWAITING_UPLOAD') && !muxPlaybackId ? 'animate-spin' : ''}`}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center px-2">
            {muxProcessingStatus === 'MUX_PROCESSING' || muxProcessingStatus === 'AWAITING_UPLOAD'
              ? 'Processing...'
              : muxProcessingStatus === 'ERROR' || muxProcessingStatus === 'ERROR_NO_PLAYBACK_ID'
                ? 'Error'
                : 'Video unavailable'}
          </p>
        </div>
        {/* File type icon - positioned exactly like trash can but on left */}
        {mediaTypeIconId && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="px-2 py-1.5 rounded-md text-xs inline-flex items-center bg-slate-900/90 border border-slate-700/50 shadow-lg backdrop-blur-sm"
              title={mediaTypeLabel}
            >
              <Icon iconId={mediaTypeIconId} className="h-3 w-3 text-white" />
            </Badge>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-50 w-full aspect-square p-3 flex flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      <div className="bg-white rounded-sm shadow-sm w-full h-full flex flex-col items-center justify-center">
        <Icon
          iconId={mediaTypeIconId || 'faFileCircleQuestionLight'}
          className="h-10 w-10 text-muted-foreground/50 mb-2"
        />
        {mediaTypeLabel && <p className="text-xs text-muted-foreground">{mediaTypeLabel}</p>}
        {fileName && (
          <p className="text-xs text-muted-foreground truncate max-w-full px-2 text-center">
            {fileName}
          </p>
        )}
      </div>
      {/* File type icon - positioned exactly like trash can but on left */}
      {mediaTypeIconId && !mediaTypeLabel && (
        <div className="absolute top-3 left-3 z-10">
          <Badge
            variant="secondary"
            className="px-2 py-1.5 rounded-md text-xs inline-flex items-center bg-slate-900/90 border border-slate-700/50 shadow-lg backdrop-blur-sm"
          >
            <Icon iconId={mediaTypeIconId} className="h-3 w-3 text-white" />
          </Badge>
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
  const [influencerProfileImage, setInfluencerProfileImage] = useState<string | null>(null);

  if (process.env.NODE_ENV === 'development') {
    console.log('[AssetCard STEP 5 RENDER] Full props:', { asset, currency, defaultPlatform }); // Added for Step 5 debugging
  }

  // Fetch influencer profile image similar to card-influencer.tsx
  useEffect(() => {
    const fetchInfluencerProfileImage = async () => {
      if (!asset?.influencerHandle || !asset?.platform) return;

      try {
        const response = await fetch(
          `/api/influencers/fetch-profile?handle=${encodeURIComponent(asset.influencerHandle)}&platform=${encodeURIComponent(asset.platform.toUpperCase())}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.avatarUrl) {
            setInfluencerProfileImage(data.data.avatarUrl);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch profile image for ${asset.influencerHandle}:`, error);
      }
    };

    fetchInfluencerProfileImage();
  }, [asset?.influencerHandle, asset?.platform]);

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
        // Premium Polaroid-inspired design with Apple/Shopify quality - made wider and bigger
        'relative group flex flex-col overflow-hidden h-full max-w-md mx-auto', // Changed from max-w-sm to max-w-md for wider cards
        'bg-white border-0 rounded-xl shadow-lg',
        'hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out',
        // Enhanced Polaroid-style depth and dimension
        'before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:via-transparent before:to-black/5 before:pointer-events-none before:z-10',
        'after:absolute after:inset-0 after:shadow-inner after:pointer-events-none after:z-10',
        props.onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]',
        cardClassName
      )}
      style={{
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
      {...props}
    >
      {/* Polaroid-style image area with generous white border - increased image size */}
      <div className="p-4 pb-2 bg-white">
        {' '}
        {/* Reduced padding from p-6 pb-3 to p-4 pb-2 for larger content area */}
        <AssetPreview
          url={isVideoAsset && muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : url}
          fileName={name}
          type={type}
          mediaTypeIconId={mediaTypeIconId}
          mediaTypeLabel={mediaTypeLabel}
          muxPlaybackId={muxPlaybackId}
          muxProcessingStatus={muxProcessingStatus}
          className="rounded-md overflow-hidden border border-slate-200/60 shadow-sm"
        />
      </div>

      {/* Polaroid-style content area with generous spacing */}
      <div className={cn('flex flex-col flex-grow bg-white px-8 pb-6 pt-5', className)}>
        {' '}
        {/* Reduced bottom padding from pb-8 to pb-6 */}
        {/* Header section with enhanced spacing and center alignment */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Centered Title */}
          <h3
            className="font-sora text-lg font-bold leading-tight text-slate-900 text-center max-w-full px-2" // Increased from text-base to text-lg
            title={name}
          >
            {name || 'Untitled Asset'}
          </h3>

          {/* Centered Enhanced Influencer Handle with profile image */}
          {influencerHandle && (
            <div className="flex flex-col items-center gap-3">
              {' '}
              {/* Increased gap from gap-2 to gap-3 */}
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {' '}
                  {/* Increased from h-8 w-8 to h-9 w-9 */}
                  {influencerProfileImage ? (
                    <Image
                      src={influencerProfileImage}
                      alt={influencerHandle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon iconId="faUserCircleLight" className="h-6 w-6 text-slate-400" />{' '}
                      {/* Increased from h-5 w-5 to h-6 w-6 */}
                    </div>
                  )}
                </div>
                <span className="text-base font-semibold text-slate-700" title={influencerHandle}>
                  {' '}
                  {/* Increased from text-sm to text-base */}
                  {influencerHandle}
                </span>
              </div>
              {/* Removed platform display from here - will be moved to bottom left */}
            </div>
          )}

          {/* Platform badge with enhanced styling - only show if no influencer or different from influencer platform */}
          {hasPlatform(platform, defaultPlatform) && !influencerHandle && (
            <Badge
              variant="outline"
              className="flex-shrink-0 items-center gap-2 px-3 py-2 border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-colors shadow-sm"
            >
              <Icon iconId={platformIconId} className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700 capitalize">{platform}</span>
            </Badge>
          )}
        </div>
        {/* Description section with enhanced typography and proper spacing */}
        {description && (
          <div className="mb-8 px-2">
            <div className="flex items-center mb-4">
              <div className="h-px bg-gradient-to-r from-slate-300 via-slate-200 to-transparent flex-1"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest px-6 bg-white">
                Why this content?
              </span>
              <div className="h-px bg-gradient-to-l from-slate-300 via-slate-200 to-transparent flex-1"></div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 font-inter text-left px-1">
              {description}
            </p>
          </div>
        )}
        {/* Spacer to push bottom section to bottom */}
        <div className="flex-grow"></div>
        {/* Bottom section with platform icon (left) and budget (right) */}
        {(platform || (budget !== undefined && budget !== null)) && (
          <div className="mt-auto pt-6 px-2 pb-4">
            {' '}
            {/* Added pb-4 for margin from bottom */}
            <div className="flex justify-between items-center">
              {/* Platform icon on bottom left */}
              {platform && (
                <div className="flex-shrink-0">
                  <Badge
                    variant="outline"
                    className="p-2 border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-colors shadow-sm"
                  >
                    <Icon iconId={platformIconId} className="h-4 w-4 text-slate-600" />
                  </Badge>
                </div>
              )}

              {/* Budget badge on bottom right */}
              {budget !== undefined && budget !== null && (
                <div className="flex-shrink-0">
                  <Badge
                    variant="secondary"
                    className="text-base font-bold px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {formatCurrency(budget, currency)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default AssetCard;
