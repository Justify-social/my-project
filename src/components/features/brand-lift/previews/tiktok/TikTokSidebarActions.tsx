import React from 'react';
import { CreativeProfileData } from '@/types/brand-lift'; // Assuming sound art might use profile pic as fallback
import { Icon } from '@/components/ui/icon/icon';

interface TikTokSidebarActionsProps {
  profile: CreativeProfileData;
  engagement: {
    likes: string;
    comments: string;
    bookmarks: string;
    shares: string;
  };
  // soundArtUrl?: string | null; // If we pass a specific URL for the spinning record
}

const TikTokSidebarActions: React.FC<TikTokSidebarActionsProps> = ({ profile, engagement }) => {
  return (
    <div className="absolute right-2 bottom-[60px] flex flex-col items-center space-y-4 z-10">
      {/* Profile Image with Plus Icon */}
      <div className="relative">
        {profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt={profile.name}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <Icon iconId="faUserCircleLight" className="w-10 h-10 text-white" />
        )}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-black">
          <Icon iconId="faPlusLight" className="h-2.5 w-2.5 text-white" />
        </div>
      </div>

      {/* Like */}
      <div className="flex flex-col items-center">
        <Icon iconId="faHeartLight" className="h-7 w-7 text-white" />
        <span className="text-xs font-semibold mt-1">{engagement.likes}</span>
      </div>
      {/* Comment */}
      <div className="flex flex-col items-center">
        <Icon iconId="faCommentDotsLight" className="h-7 w-7 text-white" />
        <span className="text-xs font-semibold mt-1">{engagement.comments}</span>
      </div>
      {/* Bookmark */}
      <div className="flex flex-col items-center">
        <Icon iconId="faBookmarkLight" className="h-7 w-7 text-white" />
        <span className="text-xs font-semibold mt-1">{engagement.bookmarks}</span>
      </div>
      {/* Share */}
      <div className="flex flex-col items-center">
        <Icon iconId="faShareLight" className="h-7 w-7 text-white" />
        <span className="text-xs font-semibold mt-1">{engagement.shares}</span>
      </div>
      {/* Sound/Music (Spinning record) - using profile pic as placeholder for sound art */}
      <div className="mt-2">
        <img
          src={profile.profilePictureUrl || '/logo.png'} // Fallback to app logo if no profile pic for sound art
          alt="sound art"
          className="w-10 h-10 rounded-full border-[3px] border-gray-700 bg-gray-800 animate-spin-slow object-cover"
        />
      </div>
    </div>
  );
};

TikTokSidebarActions.displayName = 'TikTokSidebarActions';

export { TikTokSidebarActions };
