import React from 'react';
import { Icon } from '@/components/ui/icon/icon';

export interface InstagramActionButtonsProps {}

const InstagramActionButtons: React.FC<InstagramActionButtonsProps> = () => {
  return (
    <div className="p-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 h-12 flex-shrink-0 select-none">
      <div className="flex items-center space-x-4">
        <Icon iconId="faHeartLight" className="h-6 w-6 text-black dark:text-white" />
        <Icon iconId="faCommentLight" className="h-6 w-6 text-black dark:text-white" />
        <Icon iconId="faPaperPlaneLight" className="h-6 w-6 text-black dark:text-white" />
      </div>
      <Icon iconId="faBookmarkLight" className="h-6 w-6 text-black dark:text-white" />
    </div>
  );
};

InstagramActionButtons.displayName = 'InstagramActionButtons';

export { InstagramActionButtons };
