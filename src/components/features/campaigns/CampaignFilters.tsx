'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/components/ui/icon/icon';

// Define the shape of filters passed to and from this component
export interface CampaignFiltersState {
  search: string;
  objective: string;
  status: string;
  startDate: string;
  endDate: string;
  myCampaigns: boolean;
}

interface CampaignFiltersProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: CampaignFiltersState;
  onApplyFilters: (filters: CampaignFiltersState) => void;
  onResetFilters: () => void;
  // We might need to pass unique dates for dropdowns if they are dynamic
  uniqueDates?: { startDates: string[]; endDates: string[] };
  kpiOptions?: { key: string; title: string }[]; // Pass KPI options for the objective dropdown
  formatDate?: (dateString: string) => string; // Pass formatDate for display
}

export const CampaignFilters: React.FC<CampaignFiltersProps> = ({
  isOpen,
  onOpenChange,
  currentFilters,
  onApplyFilters,
  onResetFilters,
  uniqueDates = { startDates: [], endDates: [] },
  kpiOptions = [],
  formatDate = dateStr => dateStr,
}) => {
  const [internalFilters, setInternalFilters] = useState<CampaignFiltersState>(currentFilters);

  useEffect(() => {
    setInternalFilters(currentFilters);
  }, [currentFilters, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInternalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: keyof CampaignFiltersState, value: string) => {
    setInternalFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: keyof CampaignFiltersState, checked: boolean) => {
    setInternalFilters(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleApply = () => {
    onApplyFilters(internalFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultFilters: CampaignFiltersState = {
      search: '',
      objective: '',
      status: '',
      startDate: '',
      endDate: '',
      myCampaigns: false,
    };
    setInternalFilters(defaultFilters);
    onResetFilters();
    onOpenChange(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-6 overflow-y-auto p-1 pr-6">
        <div>
          <Label htmlFor="search-campaigns">Search by Name</Label>
          <div className="relative mt-1">
            <Icon
              iconId="faMagnifyingGlassLight"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4"
            />
            <Input
              id="search-campaigns"
              name="search"
              type="text"
              placeholder="e.g., Summer Sale..."
              value={internalFilters.search}
              onChange={handleInputChange}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="objective-filter">Primary KPI</Label>
          <Select
            name="objective"
            value={internalFilters.objective}
            onValueChange={value => handleSelectChange('objective', value)}
          >
            <SelectTrigger id="objective-filter" className="mt-1">
              <SelectValue placeholder="Any Primary KPI" />
            </SelectTrigger>
            <SelectContent>
              {kpiOptions.map(kpi => (
                <SelectItem key={kpi.key} value={kpi.key}>
                  {kpi.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="start-date-filter">Start Date</Label>
          <Select
            name="startDate"
            value={internalFilters.startDate}
            onValueChange={value => handleSelectChange('startDate', value)}
          >
            <SelectTrigger id="start-date-filter" className="mt-1">
              <SelectValue placeholder="Any Start Date" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDates.startDates.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="end-date-filter">End Date</Label>
          <Select
            name="endDate"
            value={internalFilters.endDate}
            onValueChange={value => handleSelectChange('endDate', value)}
          >
            <SelectTrigger id="end-date-filter" className="mt-1">
              <SelectValue placeholder="Any End Date" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDates.endDates.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select
            name="status"
            value={internalFilters.status}
            onValueChange={value => handleSelectChange('status', value)}
          >
            <SelectTrigger id="status-filter" className="mt-1">
              <SelectValue placeholder="Any Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="my-campaigns-filter-sheet"
            name="myCampaigns"
            checked={internalFilters.myCampaigns}
            onCheckedChange={checked => handleCheckboxChange('myCampaigns', Boolean(checked))}
          />
          <Label
            htmlFor="my-campaigns-filter-sheet"
            className="text-sm font-medium whitespace-nowrap leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show only my campaigns
          </Label>
        </div>
      </div>

      <div className="mt-auto pt-4 pb-2 border-t">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply} className="bg-accent hover:bg-accent/90 text-white">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
