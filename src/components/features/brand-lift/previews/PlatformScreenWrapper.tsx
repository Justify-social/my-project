import React, { useState, useEffect } from 'react';
import { CreativeDataProps } from '@/types/brand-lift';
import { TikTokScreenContent } from './tiktok/TikTokScreenContent';
import { InstagramScreenContent } from './instagram/InstagramScreenContent';
import { Icon } from '@/components/ui/icon/icon'; // For status bar icons
import { cn } from '@/lib/utils'; // Import cn for conditional classes

export interface PlatformScreenWrapperProps {
  platform: 'tiktok' | 'instagram';
  creativeData: CreativeDataProps | null; // Allow null for loading/error states
}

const PlatformScreenWrapper: React.FC<PlatformScreenWrapperProps> = ({
  platform,
  creativeData,
}) => {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // Reset video ready state when platform or creative data changes
    setVideoReady(false);

    // Check if we have valid media for autoplay
    if (creativeData?.media?.muxPlaybackId && creativeData.media.muxProcessingStatus === 'READY') {
      // Set a small delay to ensure DOM is ready before autoplay
      const timer = setTimeout(() => {
        setVideoReady(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [platform, creativeData]);

  const renderDeviceChrome = () => (
    <div className="absolute top-0 left-0 right-0 px-2.5 pt-1 h-7 flex items-center justify-between text-xs text-white z-30 pointer-events-none bg-black/10 select-none">
      <span className="font-semibold ml-1">9:41</span>
      <div className="flex items-center space-x-1">
        <Icon iconId="faSignalSolid" className="h-3 w-3 opacity-90" />
        <span className="font-medium text-[11px] opacity-90">LTE</span>
        <Icon iconId="faBatteryFullSolid" className="h-3.5 w-3.5 opacity-90" />
      </div>
    </div>
  );

  if (!creativeData || !creativeData.media) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        {renderDeviceChrome()}
        <div className="pt-7 h-full text-white text-sm flex flex-col items-center justify-center">
          <Icon iconId="faImageSlashLight" className="h-12 w-12 text-gray-500 mb-3" />
          <p className="text-gray-400">Creative media loading or unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {renderDeviceChrome()}

      {/* Platform Specific UI with integrated video player */}
      <div className="h-full relative pt-7">
        {platform === 'tiktok' && (
          <TikTokScreenContent creativeData={creativeData} videoReady={videoReady} />
        )}
        {platform === 'instagram' && <InstagramScreenContent creativeData={creativeData} />}
        {platform !== 'tiktok' && platform !== 'instagram' && (
          <div className="h-full text-white text-sm flex flex-col items-center justify-center">
            <Icon iconId="faFilmSlashLight" className="h-12 w-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-center px-4">
              Video preview unavailable for this platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

PlatformScreenWrapper.displayName = 'PlatformScreenWrapper';

export { PlatformScreenWrapper };
