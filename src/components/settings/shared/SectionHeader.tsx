'use client';

import React from 'react';
import { Icon } from '@/components/ui/icons';

interface SectionHeaderProps {
  title: string;
  description?: string;
  iconName: string;
}

/**
 * Section header with title, description, and optional icon
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  iconName,
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="mr-3 text-[#00BFFF]">
        <Icon name={iconName} size="lg" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#333333]">{title}</h2>
        {description && (
          <p className="text-sm text-[#4A5568] mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default SectionHeader; 