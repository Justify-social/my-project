import React from 'react';
import { CreativeDataProps } from '@/types/brand-lift';
// Import TikTokScreenContent and InstagramScreenContent once created
// import TikTokScreenContent from './tiktok/TikTokScreenContent';
// import InstagramScreenContent from './instagram/InstagramScreenContent';
import { Icon } from '@/components/ui/icon/icon'; // For status bar icons

export interface PlatformScreenWrapperProps {
  platform: 'tiktok' | 'instagram';
  creativeData: CreativeDataProps | null; // Allow null for loading/error states
}

const PlatformScreenWrapper: React.FC<PlatformScreenWrapperProps> = ({
  platform,
  creativeData,
}) => {
  const renderDeviceChrome = () => (
    <div className="absolute top-0 left-0 right-0 px-2.5 pt-1 h-7 flex items-center justify-between text-xs text-white z-10 pointer-events-none bg-black/10 select-none">
      <span className="font-semibold ml-1">9:41</span>
      <div className="flex items-center space-x-1">
        <Icon iconId="faSignalSolid" className="h-3 w-3 opacity-90" />
        <span className="font-medium text-[11px] opacity-90">LTE</span>
        <Icon iconId="faBatteryFullSolid" className="h-3.5 w-3.5 opacity-90" />
      </div>
    </div>
  );

  if (!creativeData) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        {renderDeviceChrome()}
        <div className="pt-7 h-full text-white text-sm flex flex-col items-center justify-center">
          <Icon iconId="faImageSlashLight" className="h-12 w-12 text-gray-500 mb-3" />
          <p className="text-gray-400">Creative preview loading or unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {renderDeviceChrome()}
      <div className="pt-7 h-full">
        {' '}
        {/* Padding for the status bar */}
        {platform === 'tiktok' && (
          // <TikTokScreenContent creativeData={creativeData} />
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-2">
            <p className="text-sm font-semibold">TikTok Preview Placeholder</p>
            <p className="text-xs mt-1">Caption: {creativeData.caption?.substring(0, 50)}...</p>
            {creativeData.media.type === 'video' && creativeData.media.muxPlaybackId && (
              <p className="text-xs mt-1">(Mux Video ID: {creativeData.media.muxPlaybackId})</p>
            )}
            {creativeData.media.type === 'image' && creativeData.media.imageUrl && (
              <img
                src={creativeData.media.imageUrl}
                alt={creativeData.media.altText || 'Creative Preview'}
                className="mt-2 w-32 h-48 object-contain border border-gray-600"
              />
            )}
          </div>
        )}
        {platform === 'instagram' && (
          // <InstagramScreenContent creativeData={creativeData} />
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-2">
            <p className="text-sm font-semibold">Instagram Preview Placeholder</p>
            <p className="text-xs mt-1">Caption: {creativeData.caption?.substring(0, 50)}...</p>
            {creativeData.media.type === 'video' && creativeData.media.muxPlaybackId && (
              <p className="text-xs mt-1">(Mux Video ID: {creativeData.media.muxPlaybackId})</p>
            )}
            {creativeData.media.type === 'image' && creativeData.media.imageUrl && (
              <img
                src={creativeData.media.imageUrl}
                alt={creativeData.media.altText || 'Creative Preview'}
                className="mt-2 w-32 h-32 object-contain border border-gray-600"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

PlatformScreenWrapper.displayName = 'PlatformScreenWrapper';

export { PlatformScreenWrapper };
