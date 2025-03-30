'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/atoms/icons'
import { AssetPreviewProps } from '../types';

/**
 * AssetPreview component displays media assets (images, videos) with appropriate controls
 */
export function AssetPreview({
  url,
  fileName,
  type,
  showTypeLabel = false,
  className,
  ...props
}: AssetPreviewProps) {
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
        "relative rounded-lg overflow-hidden bg-gray-100",
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
          className="relative w-full h-full" 
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
                className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 z-10 absolute group"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <Icon 
                  name={isPlaying ? "faPause" : "faPlay"} 
                  className="h-6 w-6 text-white" 
                  iconType="button" 
                  solid={true} 
                />
              </button>
            </div>
          )}
          
          {/* Video label (optional) */}
          {showTypeLabel && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
              <div className="flex items-center">
                <Icon 
                  name="faVideo" 
                  className="h-3 w-3 mr-1" 
                  iconType="static" 
                  solid={false} 
                /> 
                Video
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Image label (optional) */}
      {isImage && showTypeLabel && (
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs font-medium">
          <div className="flex items-center">
            <Icon 
              name="faImage" 
              className="h-3 w-3 mr-1" 
              iconType="static" 
              solid={false} 
            /> 
            Image
          </div>
        </div>
      )}
      
      {/* Fallback for unsupported file types */}
      {!isImage && !isVideo && (
        <div className="flex items-center justify-center p-8">
          <Icon 
            name="faInfo" 
            className="h-12 w-12 text-gray-400" 
            iconType="static" 
            solid={false} 
          />
        </div>
      )}
    </div>
  );
}

export default AssetPreview; 