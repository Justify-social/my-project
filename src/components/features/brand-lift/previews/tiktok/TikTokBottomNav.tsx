import React from 'react';
import { Icon } from '@/components/ui/icon/icon';

// This component is currently static as per the mockup design.
// It could take props in the future if active states or badges are needed.
export interface TikTokBottomNavProps {}

export const TikTokBottomNav: React.FC<TikTokBottomNavProps> = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black border-t border-gray-700/80 flex justify-around items-center text-xs z-20">
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
  );
};

TikTokBottomNav.displayName = 'TikTokBottomNav';
