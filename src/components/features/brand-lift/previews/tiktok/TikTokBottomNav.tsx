import React from 'react';
import { Icon } from '@/components/ui/icon/icon';

// This component is currently static as per the mockup design.
// It could take props in the future if active states or badges are needed.
export interface TikTokBottomNavProps {}

const TikTokBottomNav: React.FC<TikTokBottomNavProps> = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black border-t border-gray-700/80 flex justify-around items-center text-xs z-20 select-none">
      <div className="flex flex-col items-center p-1 text-white">
        <Icon iconId="faHouseLight" className="h-5 w-5 mb-0.5" />
        <span className="text-[10px]">Home</span>
      </div>
      <div className="flex flex-col items-center p-1 text-gray-400">
        <Icon iconId="faUsersLight" className="h-5 w-5 mb-0.5" />
        <span className="text-[10px]">Friends</span>
      </div>
      <div className="w-11 h-7 bg-white rounded-md flex items-center justify-center">
        <Icon iconId="faPlusLight" className="h-4 w-4 text-black" />
      </div>
      <div className="flex flex-col items-center p-1 text-gray-400">
        {/* For Inbox, often there's a badge. Placeholder for now. */}
        <div className="relative">
          <Icon iconId="faEnvelopeLight" className="h-5 w-5 mb-0.5" />
          {/* <span className="absolute -top-1 -right-1.5 px-1 text-[8px] bg-red-500 text-white rounded-full">12</span> */}
        </div>
        <span className="text-[10px]">Inbox</span>
      </div>
      <div className="flex flex-col items-center p-1 text-gray-400">
        <Icon iconId="faUserCircleLight" className="h-5 w-5 mb-0.5" />
        <span className="text-[10px]">Profile</span>
      </div>
    </div>
  );
};

TikTokBottomNav.displayName = 'TikTokBottomNav';

export { TikTokBottomNav };
