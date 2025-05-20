import React from 'react';
import { CreativeProfileData } from '@/types/brand-lift';
import { Icon } from '@/components/ui/icon/icon';

export interface InstagramPostHeaderProps {
  profile: CreativeProfileData;
  // Any other props needed, e.g., location, timestamp if it were part of header
}

const InstagramPostHeader: React.FC<InstagramPostHeaderProps> = ({ profile }) => {
  return (
    <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 h-14 flex-shrink-0 select-none">
      <div className="flex items-center space-x-3">
        {profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt={profile.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <Icon iconId="faUserCircleLight" className="h-8 w-8 text-gray-700 dark:text-gray-300" />
        )}
        <span className="font-semibold text-sm text-black dark:text-white">
          {profile.username || profile.name}
        </span>
      </div>
      <Icon iconId="faEllipsisLight" className="h-5 w-5 text-gray-700 dark:text-gray-300" />
    </div>
  );
};

InstagramPostHeader.displayName = 'InstagramPostHeader';

export { InstagramPostHeader };
