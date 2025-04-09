// Updated import paths via tree-shake script - 2025-04-01T17:13:32.210Z
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/string/utils';
import { getSafeAssetUrl } from '@/utils/file-utils';
import { toast } from 'sonner';

// Event to notify parent components when an asset should be removed
export const ASSET_DELETED_EVENT = 'asset:deleted';

// Global cache to prevent repeated requests for deleted assets
// This persists across component renders and remounts
const DELETED_ASSETS_CACHE = new Set<string>();

/**
 * Helper function to extract a file ID from an UploadThing URL
 */
export function extractFileIdFromUrl(url: string): string {
  if (!url) return '';

  if (url.includes('/f/')) {
    return url.split('/f/')[1].split('?')[0];
  } else if (url.includes('/files/')) {
    return url.split('/files/')[1].split('?')[0];
  }

  return '';
}

interface EnhancedAssetPreviewProps {
  url: string;
  fileName: string;
  type: string;
  id?: string;
  className?: string;
  [key: string]: any;
}

// If there's a AssetStatus type definition, update it
type AssetStatus = 'loading' | 'loaded' | 'error' | 'ready' | 'deleted';

/**
 * Enhanced preview component with better error states, progressive loading, and fallbacks
 * Specially designed to handle UploadThing assets
 */
export function EnhancedAssetPreview({ url, fileName, type, id, className, ...props }: EnhancedAssetPreviewProps) {
  const [status, setStatus] = useState<AssetStatus>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileId, setFileId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine preview type with enhanced detection
  // Use useMemo to prevent recalculation on every render
  const fileTypes = React.useMemo(() => {
    const isImage = type?.includes('image');
    const isVideo = type?.includes('video');
    return { isImage, isVideo };
  }, [type]);

  const { isImage, isVideo } = fileTypes;

  // Extract file ID from URL for cache lookup
  useEffect(() => {
    if (!url) return;

    // Extract fileId from URL for cache checking
    let extractedFileId = '';
    if (url.includes('/f/')) {
      extractedFileId = url.split('/f/')[1].split('?')[0];
    } else if (url.includes('/files/')) {
      extractedFileId = url.split('/files/')[1].split('?')[0];
    } else if (url.includes('fileId=')) {
      extractedFileId = url.split('fileId=')[1].split('&')[0];
    }

    // Check if this asset is already known to be deleted
    if (extractedFileId && DELETED_ASSETS_CACHE.has(extractedFileId)) {
      console.log(`Asset ${fileName} (${extractedFileId}) already known to be deleted, skipping requests`);
      setStatus('deleted');
      return;
    }

    setFileId(extractedFileId);
  }, [url, fileName]);

  // Process and test the URL when component mounts or URL changes
  useEffect(() => {
    let isMounted = true;
    // Track cleanup functions for image loading
    const cleanupFunctions: Array<() => void> = [];

    if (!url) {
      setStatus('error');
      setError(new Error('No URL provided'));
      return;
    }

    // Reset error state
    setError(null);
    setStatus('loading');

    // Check if this is an UploadThing URL
    const isUploadThingUrl = url.includes('ufs.sh') ||
      url.includes('uploadthing') ||
      url.includes('utfs.io');

    const processAsset = async () => {
      try {
        // For UploadThing URLs, use our proxy with the file ID for better detection
        if (isUploadThingUrl) {
          // Add proxy wrapper for CORS and to get alternate file keys
          const assetProxyUrl = url.startsWith('/api/asset-proxy') ?
            url :
            `/api/asset-proxy?url=${encodeURIComponent(url)}${fileId ? `&fileId=${fileId}` : ''}`;

          if (isImage) {
            if (isMounted) {
              const cleanup = loadImageWithFallback(assetProxyUrl);
              if (cleanup) cleanupFunctions.push(cleanup);
            }
          } else if (isVideo) {
            // For videos, check if they are available first
            try {
              const response = await fetch(assetProxyUrl, { method: 'HEAD' });

              if (!isMounted) return;

              // Handle permanent deletion (410 Gone)
              if (response.status === 410) {
                console.log(`Asset confirmed deleted (410 Gone): ${fileName}`);
                setStatus('deleted');

                // Trigger asset deletion from database via event system
                if (id) {
                  const deleteEvent = new CustomEvent(ASSET_DELETED_EVENT, {
                    detail: { id, url, fileId, reason: 'permanent-deletion' },
                    bubbles: true
                  });
                  document.dispatchEvent(deleteEvent);

                  // User notification
                  toast.error("Asset has been permanently deleted");
                }

                return;
              }

              if (response.ok) {
                setPreviewUrl(assetProxyUrl);
                setStatus('ready');
              } else {
                // Try direct URL as fallback for videos
                try {
                  const directResponse = await fetch(url, { method: 'HEAD' });

                  if (!isMounted) return;

                  if (directResponse.ok) {
                    setPreviewUrl(url);
                    setStatus('ready');
                  } else {
                    setStatus('error');
                    setError(new Error(`Video resource unavailable: ${fileName}`));
                  }
                } catch (err) {
                  if (!isMounted) return;

                  console.log(`Error checking direct video: ${err instanceof Error ? err.message : String(err)}`);
                  setStatus('error');
                  setError(err instanceof Error ? err : new Error('Unknown error'));
                }
              }
            } catch (err) {
              if (!isMounted) return;

              console.log(`Error checking proxy video: ${err instanceof Error ? err.message : String(err)}`);

              // Try direct URL on proxy error
              setPreviewUrl(url);
              setStatus('ready');
            }
          } else {
            // For other file types, just set the URL
            setPreviewUrl(assetProxyUrl);
            setStatus('ready');
          }
        } else {
          // For non-UploadThing URLs, use directly
          if (isImage) {
            if (isMounted) {
              const cleanup = loadImageWithFallback(url);
              if (cleanup) cleanupFunctions.push(cleanup);
            }
          } else {
            setPreviewUrl(url);
            setStatus('ready');
          }
        }
      } catch (error) {
        if (isMounted) {
          console.log(`Unhandled error in processAsset: ${error instanceof Error ? error.message : String(error)}`);
          setStatus('error');
          setError(error instanceof Error ? error : new Error('Unknown error'));
        }
      }
    };

    // Start processing
    processAsset();

    // Cleanup function
    return () => {
      isMounted = false;
      // Call all image cleanup functions
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [url, isImage, isVideo, fileId, retryCount]); // Removed 'id' from dependencies to prevent unnecessary rerenders

  // Function to load image with fallback options
  const loadImageWithFallback = (imageUrl: string) => {
    const img = new Image();

    let isComponentMounted = true;
    const cleanup = () => {
      isComponentMounted = false;
    };

    img.onload = () => {
      if (!isComponentMounted) return;
      setPreviewUrl(imageUrl);
      setStatus('loaded');
    };

    img.onerror = () => {
      if (!isComponentMounted) return;

      // For proxy URLs, try direct URL as fallback
      if (imageUrl.startsWith('/api/asset-proxy') && url) {
        console.log(`Image failed to load via proxy, trying direct URL: ${url}`);
        const directImg = new Image();
        directImg.onload = () => {
          if (!isComponentMounted) return;
          setPreviewUrl(url);
          setStatus('loaded');
        };
        directImg.onerror = () => {
          if (!isComponentMounted) return;
          console.log(`Both proxy and direct image loading failed: ${url}`);
          setStatus('error');
          setError(new Error(`Failed to load image: ${fileName}`));
        };
        directImg.src = url;
      } else {
        setStatus('error');
        setError(new Error(`Failed to load image: ${fileName}`));
      }
    };

    img.src = imageUrl;

    // Return cleanup function
    return cleanup;
  };

  // Function to handle missing asset
  const handleReportMissingAsset = () => {
    // Report the missing asset through appropriate channels
    toast.error("Asset reported as missing", {
      description: `The asset "${fileName}" will be removed from campaign.`,
      duration: 5000
    });

    // Trigger asset deletion from database
    const deleteEvent = new CustomEvent(ASSET_DELETED_EVENT, {
      detail: { id, url, fileId, reason: 'user-reported' },
      bubbles: true
    });
    document.dispatchEvent(deleteEvent);
  };

  // Retry loading when the user clicks retry
  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  // Handle video loading errors with more detailed information
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLVideoElement;
    const errorCode = target.error?.code || 0;
    const errorMessage = target.error?.message || 'Unknown error';

    // Only process video errors if we're not already in deleted state
    if (status !== 'deleted') {
      console.log(`Video loading error (${errorCode}): ${errorMessage} for ${fileName}`);
      console.log(`Video URL was: ${previewUrl}`);

      setStatus('error');
      setError(new Error(`Video failed to load: ${previewUrl}`));
    }
  };

  // Check if the video element is working by listening to metadata loaded
  const handleVideoMetadataLoaded = () => {
    setStatus('loaded');
    console.log(`Video metadata loaded successfully for ${fileName}`);
  };

  // Special handling for 410 Gone status (deleted assets)
  const checkVideoResourceAvailability = async (videoUrl: string): Promise<boolean> => {
    try {
      // Skip check if we already know this asset is deleted
      if (fileId && DELETED_ASSETS_CACHE.has(fileId)) {
        console.log(`Skipping availability check for known deleted asset: ${fileName}`);
        setStatus('deleted');
        return false;
      }

      const response = await fetch(videoUrl, { method: 'HEAD' });

      if (response.status === 410) {
        console.log(`Asset confirmed deleted (410 Gone): ${fileName}`);

        // Add to global cache to prevent future requests
        if (fileId) {
          DELETED_ASSETS_CACHE.add(fileId);
        }

        setStatus('deleted');

        // Trigger asset deletion from database via event system
        const deleteEvent = new CustomEvent(ASSET_DELETED_EVENT, {
          detail: { id, url, fileId, reason: 'permanent-deletion' },
          bubbles: true
        });
        document.dispatchEvent(deleteEvent);

        // User notification
        toast.error("Asset has been permanently deleted");

        return false;
      }

      // If we get here, the resource is available
      return true;
    } catch (error) {
      // Handle errors gracefully
      console.log(`Error checking video availability: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };

  // Function to render the appropriate icon based on file type and status
  const renderFileIcon = () => {
    if (status === 'loading') {
      return <Icon iconId="faSpinnerLight" className="w-6 h-6 animate-spin" />;
    }

    if (status === 'error' || status === 'deleted') {
      return <Icon iconId="faTriangleExclamationLight" className="w-6 h-6 text-red-500" />;
    }

    if (isVideo) {
      return <Icon iconId="faFileVideoLight" className="w-6 h-6" />;
    } else if (isImage) {
      return <Icon iconId="faFileImageLight" className="w-6 h-6" />;
    } else if (type?.includes('audio')) {
      return <Icon iconId="faFileAudioLight" className="w-6 h-6" />;
    } else {
      return <Icon iconId="faFileLight" className="w-6 h-6" />;
    }
  };

  // Video player controls
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Render the component with appropriate loading/error states
  return (
    <div className={`${cn("relative rounded-lg overflow-hidden bg-gray-100 min-h-[100px]", className)} font-work-sans`} {...props}>
      {/* Loading spinner */}
      {status === 'loading' &&
        <div className="absolute inset-0 flex items-center justify-center font-work-sans">
          {renderFileIcon()}
        </div>
      }

      {/* Deleted asset state */}
      {status === 'deleted' &&
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-100 font-work-sans">
          {renderFileIcon()}
          <p className="text-center text-gray-700 font-medium mb-2 font-work-sans">Asset Deleted</p>
          <p className="text-center text-gray-500 text-sm mb-4 font-work-sans">
            This file has been permanently deleted from storage.
          </p>
        </div>
      }

      {/* Error state with retry option */}
      {status === 'error' && !previewUrl &&
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-100 font-work-sans">
          {renderFileIcon()}
          <p className="text-center text-gray-700 font-medium mb-2 font-work-sans">Failed to load {fileName}</p>
          <p className="text-center text-gray-500 text-sm mb-4 font-work-sans">
            {error?.message || 'The file could not be loaded'}
          </p>
          <div className="flex space-x-2 font-work-sans">
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded flex items-center font-work-sans">

              <Icon iconId="faRotateRightLight" className="mr-1" />
              Retry
            </button>
            <button
              onClick={handleReportMissingAsset}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded font-work-sans">

              Remove Asset
            </button>
          </div>
        </div>
      }

      {/* Video preview */}
      {(status === 'ready' || status === 'loaded') && isVideo && previewUrl &&
        <div className="relative w-full h-full aspect-square overflow-hidden font-work-sans">
          <video
            ref={videoRef}
            src={previewUrl}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleVideoError}
            onLoadedMetadata={handleVideoMetadataLoaded}
            autoPlay
            muted
            playsInline
            loop={false}
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              // Loop after 5 seconds
              if (video.currentTime >= 5) {
                video.currentTime = 0;
                video.play().catch((err) => console.error('Error replaying video:', err));
              }
            }} />


          {/* Play/pause overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 font-work-sans">
            <button
              type="button"
              onClick={togglePlayPause}
              className="bg-white bg-opacity-70 rounded-full p-2 text-[var(--primary-color)] hover:text-[var(--accent-color)] transition-colors font-work-sans">

              {isPlaying ? (
                <Icon iconId="faPauseLight" className="w-5 h-5 text-current" />
              ) : (
                <Icon iconId="faPlayLight" className="w-5 h-5 text-current" />
              )}

            </button>
          </div>
        </div>
      }

      {/* Image preview */}
      {status === 'loaded' && isImage && previewUrl &&
        <div className="relative w-full h-full aspect-square overflow-hidden font-work-sans">
          <img
            src={previewUrl}
            alt={fileName}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              setStatus('error');
              setError(new Error(`Failed to display image: ${fileName}`));
            }} />

        </div>
      }

      {/* Generic file preview (for non-media files) */}
      {(status === 'ready' || status === 'loaded') && !isVideo && !isImage &&
        <div className="flex flex-col items-center justify-center py-6 px-4 font-work-sans">
          {renderFileIcon()}

          <p className="text-sm text-gray-600 text-center break-all font-work-sans">{fileName}</p>
        </div>
      }
    </div>);

}