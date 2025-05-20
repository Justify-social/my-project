import React from 'react';
import { CreativeDataProps } from '@/types/brand-lift';
import MuxPlayer from '@mux/mux-player-react';
import { Icon } from '@/components/ui/icon/icon';
import { InstagramPostHeader } from './InstagramPostHeader';
import { InstagramActionButtons } from './InstagramActionButtons';
import { InstagramPostInfo } from './InstagramPostInfo';
// TODO: Import atomic sub-components once created, e.g.:
// import InstagramPostHeader from './InstagramPostHeader';
// import InstagramActionButtons from './InstagramActionButtons';
// import InstagramPostInfo from './InstagramPostInfo';

export interface InstagramScreenContentProps {
  creativeData: CreativeDataProps;
}

const InstagramScreenContent: React.FC<InstagramScreenContentProps> = ({ creativeData }) => {
  const { profile, caption, media } = creativeData;

  const mockEngagement = {
    likes: '1,234 likes',
    commentsCount: '15', // Just the number for "View all X comments"
  };

  return (
    <div className="w-full h-full bg-white dark:bg-black text-black dark:text-white flex flex-col relative overflow-y-auto no-scrollbar select-none">
      <InstagramPostHeader profile={profile} />

      {/* 2. Main Media Area */}
      <div className="flex-grow bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {media.type === 'video' && media.muxPlaybackId ? (
          <MuxPlayer
            playbackId={media.muxPlaybackId}
            autoPlay="muted"
            loop
            className="w-full h-full object-contain" // object-contain common for IG posts/reels
            playsInline
          />
        ) : media.type === 'image' && media.imageUrl ? (
          <img
            src={media.imageUrl}
            alt={media.altText || caption || 'Creative'}
            className="w-full h-full object-contain"
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

      {/* 4. Info Section */}
      <div className="p-3 pt-1 text-sm flex-shrink-0">
        {mockEngagement.likes && (
          <p className="font-semibold text-xs mb-1">{mockEngagement.likes}</p>
        )}
        <p className="mt-0">
          <span className="font-semibold">{profile.username || profile.name}</span>{' '}
          <span className="whitespace-pre-wrap break-words">{caption}</span>
        </p>
        {mockEngagement.commentsCount && (
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs hover:underline cursor-pointer">
            View all {mockEngagement.commentsCount} comments
          </p>
        )}
        <p className="text-gray-400 dark:text-gray-500 mt-1 text-[10px] uppercase">1 DAY AGO</p>{' '}
        {/* Static timestamp for mockup */}
      </div>
    </div>
  );
};

InstagramScreenContent.displayName = 'InstagramScreenContent';

export { InstagramScreenContent };
