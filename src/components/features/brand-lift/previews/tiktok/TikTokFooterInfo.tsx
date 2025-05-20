import React from 'react';
import { CreativeProfileData } from '@/types/brand-lift'; // For profile.username, profile.name
import { Icon } from '@/components/ui/icon/icon';

interface TikTokFooterInfoProps {
  profile: CreativeProfileData;
  caption: string | null | undefined;
  sound: {
    songName: string;
    artistName: string;
  };
}

const TikTokFooterInfo: React.FC<TikTokFooterInfoProps> = ({ profile, caption, sound }) => {
  return (
    <div className="absolute bottom-12 left-0 right-0 p-3 z-10 bg-gradient-to-t from-black/60 to-transparent">
      <p className="font-semibold text-sm">@{profile.username || profile.name}</p>
      <p className="text-xs mt-1 whitespace-pre-wrap break-words max-h-16 overflow-y-auto no-scrollbar">
        {caption}
        {/* TODO: Parse and render #hashtags with different style */}
      </p>
      <div className="flex items-center space-x-2 text-xs mt-2 font-medium">
        <Icon iconId="faPlayLight" className="h-3 w-3 flex-shrink-0" />{' '}
        {/* Or specific music note icon */}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <span className="inline-block animate-marquee-short">
            {sound.songName} - {sound.artistName}
          </span>
        </div>
      </div>
    </div>
  );
};

TikTokFooterInfo.displayName = 'TikTokFooterInfo';

export { TikTokFooterInfo };
