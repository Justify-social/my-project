"use client";

import React, { memo } from 'react';
import { Icon } from '@/components/ui/icons';

interface SectionHeaderProps {
  title: string;
  description: string;
  iconName?: string;
}

/**
 * SectionHeader component for settings sections
 * Displays a title, description, and icon
 */
const SectionHeader: React.FC<SectionHeaderProps> = memo(({ 
  title, 
  description, 
  iconName = 'circleInfo'
}) => {
  return (
    <div className="flex items-start mb-6">
      <div className="mr-4">
        <Icon 
          name={iconName} 
          size="lg"
          className="text-[#00BFFF]"
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#333333]">{title}</h2>
        <p className="mt-1 text-sm text-[#4A5568]">{description}</p>
      </div>
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';
export default SectionHeader; 