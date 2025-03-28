"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Platform, CreativeAssetType } from '@prisma/client';
import { CreativeAsset } from '@/types/brandLift';

// Constants for asset types
export const imageType = 'image';
export const videoType = 'video';

// Platform-specific styling and configuration
type PlatformConfigBase = {
  bgColor: string;
  textColor: string;
  captionColor: string;
  statusBarBg: string;
  statusBarTextColor: string;
  icon: React.ReactNode;
};

type InstagramConfig = PlatformConfigBase & {
  hasStories: boolean;
};

type TikTokConfig = PlatformConfigBase & {
  navigationItems: {name: string;active: boolean;}[];
  bottomNavItems: {name: string;icon: string;special?: boolean;}[];
  counterLabels: string[];
  showTranslation: boolean;
  songInfo: string;
};

type YoutubeConfig = PlatformConfigBase;
type FacebookConfig = PlatformConfigBase;

type PlatformConfig = {
  Instagram: InstagramConfig;
  TikTok: TikTokConfig;
  YouTube: YoutubeConfig;
  Facebook: FacebookConfig;
};

const platformConfig: PlatformConfig = {
  Instagram: {
    bgColor: 'bg-white',
    textColor: 'text-black',
    captionColor: 'text-gray-800',
    statusBarBg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600',
    statusBarTextColor: 'text-white',
    icon:
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
      </svg>,

    hasStories: true
  },
  TikTok: {
    bgColor: 'bg-black',
    textColor: 'text-white',
    captionColor: 'text-gray-200',
    statusBarBg: 'bg-black',
    statusBarTextColor: 'text-white',
    icon:
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
      </svg>,

    navigationItems: [
    { name: 'Following', active: false },
    { name: 'For you', active: true }],

    bottomNavItems: [
    { name: 'Home', icon: 'M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z' },
    { name: 'Friends', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { name: '+', icon: 'M12 5v14M5 12h14', special: true },
    { name: 'Inbox', icon: 'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z' },
    { name: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' }],

    counterLabels: ['250.5K', '100K', '85K', '132.5K'],
    showTranslation: true,
    songInfo: 'Song name • song artist'
  },
  Facebook: {
    bgColor: 'bg-white',
    textColor: 'text-black',
    captionColor: 'text-gray-800',
    statusBarBg: 'bg-blue-500',
    statusBarTextColor: 'text-white',
    icon:
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>

  },
  YouTube: {
    bgColor: 'bg-white',
    textColor: 'text-black',
    captionColor: 'text-gray-800',
    statusBarBg: 'bg-red-600',
    statusBarTextColor: 'text-white',
    icon:
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>

  }
};

export interface CreativePreviewProps {
  platform: string;
  brandName: string;
  brandLogo?: string;
  creative: {
    id: string;
    type: string;
    url: string;
    aspectRatio?: string;
  };
  caption: string;
  hashtags: string;
  music?: string;
}

export default function CreativePreview({
  platform,
  brandName,
  brandLogo,
  creative,
  caption,
  hashtags,
  music
}: CreativePreviewProps) {
  const config = platformConfig[platform as keyof typeof platformConfig] || platformConfig.Instagram;

  const aspectRatioClass = 'aspect-[9/16]'; // Enforce 9:16 for short-form video platforms

  const handlePlatformClick = (platformName: string) => {
    const event = new CustomEvent('platformChange', { detail: { platform: platformName } });
    window.dispatchEvent(event);
  };

  const isInstagram = (config: any): config is InstagramConfig => platform === 'Instagram';
  const isTikTok = (config: any): config is TikTokConfig => platform === 'TikTok';
  const isYouTube = (config: any): config is YoutubeConfig => platform === 'YouTube';

  const renderInstagramContent = () => {
    const instagramConfig = config as InstagramConfig;
    const fallbackImage = '/images/placeholder-video.jpg'; // Ensure this exists in public/images/

    return (
      <>
        <div className="px-2 pt-1 border-b border-gray-200 font-work-sans">
          <div className="flex justify-between items-center py-2 font-work-sans">
            <div className="flex items-center font-work-sans">
              <span className="font-semibold text-sm font-work-sans">{brandName}</span>
              <svg className="w-3 h-3 ml-1 text-blue-500 font-work-sans" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="flex space-x-4 font-work-sans">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9a3 3 0 100 6 3 3 0 000-6zm0 8a5 5 0 110-10 5 5 0 010 10zm5-5a5 5 0 10-10 0 5 5 0 0010 0z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9a3 3 0 100 6 3 3 0 000-6zm0 8a5 5 0 110-10 5 5 0 010 10zm5-5a5 5 0 10-10 0 5 5 0 0010 0z" />
              </svg>
            </div>
          </div>
          
          {instagramConfig.hasStories &&
          <div className="py-2 overflow-x-auto flex space-x-3 scrollbar-hide font-work-sans">
              <div className="flex flex-col items-center font-work-sans">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600 font-work-sans">
                  <div className="bg-white p-[2px] rounded-full w-full h-full font-work-sans">
                    <div className="bg-gray-200 rounded-full w-full h-full overflow-hidden font-work-sans">
                      {brandLogo ?
                    <Image
                      src={brandLogo}
                      alt={`${brandName} story`}
                      fill
                      style={{ objectFit: 'cover' }} /> :


                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold font-work-sans">
                          {brandName.substring(0, 1)}
                        </div>
                    }
                    </div>
                  </div>
                </div>
                <span className="text-xs mt-1 truncate w-14 text-center font-work-sans">{brandName}</span>
              </div>
              {Array.from({ length: 4 }).map((_, i) =>
            <div key={i} className="flex flex-col items-center font-work-sans">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-pink-600 font-work-sans">
                    <div className="bg-white p-[2px] rounded-full w-full h-full font-work-sans">
                      <div className="bg-gray-300 rounded-full w-full h-full font-work-sans"></div>
                    </div>
                  </div>
                  <span className="text-xs mt-1 truncate w-14 text-center font-work-sans">user_{i + 1}</span>
                </div>
            )}
            </div>
          }
        </div>
        
        <div className="px-3 py-2 flex items-center space-x-2 border-b border-gray-100 font-work-sans">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 font-work-sans">
            {brandLogo ?
            <Image
              src={brandLogo}
              alt={`${brandName} logo`}
              fill
              style={{ objectFit: 'cover' }} /> :


            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold font-work-sans">
                {brandName.substring(0, 1)}
              </div>
            }
          </div>
          <div className="flex-1 text-black font-work-sans">
            <div className="flex items-center font-work-sans">
              <p className="text-sm font-semibold font-work-sans">{brandName}</p>
              <svg className="w-3 h-3 ml-1 text-blue-500 font-work-sans" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 font-work-sans">Sponsored</p>
          </div>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
        </div>
        
        <div className={`flex-1 ${aspectRatioClass} overflow-hidden bg-gray-100 relative font-work-sans`}>
          {creative.type === videoType ?
          <video
            src={creative.url}
            controls={false}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video failed to load:', creative.url);
              const videoElement = e.target as HTMLVideoElement;
              videoElement.style.display = 'none';
              const fallbackImg = document.createElement('img');
              fallbackImg.src = fallbackImage;
              fallbackImg.className = 'w-full h-full object-cover';
              fallbackImg.alt = 'Fallback creative asset';
              videoElement.parentElement?.appendChild(fallbackImg);
            }}>

              <source src={creative.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video> :
          creative.type === imageType ?
          <Image
            src={creative.url}
            alt="Creative asset"
            fill
            style={{ objectFit: 'cover' }} /> :


          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-work-sans">
              No creative asset available
            </div>
          }
        </div>
        
        <div className="px-2 py-2 flex justify-between items-center font-work-sans">
          <div className="flex space-x-4 font-work-sans">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        
        {(caption || hashtags) &&
        <div className="px-3 py-2 max-h-20 overflow-y-auto font-work-sans">
            <p className="text-xs text-gray-800 font-work-sans">
              <span className="font-semibold font-work-sans">{brandName}</span> {caption}
              {hashtags && <span className="text-blue-500 font-work-sans"> {hashtags}</span>}
            </p>
            {music &&
          <p className="text-xs mt-1 text-gray-500 font-work-sans">
                <span className="flex items-center font-work-sans">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                  </svg>
                  {music}
                </span>
              </p>
          }
          </div>
        }
        
        <div className="px-4 py-3 mt-auto border-t border-gray-200 flex justify-between font-work-sans">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.005 16.545a2.997 2.997 0 012.997-2.997h0A2.997 2.997 0 0115 16.545V22h7V11.543L12 2 2 11.543V22h7.005z" />
          </svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <div className="w-6 h-6 rounded-full overflow-hidden font-work-sans">
            <div className="w-full h-full bg-gray-300 font-work-sans"></div>
          </div>
        </div>
      </>);

  };

  const renderTikTokContent = () => {
    const tikTokConfig = config as TikTokConfig;
    const fallbackImage = '/images/placeholder-video.jpg'; // Ensure this exists in public/images/

    return (
      <>
        <div className="px-2 pt-2 flex justify-center font-work-sans">
          {tikTokConfig.navigationItems &&
          <div className="flex space-x-4 font-work-sans">
              {tikTokConfig.navigationItems.map((item, index) =>
            <div key={index} className={`px-4 py-1 text-sm font-medium ${item.active ? 'text-white' : 'text-gray-400'} font-work-sans`}>
                  {item.name}
                  {item.active && <div className="h-0.5 bg-white mt-1 mx-auto w-1/2 font-work-sans" />}
                </div>
            )}
            </div>
          }
        </div>

        <div className={`flex-1 ${aspectRatioClass} overflow-hidden relative font-work-sans`}>
          {creative.type === videoType ?
          <video
            src={creative.url}
            controls={false}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video failed to load:', creative.url);
              const videoElement = e.target as HTMLVideoElement;
              videoElement.style.display = 'none';
              const fallbackImg = document.createElement('img');
              fallbackImg.src = fallbackImage;
              fallbackImg.className = 'w-full h-full object-cover';
              fallbackImg.alt = 'Fallback creative asset';
              videoElement.parentElement?.appendChild(fallbackImg);
            }}>

              <source src={creative.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video> :
          creative.type === imageType ?
          <Image
            src={creative.url}
            alt="Creative asset"
            fill
            style={{ objectFit: 'cover' }} /> :


          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-work-sans">
              No creative asset available
            </div>
          }

          <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-work-sans">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1546 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">{tikTokConfig.counterLabels?.[0] || '250K'}</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-work-sans">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">{tikTokConfig.counterLabels?.[1] || '100K'}</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-work-sans">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a1 1 0 0 1 .7.3l9 9a1 1 0 0 1-1.4 1.4L12 4.42l-8.3 8.28a1 1 0 1 1-1.4-1.42l9-9A1 1 0 0 1 12 2z" />
                  <path d="M12 2a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1z" />
                  <path d="M3 14a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" />
                </svg>
              </div>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">{tikTokConfig.counterLabels?.[2] || '85K'}</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden font-work-sans">
                {brandLogo ?
                <Image
                  src={brandLogo}
                  alt={`${brandName} logo`}
                  fill
                  style={{ objectFit: 'cover' }} /> :


                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold font-work-sans">
                    {brandName.substring(0, 1)}
                  </div>
                }
              </div>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">{tikTokConfig.counterLabels?.[3] || '132K'}</span>
            </div>
          </div>

          <div className="absolute left-2 right-20 bottom-20 text-white font-work-sans">
            <p className="text-sm font-semibold mb-1 font-work-sans">@{brandName}</p>
            <p className="text-xs mb-2 font-work-sans">{caption} {hashtags && <span className="text-white font-work-sans">{hashtags}</span>}</p>
            {music &&
            <div className="flex items-center mt-2 font-work-sans">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <p className="text-xs font-work-sans">{music}</p>
              </div>
            }
            {tikTokConfig.showTranslation &&
            <div className="mt-2 text-xs flex items-center font-work-sans">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.4-1.422 17.087 17.087 0 003.13-3.733 17.086 17.086 0 00-3.13-3.733 1 1 0 011.4-1.422 19.098 19.098 0 013.107 3.567c.181-.204.366-.404.554-.6a1 1 0 111.44 1.389 18.87 18.87 0 01-.914 1.026 18.87 18.87 0 011.724 4.78H15a1 1 0 110 2h-3v1a1 1 0 11-2 0v-1H7a1 1 0 110-2h3.422a18.87 18.87 0 01-1.724-4.78c-.29-.354-.596-.696-.914-1.026a1 1 0 111.44-1.389c.188.196.373.396.554.6a19.098 19.098 0 013.107-3.567 1 1 0 111.4 1.422 17.087 17.087 0 00-3.13 3.733 17.086 17.086 0 003.13 3.733 1 1 0 01-1.4 1.422 19.098 19.098 0 01-3.107-3.567c-.181.204-.366.404-.554.6a1 1 0 11-1.44-1.389c.32-.33.624-.672.914-1.026a18.87 18.87 0 01-1.724-4.78H7a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Show translation
              </div>
            }
            {tikTokConfig.songInfo &&
            <div className="mt-2 bg-black bg-opacity-50 text-xs inline-block py-1 px-2 rounded-md font-work-sans">
                <p className="flex items-center font-work-sans">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                  </svg>
                  {tikTokConfig.songInfo}
                </p>
              </div>
            }
            <button className="mt-2 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-work-sans">
              <svg className="w-6 h-6 text-white font-work-sans" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l8 4-8 4V4z" />
              </svg>
            </button>
          </div>
        </div>

        {tikTokConfig.bottomNavItems &&
        <div className="px-2 py-3 bg-black flex justify-between items-center font-work-sans">
            {tikTokConfig.bottomNavItems.map((item, index) =>
          <div key={index} className={`flex flex-col items-center ${index === 2 ? 'relative' : ''} font-work-sans`}>
                {index === 2 ?
            <div className="w-12 h-8 relative flex items-center justify-center font-work-sans">
                    <div className="absolute inset-0 bg-blue-500 rounded-md font-work-sans"></div>
                    <div className="absolute inset-0 bg-pink-500 rounded-md ml-1 mt-1 font-work-sans"></div>
                    <span className="relative text-white text-xl font-bold font-work-sans">+</span>
                  </div> :

            <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                    </svg>
                    <span className="text-[10px] mt-1 font-work-sans">{item.name}</span>
                  </>
            }
              </div>
          )}
          </div>
        }
      </>);

  };

  const renderYouTubeContent = () => {
    const fallbackImage = '/images/placeholder-video.jpg'; // Ensure this exists in public/images/

    return (
      <>
        <div className="px-3 py-2 flex justify-between items-center border-b border-gray-200 font-work-sans">
          <div className="flex items-center font-work-sans">
            <svg className="w-7 h-7 text-red-600 font-work-sans" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-sm font-bold ml-1 font-work-sans">Shorts</span>
          </div>
          <div className="flex items-center space-x-4 font-work-sans">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1.2-9.1c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2-.66 0-1.2-.54-1.2-1.2V5.9zm6.5 6.1c0 3-2.54 5.1-5.3 5.1-5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 aspect-[9/16] overflow-hidden bg-black relative font-work-sans">
          {creative.type === videoType ?
          <video
            src={creative.url}
            controls={false}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video failed to load:', creative.url);
              const videoElement = e.target as HTMLVideoElement;
              videoElement.style.display = 'none';
              const fallbackImg = document.createElement('img');
              fallbackImg.src = fallbackImage;
              fallbackImg.className = 'w-full h-full object-cover';
              fallbackImg.alt = 'Fallback creative asset';
              videoElement.parentElement?.appendChild(fallbackImg);
            }}>

              <source src={creative.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video> :
          creative.type === imageType ?
          <Image
            src={creative.url}
            alt="Creative asset"
            fill
            style={{ objectFit: 'cover' }} /> :


          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-work-sans">
              No creative asset available
            </div>
          }

          <div className="absolute right-2 bottom-24 flex flex-col items-center space-y-5 font-work-sans">
            <div className="flex flex-col items-center font-work-sans">
              <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-work-sans">
                <svg className="w-6 h-6 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">125K</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-work-sans">
                <svg className="w-6 h-6 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H7V5h3v7zm4 0h-3V5h3v7zm4 0h-3V5h3v7z" />
                </svg>
              </button>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">842</span>
            </div>
            <div className="flex flex-col items-center font-work-sans">
              <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-work-sans">
                <svg className="w-6 h-6 text-white font-work-sans" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
              </button>
              <span className="text-xs font-semibold mt-1 text-white font-work-sans">Share</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent font-work-sans">
            <div className="flex items-start font-work-sans">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 border-2 border-white font-work-sans">
                {brandLogo ?
                <Image
                  src={brandLogo}
                  alt={`${brandName} logo`}
                  fill
                  style={{ objectFit: 'cover' }} /> :


                <div className="w-full h-full bg-red-600 flex items-center justify-center text-white font-bold font-work-sans">
                    {brandName.substring(0, 1)}
                  </div>
                }
              </div>
              <div className="ml-2 flex-1 font-work-sans">
                <p className="text-white font-medium text-sm font-work-sans">@{brandName.toLowerCase().replace(/\s+/g, '')}</p>
                <p className="text-white text-xs mt-1 line-clamp-2 font-work-sans">{caption}</p>
                <p className="text-gray-300 text-xs mt-1 font-work-sans">
                  {music &&
                  <span className="flex items-center font-work-sans">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {music}
                    </span>
                  }
                </p>
              </div>
              <button className="ml-2 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-sm font-work-sans">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-around items-center py-2 border-t border-gray-300 bg-white font-work-sans">
          <button className="flex flex-col items-center font-work-sans">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-1 font-work-sans">Home</span>
          </button>
          <button className="flex flex-col items-center font-work-sans">
            <svg className="w-6 h-6 text-red-600 font-work-sans" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.77 10.32c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zM10 14.65v-5.3L15 12l-5 2.65z" />
            </svg>
            <span className="text-xs mt-1 text-red-600 font-work-sans">Shorts</span>
          </button>
          <button className="flex flex-col items-center p-1 rounded-full bg-gray-100 font-work-sans">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </button>
          <button className="flex flex-col items-center font-work-sans">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H7V5h3v7zm4 0h-3V5h3v7zm4 0h-3V5h3v7z" />
            </svg>
            <span className="text-xs mt-1 font-work-sans">Library</span>
          </button>
        </div>
      </>);

  };

  const renderContent = () => {
    if (platform === 'Instagram') {
      return renderInstagramContent();
    } else if (platform === 'TikTok') {
      return renderTikTokContent();
    } else if (platform === 'YouTube') {
      return renderYouTubeContent();
    }

    return (
      <>
        <div className="p-2 flex justify-between items-center border-b border-gray-200 font-work-sans">
          {config.icon}
          <div className="flex space-x-3 font-work-sans">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </div>
        </div>
        
        <div className="px-3 py-2 flex items-center space-x-2 font-work-sans">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 font-work-sans">
            {brandLogo ?
            <Image
              src={brandLogo}
              alt={`${brandName} logo`}
              fill
              style={{ objectFit: 'cover' }} /> :


            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold font-work-sans">
                {brandName.substring(0, 1)}
              </div>
            }
          </div>
          <div className={`flex-1 ${config.textColor} font-work-sans`}>
            <p className="text-sm font-semibold font-work-sans">{brandName}</p>
            <p className="text-xs opacity-70 font-work-sans">Sponsored</p>
          </div>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
        </div>
        
        <div className={`flex-1 ${aspectRatioClass} overflow-hidden bg-gray-100 relative font-work-sans`}>
          {creative.type === videoType ?
          <video
            src={creative.url}
            controls={false}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video failed to load:', creative.url);
              const videoElement = e.target as HTMLVideoElement;
              videoElement.style.display = 'none';
              const fallbackImg = document.createElement('img');
              fallbackImg.src = fallbackImage;
              fallbackImg.className = 'w-full h-full object-cover';
              fallbackImg.alt = 'Fallback creative asset';
              videoElement.parentElement?.appendChild(fallbackImg);
            }}>

              <source src={creative.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video> :
          creative.type === imageType ?
          <Image
            src={creative.url}
            alt="Creative asset"
            fill
            style={{ objectFit: 'cover' }} /> :


          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-work-sans">
              No creative asset available
            </div>
          }
        </div>
        
        <div className="p-2 flex justify-between font-work-sans">
          <div className="flex space-x-4 font-work-sans">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.949L2 17l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"></path>
            </svg>
          </div>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a2 2 0 01-2 2h5.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V8a1 1 0 00-.293-.707l-2-2A1 1 0 0017 5h-5a1 1 0 00-1 1v4a1 1 0 01-1 1H3V6a1 1 0 011-1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 01-1-1V4a1 1 0 00-1-1H3z"></path>
          </svg>
        </div>
        
        {(caption || hashtags) &&
        <div className="px-3 py-2 max-h-20 overflow-y-auto font-work-sans">
            <p className={`text-xs ${config.captionColor} font-work-sans`}>
              <span className="font-semibold font-work-sans">{brandName}</span> {caption}
              {hashtags && <span className="text-blue-500 font-work-sans"> {hashtags}</span>}
            </p>
            {music &&
          <p className="text-xs mt-1 text-gray-500 font-work-sans">
                <span className="flex items-center font-work-sans">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                  </svg>
                  {music}
                </span>
              </p>
          }
          </div>
        }
      </>);

  };

  return (
    <div className="relative flex items-center justify-center w-full max-w-[320px] h-[640px] mx-auto font-work-sans">
      <div className="w-full h-full border-[14px] border-black rounded-[40px] shadow-xl overflow-hidden bg-gray-100 flex flex-col relative font-work-sans">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-[25px] bg-black z-20 rounded-b-lg flex items-center justify-center font-work-sans">
          <div className="w-2 h-2 rounded-full bg-gray-600 mr-2 font-work-sans"></div>
          <div className="w-12 h-1.5 rounded-full bg-gray-600 font-work-sans"></div>
        </div>
        
        <div className={`${config.statusBarBg} ${config.statusBarTextColor} pt-7 pb-1 px-4 flex justify-between items-center text-xs flex-none font-work-sans`}>
          <span className="font-medium font-work-sans">9:41</span>
          <div className="flex items-center space-x-1 font-work-sans">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.5,7.5 L19.5,16.5 L4.5,16.5 L4.5,7.5 L19.5,7.5 Z M19.5,6 L4.5,6 C3.675,6 3,6.675 3,7.5 L3,16.5 C3,17.325 3.675,18 4.5,18 L19.5,18 C20.325,18 21,17.325 21,16.5 L21,7.5 C21,6.675 20.325,6 19.5,6 Z M12,15 C12.8284271,15 13.5,14.3284271 13.5,13.5 C13.5,12.6715729 12.8284271,12 12,12 C11.1715729,12 10.5,12.6715729 10.5,13.5 C10.5,14.3284271 11.1715729,15 12,15 Z M7.5,15 C8.32842712,15 9,14.3284271 9,13.5 C9,12.6715729 8.32842712,12 7.5,12 C6.67157288,12 6,12.6715729 6,13.5 C6,14.3284271 6.67157288,15 7.5,15 Z M16.5,15 C17.3284271,15 18,14.3284271 18,13.5 C18,12.6715729 17.3284271,12 16.5,12 C15.6715729,12 15,12.6715729 15,13.5 C15,14.3284271 15.6715729,15 16.5,15 Z"></path>
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.666 7l-.916 1.833L9.916 10l1.834.917.916 1.833.917-1.833L15.416 10l-1.833-.917L12.666 7zM15 4l-1.25 2.5L11.25 8l2.5 1.25 1.25 2.5 1.25-2.5L18.75 8l-2.5-1.25L15 4zM7.5 12l-.75 1.5L5.25 14.5l1.5.75.75 1.5.75-1.5 1.5-.75-1.5-.75L7.5 12z"></path>
            </svg>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.071 4.929A9.97 9.97 0 0 0 12 2a9.97 9.97 0 0 0-7.071 2.929A9.97 9.97 0 0 0 2 12a9.97 9.97 0 0 0 2.929 7.071A9.97 9.97 0 0 0 12 22a9.97 9.97 0 0 0 7.071-2.929A9.97 9.97 0 0 0 22 12a9.97 9.97 0 0 0-2.929-7.071zM12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-5-8a5 5 0 0 0 10 0 .5.5 0 0 0-1 0 4 4 0 0 1-8 0 .5.5 0 0 0-1 0zm7.5-1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
            </svg>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V5h2v7zm4 0h-2V5h2v7zm4 0h-2V5h2v7z" />
            </svg>
          </div>
        </div>
        
        <div className={`flex-1 ${config.bgColor} flex flex-col overflow-hidden relative font-work-sans`}>
          {renderContent()}
        </div>
        
        <div className="h-6 flex items-center justify-center pb-1 bg-white font-work-sans">
          <div className="w-[120px] h-1 bg-black rounded-full font-work-sans"></div>
        </div>
      </div>
    </div>);

}