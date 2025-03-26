'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icons';
import { InfluencerFilters } from '@/types/influencer';

// Constants for select options
const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'Facebook', label: 'Facebook' },
];

const TIER_OPTIONS = [
  { value: '', label: 'All Tiers' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Bronze', label: 'Bronze' },
];

const SORT_OPTIONS = [
  { value: 'justifyScore', label: 'Justify Score' },
  { value: 'followers', label: 'Followers' },
  { value: 'engagement', label: 'Engagement Rate' },
];

export interface AdvancedSearchProps {
  initialFilters: InfluencerFilters;
  onSubmit: (filters: InfluencerFilters) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  initialFilters,
  onSubmit,
}) => {
  const [filters, setFilters] = useState<InfluencerFilters>({
    platform: initialFilters.platform || '',
    tier: initialFilters.tier || '',
    minScore: initialFilters.minScore || 0,
    minFollowers: initialFilters.minFollowers || 0,
    minEngagement: initialFilters.minEngagement || 0,
    maxRiskScore: initialFilters.maxRiskScore || 100,
    sortBy: initialFilters.sortBy || 'justifyScore',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(filters);
  };
  
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      handleFilterChange(name, numericValue);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <Input
            type="text"
            name="platform"
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            placeholder="Enter platform name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
          <Input
            type="text"
            name="tier"
            value={filters.tier}
            onChange={(e) => handleFilterChange('tier', e.target.value)}
            placeholder="Enter tier (Gold, Silver, Bronze)"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Justify Score: {filters.minScore}</label>
          <Input
            type="range"
            name="minScore"
            min={0}
            max={100}
            step={1}
            value={filters.minScore}
            onChange={handleNumberInputChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Followers</label>
          <Input
            type="number"
            name="minFollowers"
            min={0}
            value={filters.minFollowers || ''}
            onChange={handleNumberInputChange}
            placeholder="0"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Risk Score: {filters.maxRiskScore}</label>
          <Input
            type="range"
            name="maxRiskScore"
            min={0}
            max={100}
            step={1}
            value={filters.maxRiskScore}
            onChange={handleNumberInputChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Engagement Rate (%)</label>
          <Input
            type="number"
            name="minEngagement"
            min={0}
            max={100}
            step={0.1}
            value={filters.minEngagement || ''}
            onChange={handleNumberInputChange}
            placeholder="0"
          />
        </div>
      </div>
      
      <div className="flex gap-3 mt-4">
        <Button type="submit" className="flex-1">
          <Icon name="faFilter" className="mr-2" />
          Apply Filters
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setFilters({
              platform: '',
              tier: '',
              minScore: 0,
              minFollowers: 0,
              minEngagement: 0,
              maxRiskScore: 100,
              sortBy: 'justifyScore',
            });
          }}
          className="flex-1"
        >
          <Icon name="faXmark" className="mr-2" />
          Clear All
        </Button>
      </div>
    </form>
  );
};

export default AdvancedSearch; 