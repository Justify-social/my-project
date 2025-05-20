import React from 'react';
import { Icon } from '@/components/ui/icon/icon';

export interface TikTokHeaderProps {
  // Props if needed, e.g., for LIVE status or search functionality if made dynamic
}

const TikTokHeader: React.FC<TikTokHeaderProps> = () => {
  return (
    <div className="absolute top-0 left-0 right-0 p-3 h-12 flex justify-between items-center z-20 bg-gradient-to-b from-black/30 to-transparent select-none">
      <div className="flex items-center space-x-3">
        {/* Placeholder for LIVE if applicable */}
        {/* <span className="px-1.5 py-0.5 text-xs bg-red-500 rounded-sm font-semibold">LIVE</span> */}
        <span className="text-gray-300 hover:text-white cursor-pointer text-[15px] font-medium">
          Following
        </span>
        <span className="text-white font-bold text-[15px] relative">
          For You
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full"></span>
        </span>
      </div>
      <Icon iconId="faSearchLight" className="h-5 w-5 text-white" />
    </div>
  );
};

TikTokHeader.displayName = 'TikTokHeader';

export { TikTokHeader };
