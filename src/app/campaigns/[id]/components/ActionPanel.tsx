import React from 'react';
import { useRouter } from 'next/router';
import Icon from '@/components/Icon';

const ActionPanel = ({ campaignId }) => {
  const router = useRouter();

  const onDelete = () => {
    // Implement the delete logic here
  };

  return (
    <div className="flex space-x-4 mt-6">
      <button 
        onClick={() => router.push(`/campaigns/wizard/step-1?duplicate=${campaignId}`)}
        className="group flex items-center px-4 py-2 text-[var(--accent-color)] border border-[var(--accent-color)] rounded-md hover:bg-[var(--accent-color)] hover:text-white transition-colors"
      >
        <Icon name="faCopy" className="w-4 h-4 mr-2" iconType="button" />
        <span>Duplicate</span>
      </button>
      
      <button 
        onClick={onDelete}
        className="group flex items-center px-4 py-2 text-red-500 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
      >
        <Icon name="faTrashAlt" className="w-4 h-4 mr-2" iconType="button" />
        <span>Delete</span>
      </button>
    </div>
  );
};

export default ActionPanel; 