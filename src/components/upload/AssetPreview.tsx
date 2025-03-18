'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/icon';

interface AssetPreviewProps {
  url: string;
  fileName: string;
  type: 'image' | 'video' | string;
  className?: string;
}

export function AssetPreview({ url, fileName, type, className = '' }: AssetPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = type === 'video' || (typeof type === 'string' && type.includes('video'));
  const isImage = type === 'image' || (typeof type === 'string' && type.includes('image'));

  useEffect(() => {
    // For videos, set up the auto-play with looping
    if (isVideo && videoRef.current) {
      const video = videoRef.current;
      
      // When video is loaded, play it automatically
      const handleCanPlay = () => {
        setHasLoaded(true);
        if (video.paused) {
          video.play().catch(err => {
            console.error('Error auto-playing video:', err);
          });
        }
      };
      
      // When ended, reset and play again (first 5 seconds only)
      const handleTimeUpdate = () => {
        if (video.currentTime >= 5) {
          video.currentTime = 0;
          video.play().catch(err => {
            console.error('Error replaying video:', err);
          });
        }
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [isVideo, url]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle image loading
  const handleImageLoad = () => {
    setHasLoaded(true);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* Loading state */}
      {!hasLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse flex flex-col items-center">
            <Icon name="info" className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-xs text-gray-500">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Image preview */}
      {isImage && (
        <img 
          src={url} 
          alt={fileName}
          className={`w-full h-full object-contain ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
          onLoad={handleImageLoad}
        />
      )}
      
      {/* Video preview */}
      {isVideo && (
        <div className="relative">
          <video
            ref={videoRef}
            src={url}
            className={`w-full h-full object-contain ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            muted
            playsInline
            loop
          />
          
          {/* Video control overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-20 transition-all"
            onClick={togglePlay}
          >
            {hasLoaded && (
              <div className="p-2 rounded-full bg-white bg-opacity-70">
                {isPlaying ? (
                  <Icon name="minus" className="h-6 w-6 text-gray-800" />
                ) : (
                  <Icon name="plus" className="h-6 w-6 text-gray-800" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8">
          <Icon name="info" className="h-12 w-12 text-gray-400" />
          <span className="ml-2 text-gray-700">{fileName}</span>
        </div>
      )}
    </div>
  );
} 