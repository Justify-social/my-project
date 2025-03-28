////////////////////////////////////
// src/components/Influencers/FilterPanel.tsx
////////////////////////////////////
"use client";

import React from "react";

import HTMLSelectElement from '../../ui/forms/Select';
interface FilterPanelProps {
  filters: {
    platform: string;
    tier: string;
    sortBy?: string;
  };
  onFilterChange: (newFilters: {platform: string;tier: string;sortBy?: string;}) => void;
  showSorting?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, showSorting }) => {
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, platform: e.target.value });
  };
  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, tier: e.target.value });
  };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };
  const handleReset = () => {
    onFilterChange({ platform: "", tier: "", sortBy: "" });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end font-work-sans">
      <div className="flex flex-col font-work-sans">
        <label htmlFor="platformFilter" className="text-sm font-semibold mb-1 font-work-sans">
          Platform
        </label>
        <select
          id="platformFilter"
          value={filters.platform}
          onChange={handlePlatformChange}
          className="border p-1 rounded font-work-sans">

          <option value="">All</option>
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="TikTok">TikTok</option>
        </select>
      </div>
      <div className="flex flex-col font-work-sans">
        <label htmlFor="tierFilter" className="text-sm font-semibold mb-1 font-work-sans">
          Tier
        </label>
        <select
          id="tierFilter"
          value={filters.tier}
          onChange={handleTierChange}
          className="border p-1 rounded font-work-sans">

          <option value="">All</option>
          <option value="Platinum">Platinum</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>
      {showSorting &&
      <div className="flex flex-col font-work-sans">
          <label htmlFor="sortFilter" className="text-sm font-semibold mb-1 font-work-sans">
            Sort By
          </label>
          <select
          id="sortFilter"
          value={filters.sortBy || ""}
          onChange={handleSortChange}
          className="border p-1 rounded font-work-sans">

            <option value="">No Sorting</option>
            <option value="score-desc">Score (High to Low)</option>
            <option value="score-asc">Score (Low to High)</option>
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
          </select>
        </div>
      }
      <button
        onClick={handleReset}
        className="px-3 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300 font-work-sans">

        Reset Filters
      </button>
    </div>);

};

export default FilterPanel;