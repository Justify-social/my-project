import React from 'react';
import { CreativeDataProps } from '@/types/brand-lift';
import MuxPlayer from '@mux/mux-player-react';
import { Icon } from '@/components/ui/icon/icon';
import { TikTokHeader } from './TikTokHeader';
import { TikTokSidebarActions } from './TikTokSidebarActions';
import { TikTokFooterInfo } from './TikTokFooterInfo';
// TODO: Import atomic sub-components once created, e.g.:
// import TikTokHeader from './TikTokHeader'; // Assuming sub-components in the same folder or ./tiktok/
// import TikTokSidebarActions from './TikTokSidebarActions';
// import TikTokFooterInfo from './TikTokFooterInfo';
// import TikTokBottomNav from './TikTokBottomNav';

export interface TikTokScreenContentProps {
  creativeData: CreativeDataProps;
}

const TikTokScreenContent: React.FC<TikTokScreenContentProps> = ({ creativeData }) => {
  // Sound is no longer on CreativeDataProps for MVP, will be static in UI
  const { profile, caption, media } = creativeData;

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
    artistName: profile.username || profile.name, // Or a generic placeholder like "Creator"
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col relative overflow-hidden select-none">
      <TikTokHeader />

      {/* 2. Main Media Area */}
      <div className="flex-grow flex items-center justify-center bg-black">
        {media.type === 'video' && media.muxPlaybackId ? (
          <MuxPlayer
            playbackId={media.muxPlaybackId}
            autoPlay="muted"
            loop
            className="w-full h-full object-cover"
            style={{ aspectRatio: '9/16' }}
            playsInline // Important for mobile browser compatibility
          />
        ) : media.type === 'image' && media.imageUrl ? (
          <img
            src={media.imageUrl}
            alt={media.altText || caption || 'Creative'}
            className="w-full h-full object-cover"
            style={{ aspectRatio: '9/16' }}
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

      {/* 5. Bottom Navigation Bar (Static Mockup) */}
      {/* <TikTokBottomNav /> // TODO: Extract to sub-component */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black border-t border-gray-700/80 flex justify-around items-center text-xs z-20">
        {/* Placeholders for nav items with Icons */}
        <div className="flex flex-col items-center p-1">
          <Icon iconId="faHouseLight" className="h-5 w-5" />
          Home
        </div>
        <div className="flex flex-col items-center p-1 text-gray-400">
          <Icon iconId="faUsersLight" className="h-5 w-5" />
          Friends
        </div>
        <div className="w-11 h-7 bg-white rounded-md flex items-center justify-center">
          <Icon iconId="faPlusLight" className="h-4 w-4 text-black" />
        </div>
        <div className="flex flex-col items-center p-1 text-gray-400">
          <Icon iconId="faEnvelopeLight" className="h-5 w-5" />
          Inbox
        </div>
        <div className="flex flex-col items-center p-1 text-gray-400">
          <Icon iconId="faUserCircleLight" className="h-5 w-5" />
          Profile
        </div>
      </div>

      {/* Tailwind class for marquee-like animation (add to globals.css or here if scoped) */}
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
