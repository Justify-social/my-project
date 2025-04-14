////////////////////////////////////
// src/components/Influencers/FilterPanel.tsx
////////////////////////////////////
'use client';

import React from 'react';
// Import Shadcn Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  filters: {
    platform: string;
    status: string;
    startDate: string;
    endDate: string;
  };
  setFilters: (filters: FilterPanelProps['filters']) => void;
  uniqueDates: {
    startDates: string[];
    endDates: string[];
  };
  resetFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  uniqueDates,
  resetFilters,
}) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 font-body">
      {/* Platform Filter */}
      <Select
        value={filters.platform}
        onValueChange={value => setFilters({ ...filters, platform: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Platform</SelectItem>
          <SelectItem value="INSTAGRAM">Instagram</SelectItem>
          <SelectItem value="YOUTUBE">YouTube</SelectItem>
          <SelectItem value="TIKTOK">TikTok</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={value => setFilters({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Status</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* Start Date Filter */}
      <Select
        value={filters.startDate}
        onValueChange={value => setFilters({ ...filters, startDate: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Start Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Start Date</SelectItem>
          {uniqueDates.startDates.map(date => (
            <SelectItem key={date} value={date}>
              {formatDate(date)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* End Date Filter */}
      <Select
        value={filters.endDate}
        onValueChange={value => setFilters({ ...filters, endDate: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="End Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">End Date</SelectItem>
          {uniqueDates.endDates.map(date => (
            <SelectItem key={date} value={date}>
              {formatDate(date)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="secondary" onClick={resetFilters} className="text-sm font-medium">
        Reset Filters
      </Button>
    </div>
  );
};

export default FilterPanel;
