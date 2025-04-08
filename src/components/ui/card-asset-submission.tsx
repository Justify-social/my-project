/**
 * @component AssetCardSubmission
 * @category organism
 * @subcategory card
 * @description Card component specifically for asset submission/review, handling potentially undefined platforms.
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/icon/icon';
import { AssetCardProps } from './types'; // We'll reuse the base type and refine below

/**
 * Type specifically for the submission card, allowing optional platform.
 */
interface AssetCardSubmissionProps extends Omit<AssetCardProps, 'asset' | 'defaultPlatform'> {
    asset: Omit<AssetCardProps['asset'], 'platform'> & {
        /** Platform the asset belongs to (optional for submission) */
        platform?: string | undefined;
    };
    /** Default platform (optional for submission) */
    defaultPlatform?: string | undefined;
}


// --- Copied from card-asset.tsx (with component name changed) ---

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
        return true;
    }

    // Only display if platform is valid AND different from the valid defaultPlatform
    return platform !== defaultPlatform;
};


/**
 * Props for the AssetPreview component (Internal)
 */
interface AssetPreviewPropsInternal {
    url?: string;
    fileName?: string;
    type?: string;
    showTypeLabel?: boolean;
    className?: string;
    [key: string]: any;
}

/**
 * Asset preview component for images and videos (Internal)
 */
const AssetPreview = ({
    url,
    fileName,
    type,
    showTypeLabel = false,
    className,
    ...props
}: AssetPreviewPropsInternal) => {
    const isVideo = type === 'video' || (typeof type === 'string' && type.includes('video'));
    const isImage = type === 'image' || (typeof type === 'string' && type.includes('image'));
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(error => { console.warn('Play was prevented:', error); });
            setIsPlaying(true);
        }
    };

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

    useEffect(() => {
        if (isVideo && videoRef.current) {
            const video = videoRef.current;
            const playVideo = () => {
                video.play().catch(error => { console.warn('Auto-play was prevented:', error); setIsPlaying(false); });
                setIsPlaying(true);
            };
            const handleTimeUpdate = () => {
                if (video.currentTime >= 5) {
                    video.currentTime = 0;
                    if (isPlaying) video.play().catch(err => { console.error('Error replaying video:', err); setIsPlaying(false); });
                }
            };
            const handleEnded = () => {
                video.currentTime = 0;
                if (isPlaying) video.play().catch(err => { console.error('Error replaying video:', err); setIsPlaying(false); });
            };
            video.addEventListener('loadedmetadata', playVideo);
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('ended', handleEnded);
            return () => {
                video.removeEventListener('loadedmetadata', playVideo);
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('ended', handleEnded);
            };
        }
    }, [isVideo, url, isPlaying]);

    return (
        <div
            className={cn("relative rounded-lg overflow-hidden bg-gray-100 w-full aspect-square", className)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            {...props}
        >
            {isImage && <img src={url} alt={fileName} className="w-full h-full object-cover" />}
            {isVideo && (
                <div className="relative w-full h-full overflow-hidden" onClick={togglePlayPause}>
                    <video ref={videoRef} src={url} className="w-full h-full object-cover" muted playsInline loop />
                    {isHovering && (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-200">
                            <button
                                onClick={togglePlayPause}
                                className="w-16 h-16 bg-gray-600 bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all duration-200 z-10 absolute group"
                                aria-label={isPlaying ? "Pause video" : "Play video"}
                            >
                                <Icon iconId={isPlaying ? "faPauseSolid" : "faPlaySolid"} className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    )}
                </div>
            )}
            {!isImage && !isVideo && (
                <div className="flex items-center justify-center p-8">
                    <Icon iconId="faInfoLight" className="h-12 w-12 text-gray-400" />
                </div>
            )}
        </div>
    );
};

/**
 * AssetCardSubmission component: Displays asset info, handles optional platform.
 */
export function AssetCardSubmission({
    asset,
    currency = 'USD',
    defaultPlatform, // Now accepts undefined
    className,
    showTypeLabel = false,
    ...props
}: AssetCardSubmissionProps) { // Use the refined props type
    if (!asset) return null;

    const {
        name,
        url,
        type,
        platform, // Now accepts undefined
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
                    <div className="flex items-center min-w-0 mr-2">
                        <p className="font-semibold text-gray-900 flex-shrink truncate text-lg mr-2">
                            {name}
                        </p>
                        <div className="flex-shrink-0 text-gray-400">
                            {type?.includes('video') && <Icon iconId="faVideoLight" className="h-4 w-4" title="Video" />}
                            {type?.includes('image') && <Icon iconId="faCameraLight" className="h-4 w-4" title="Image" />}
                            {!type?.includes('video') && !type?.includes('image') && <Icon iconId="faFileLight" className="h-4 w-4" title="File" />}
                        </div>
                    </div>

                    {/* Platform (only if specified and different from default) */}
                    {/* hasPlatform check correctly handles undefined platform/defaultPlatform */}
                    {hasPlatform(platform, defaultPlatform) && (
                        <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium flex items-center">
                            <Icon
                                // Ensure platform is treated as string here due to hasPlatform check
                                iconId={(platform as string).toLowerCase() === 'instagram' ? 'faInstagramLight' :
                                    (platform as string).toLowerCase() === 'tiktok' ? 'faTiktokLight' :
                                        (platform as string).toLowerCase() === 'youtube' ? 'faYoutubeLight' :
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
                        <Icon iconId="faUserLight" className="h-3 w-3 mr-1" />
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
                        <Icon iconId="faDollarSignLight" className="h-3 w-3 mr-2" />
                        <span className="font-medium text-sm">
                            {formatCurrency(budget, currency)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Decide if you want a default export or named export
// export default AssetCardSubmission; 