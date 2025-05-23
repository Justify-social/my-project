import React, { useRef, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { CreativeDataProps } from '@/types/brand-lift';
import { Icon } from '@/components/ui/icon/icon';
import { InstagramPostHeader } from './InstagramPostHeader';
import { InstagramActionButtons } from './InstagramActionButtons';
import { InstagramPostInfo } from './InstagramPostInfo';
import Image from 'next/image';

export interface InstagramScreenContentProps {
  creativeData: CreativeDataProps;
  // videoReady?: boolean; // Temporarily remove
}

const InstagramScreenContent: React.FC<InstagramScreenContentProps> = ({
  creativeData,
  // videoReady = false // Temporarily remove
}) => {
  const { profile, caption, media } = creativeData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  // Try to autoplay the video when videoReady changes
  useEffect(() => {
    // if (videoReady && playerRef.current) { // Temporarily remove condition
    if (playerRef.current) {
      // Simplified condition
      try {
        const timer = setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.play().catch((e: Error) => {
              console.warn('Instagram Mux player autoplay failed:', e.message);
            });
          }
        }, 500);

        return () => clearTimeout(timer);
      } catch (e: unknown) {
        console.warn('Error with Instagram Mux player:', e);
      }
    }
    // }, [videoReady]); // Temporarily remove dependency
  }, []); // Simplified dependency array

  const mockEngagement = {
    likes: '157.5K',
    commentsCount: '3.2K',
    timeAgo: '1 DAY AGO',
  };

  return (
    <div className="w-full h-full bg-white dark:bg-black text-black dark:text-white flex flex-col relative overflow-y-auto no-scrollbar select-none">
      <InstagramPostHeader profile={profile} />

      {/* Main Media Area */}
      <div className="flex-grow bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {media.type === 'video' && media.muxPlaybackId && media.muxProcessingStatus === 'READY' ? (
          <MuxPlayer
            ref={playerRef}
            playbackId={media.muxPlaybackId || ''}
            autoPlay="muted"
            loop
            muted
            preload="auto"
            className="w-full h-full object-contain" // object-contain common for IG posts/reels
            playsInline
            streamType="on-demand"
            defaultHiddenCaptions
            thumbnailTime={1}
            primaryColor="#00BFFF"
            secondaryColor="#FFFFFF"
            metadata={{
              video_title: media.name || 'Instagram Post',
              player_name: 'Instagram Preview Player',
              player_init_time: Date.now(),
            }}
          />
        ) : media.type === 'image' && media.imageUrl ? (
          <Image
            src={media.imageUrl}
            alt={media.altText || caption || 'Creative'}
            fill
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            <Icon iconId="faImageSlashLight" className="h-12 w-12 mb-2" />
            <p>Creative Media Unavailable</p>
          </div>
        )}
      </div>

      <InstagramActionButtons />
      <InstagramPostInfo profile={profile} caption={caption} engagement={mockEngagement} />
    </div>
  );
};

InstagramScreenContent.displayName = 'InstagramScreenContent';

export { InstagramScreenContent };
