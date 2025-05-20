import React from 'react';
import { CreativeProfileData } from '@/types/brand-lift';

export interface InstagramPostInfoProps {
  profile: CreativeProfileData;
  caption: string | null | undefined;
  engagement: {
    likes: string;
    commentsCount: string;
  };
  // Add other props like timestamp if it becomes dynamic
}

const InstagramPostInfo: React.FC<InstagramPostInfoProps> = ({ profile, caption, engagement }) => {
  return (
    <div className="p-3 pt-1 text-sm flex-shrink-0 select-none">
      {engagement.likes && (
        <p className="font-semibold text-xs mb-1 text-black dark:text-white">{engagement.likes}</p>
      )}
      <p className="mt-0 text-black dark:text-white">
        <span className="font-semibold">{profile.username || profile.name}</span>{' '}
        <span className="whitespace-pre-wrap break-words">{caption}</span>
      </p>
      {engagement.commentsCount && (
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs hover:underline cursor-pointer">
          View all {engagement.commentsCount} comments
        </p>
      )}
      <p className="text-gray-400 dark:text-gray-500 mt-1 text-[10px] uppercase">1 DAY AGO</p>{' '}
      {/* Static timestamp for mockup */}
    </div>
  );
};

InstagramPostInfo.displayName = 'InstagramPostInfo';

export { InstagramPostInfo };
