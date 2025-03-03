"use client";

import React from 'react';
import { Platform } from '@prisma/client';
import { BrandLiftService } from '@/services/brandLiftService';

interface PlatformSwitcherProps {
  platforms: Platform[];
  activePlatform: Platform;
  campaignId: string;
  onPlatformChange: (platform: Platform) => void;
}

export default function PlatformSwitcher({
  platforms,
  activePlatform,
  campaignId,
  onPlatformChange
}: PlatformSwitcherProps) {
  const [loading, setLoading] = React.useState(false);

  const handlePlatformChange = async (platform: Platform) => {
    if (platform === activePlatform) return;
    
    try {
      setLoading(true);
      
      // Get the service instance
      const brandLiftService = BrandLiftService.getInstance();
      
      // Call the API to change the platform
      const updatedData = await brandLiftService.changeActivePlatform(campaignId, platform);
      
      // Update the UI
      onPlatformChange(platform);
    } catch (error) {
      console.error('Error changing platform:', error);
      // Fallback to just updating the UI without API call
      onPlatformChange(platform);
    } finally {
      setLoading(false);
    }
  };

  // Platform-specific icons and colors
  const platformConfig = {
    [Platform.Instagram]: {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white'
    },
    [Platform.TikTok]: {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      color: 'bg-black',
      textColor: 'text-white'
    },
    [Platform.YouTube]: {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
      color: 'bg-red-600',
      textColor: 'text-white'
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Platform Preview</h3>
      <div className="flex space-x-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => handlePlatformChange(platform)}
            disabled={loading || platform === activePlatform}
            className={`flex items-center justify-center px-3 py-2 rounded-md transition-all ${
              platform === activePlatform
                ? `${platformConfig[platform].color} ${platformConfig[platform].textColor} shadow-md`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{platformConfig[platform].icon}</span>
            <span>{platform}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 