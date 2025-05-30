import React, { useRef, useEffect, useState } from 'react';
import { CreativeDataProps } from '@/types/brand-lift';
import MuxPlayer from '@mux/mux-player-react';
import { Icon } from '@/components/ui/icon/icon';
import { TikTokHeader } from './TikTokHeader';
import { TikTokSidebarActions } from './TikTokSidebarActions';
import { TikTokFooterInfo } from './TikTokFooterInfo';
import { TikTokBottomNav } from './TikTokBottomNav';
import Image from 'next/image';
// TODO: Import atomic sub-components once created, e.g.:
// import TikTokHeader from './TikTokHeader'; // Assuming sub-components in the same folder or ./tiktok/
// import TikTokSidebarActions from './TikTokSidebarActions';
// import TikTokFooterInfo from './TikTokFooterInfo';
// import TikTokBottomNav from './TikTokBottomNav';

export interface TikTokScreenContentProps {
  creativeData: CreativeDataProps;
  videoReady?: boolean;
}

// Helper function to extract Mux playback ID from URL
const extractMuxPlaybackId = (url: string): string | null => {
  if (!url || !url.includes('stream.mux.com/')) return null;

  try {
    const urlParts = url.split('stream.mux.com/');
    if (urlParts.length === 2) {
      return urlParts[1].replace('.m3u8', '');
    }
  } catch (e) {
    console.error('Error extracting Mux playback ID from URL:', e);
  }
  return null;
};

const TikTokScreenContent: React.FC<TikTokScreenContentProps> = ({
  creativeData,
  videoReady = false,
}) => {
  const { profile, caption, media } = creativeData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [playerState, setPlayerState] = useState<{
    loaded: boolean;
    playing: boolean;
    error: string | null;
    extractedPlaybackId: string | null;
  }>({
    loaded: false,
    playing: false,
    error: null,
    extractedPlaybackId: null,
  });

  // Attempt to extract playback ID if it's not in the media props but URL might contain it
  useEffect(() => {
    if (media.type === 'video' && !media.muxPlaybackId && media.url) {
      const extractedId = extractMuxPlaybackId(media.url);
      if (extractedId) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[TikTok Component] Extracted Mux playback ID from URL:', extractedId);
        }
        setPlayerState(prev => ({ ...prev, extractedPlaybackId: extractedId }));
      }
    }
  }, [media]);

  // Log detailed info at component render time (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[TikTok Component] Rendered with media:', {
        type: media.type,
        muxPlaybackId: media.muxPlaybackId,
        muxProcessingStatus: media.muxProcessingStatus,
        imageUrl: media.imageUrl,
        dimensions: media.dimensions,
        url: media.url,
      });
    }
  }, [media]);

  // Attempt to play the video when videoReady changes to true
  useEffect(() => {
    if (videoReady && playerRef.current) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[TikTok Component] Video ready, attempting to play...');
        }
        // Use setTimeout to ensure the component is fully rendered
        const timer = setTimeout(() => {
          if (playerRef.current) {
            if (process.env.NODE_ENV === 'development') {
              console.debug('[TikTok Component] Playing video...');
            }
            playerRef.current
              .play()
              .then(() => {
                if (process.env.NODE_ENV === 'development') {
                  console.debug('[TikTok Component] Video playback started successfully');
                }
                setPlayerState(prev => ({ ...prev, playing: true }));
              })
              .catch((error: Error) => {
                console.warn('[TikTok Component] Mux player autoplay failed:', error);
                setPlayerState(prev => ({ ...prev, error: error.message }));
              });
          }
        }, 500);

        return () => clearTimeout(timer);
      } catch (error: unknown) {
        console.warn('[TikTok Component] Error with Mux player:', error);
        setPlayerState(prev => ({ ...prev, error: String(error) }));
      }
    }
  }, [videoReady]);

  // Placeholder for engagement counts - these would be static for the mockup
  const mockEngagement = {
    likes: '250.5K',
    comments: '100K',
    bookmarks: '89K',
    shares: '132.5K',
  };

  // Static sound info for MVP
  const staticSound = {
    songName: 'Original Audio',
    artistName: profile.username || profile.name || 'Juno',
  };

  // Determine playback ID - either from media props or extracted from URL
  const playbackId = media.muxPlaybackId || playerState.extractedPlaybackId;

  const showMuxPlayer =
    media.type === 'video' && (playbackId || (media.url && media.url.includes('stream.mux.com/')));

  // Handle loading event from MuxPlayer
  const handleMuxPlayerLoadedData = () => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[TikTok Component] Mux player loaded data');
    }
    setPlayerState(prev => ({ ...prev, loaded: true }));
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col relative overflow-hidden select-none">
      <TikTokHeader />

      {/* Main Media Area */}
      <div className="flex-grow flex items-center justify-center bg-black relative">
        {showMuxPlayer ? (
          <MuxPlayer
            ref={playerRef}
            playbackId={playbackId || ''}
            src={!playbackId && media.url ? media.url : undefined}
            autoPlay="muted"
            loop
            muted
            preload="auto"
            className="w-full h-full object-cover"
            style={{ aspectRatio: '9/16' }}
            playsInline
            streamType="on-demand"
            defaultHiddenCaptions
            thumbnailTime={1}
            primaryColor="#00BFFF"
            secondaryColor="#FFFFFF"
            title={media.name || caption || 'TikTok Video'}
            metadata={{
              video_title: media.name || 'TikTok Video',
              video_id: media.muxAssetId || '',
              player_name: 'TikTok Preview Player',
              player_init_time: Date.now(),
            }}
            onLoadedData={handleMuxPlayerLoadedData}
            onError={e => {
              console.error('[TikTok Component] Mux player error:', e);
              setPlayerState(prev => ({ ...prev, error: 'Player error' }));
            }}
            onPlaying={() => {
              if (process.env.NODE_ENV === 'development') {
                console.debug('[TikTok Component] Mux player playing');
              }
              setPlayerState(prev => ({ ...prev, playing: true }));
            }}
          />
        ) : media.type === 'image' && media.imageUrl ? (
          <Image
            src={media.imageUrl}
            alt={media.altText || caption || 'Creative'}
            fill
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Icon iconId="faImageSlashLight" className="h-12 w-12 mb-2" />
            <p>Creative Media Unavailable</p>
          </div>
        )}
      </div>

      <TikTokSidebarActions profile={profile} engagement={mockEngagement} />
      <TikTokFooterInfo profile={profile} caption={caption} sound={staticSound} />

      {/* Bottom Navigation Bar (Static Mockup) */}
      <TikTokBottomNav />

      {/* TikTok animation styles */}
      <style jsx>{`
        .animate-marquee-short {
          animation: marquee-short 10s linear infinite;
        }
        @keyframes marquee-short {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

TikTokScreenContent.displayName = 'TikTokScreenContent';

export { TikTokScreenContent };
