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
const platformConfig = {
  Instagram: {
    bgColor: 'bg-white',
    textColor: 'text-black',
    captionColor: 'text-gray-800',
    statusBarBg: 'bg-black',
    statusBarTextColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  TikTok: {
    bgColor: 'bg-black',
    textColor: 'text-white',
    captionColor: 'text-gray-200',
    statusBarBg: 'bg-black',
    statusBarTextColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
      </svg>
    ),
    navigationItems: [
      { name: 'Following', active: false },
      { name: 'For you', active: true },
    ],
    bottomNavItems: [
      { name: 'Home', icon: 'M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z' },
      { name: 'Friends', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
      { name: '+', icon: 'M12 5v14M5 12h14', special: true },
      { name: 'Inbox', icon: 'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z' },
      { name: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
    ],
    counterLabels: ['250.5K', '100K', '85K', '132.5K'],
    showTranslation: true,
    songInfo: 'Song name • song artist',
  },
  Facebook: {
    bgColor: 'bg-white',
    textColor: 'text-black',
    captionColor: 'text-gray-800',
    statusBarBg: 'bg-blue-500',
    statusBarTextColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  YouTube: {
    bgColor: 'bg-white',
    textColor: 'text-black',
    captionColor: 'text-gray-800',
    statusBarBg: 'bg-red-600',
    statusBarTextColor: 'text-white',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
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
  music,
}: CreativePreviewProps) {
  const config = platformConfig[platform as keyof typeof platformConfig] || platformConfig.Instagram;
  
  // Calculate the effective aspect ratio - default to 1:1 if not specified
  const aspectRatio = creative.aspectRatio || '1:1';
  const [width, height] = aspectRatio.split(':').map(Number);
  const aspectRatioClass = width > height 
    ? 'aspect-[16/9]' 
    : width === height 
      ? 'aspect-square' 
      : 'aspect-[9/16]';

  // Handler for platform switching
  const handlePlatformClick = (platformName: string) => {
    const event = new CustomEvent('platformChange', { 
      detail: { platform: platformName } 
    });
    window.dispatchEvent(event);
  };

  // Creative content for TikTok
  const renderTikTokContent = () => {
    return (
      <>
        {/* TikTok top navigation */}
        <div className="px-2 pt-2 flex justify-center">
          {config.navigationItems && (
            <div className="flex space-x-4">
              {config.navigationItems.map((item, index) => (
                <div key={index} className={`px-4 py-1 text-sm font-medium ${item.active ? 'text-white' : 'text-gray-400'}`}>
                  {item.name}
                  {item.active && <div className="h-0.5 bg-white mt-1 mx-auto w-1/2" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Creative content */}
        <div className={`flex-1 ${aspectRatioClass} overflow-hidden relative`}>
          {creative.type === videoType ? (
            <video 
              src={creative.url} 
              controls={false}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : creative.type === imageType ? (
            <Image 
              src={creative.url} 
              alt="Creative asset" 
              width={300} 
              height={300} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              No creative asset available
            </div>
          )}

          {/* Right side icons for TikTok */}
          {platform === 'TikTok' && (
            <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 10V20M8 10L4 9.99998V20L8 20M8 10L13.1956 3.93847C13.6886 3.3633 14.4642 3.11604 15.1992 3.29977L15.2467 3.31166C16.5885 3.64711 17.1929 5.21057 16.4258 6.36135L14 9.99998H18.5604C19.8225 9.99998 20.7691 11.1546 20.5216 12.3922L19.3216 18.3922C19.1346 19.3271 18.3138 20 17.3604 20L8 20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold mt-1 text-white">{config.counterLabels?.[0] || '250K'}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold mt-1 text-white">{config.counterLabels?.[1] || '100K'}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a1 1 0 0 1 .7.3l9 9a1 1 0 0 1-1.4 1.4L12 4.42l-8.3 8.28a1 1 0 1 1-1.4-1.42l9-9A1 1 0 0 1 12 2z"/>
                    <path d="M12 2a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1z" />
                    <path d="M3 14a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold mt-1 text-white">{config.counterLabels?.[2] || '85K'}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {brandLogo ? (
                    <Image 
                      src={brandLogo} 
                      alt={`${brandName} logo`} 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {brandName.substring(0, 1)}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold mt-1 text-white">{config.counterLabels?.[3] || '132K'}</span>
              </div>
            </div>
          )}

          {/* Caption overlay for TikTok */}
          {platform === 'TikTok' && (
            <div className="absolute left-2 right-20 bottom-20 text-white">
              <p className="text-sm font-semibold mb-1">@{brandName}</p>
              <p className="text-xs mb-2">{caption} {hashtags && <span className="text-white">{hashtags}</span>}</p>
              {music && (
                <div className="flex items-center mt-2">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <p className="text-xs">{music}</p>
                </div>
              )}
              {config.showTranslation && (
                <div className="mt-2 text-xs flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.4-1.422 17.087 17.087 0 003.13-3.733 17.086 17.086 0 00-3.13-3.733 1 1 0 011.4-1.422 19.098 19.098 0 013.107 3.567c.181-.204.366-.404.554-.6a1 1 0 111.44 1.389 18.87 18.87 0 01-.914 1.026 18.87 18.87 0 011.724 4.78H15a1 1 0 110 2h-3v1a1 1 0 11-2 0v-1H7a1 1 0 110-2h3.422a18.87 18.87 0 01-1.724-4.78c-.29-.354-.596-.696-.914-1.026a1 1 0 111.44-1.389c.188.196.373.396.554.6a19.098 19.098 0 013.107-3.567 1 1 0 111.4 1.422 17.087 17.087 0 00-3.13 3.733 17.086 17.086 0 003.13 3.733 1 1 0 01-1.4 1.422 19.098 19.098 0 01-3.107-3.567c-.181.204-.366.404-.554.6a1 1 0 11-1.44-1.389c.32-.33.624-.672.914-1.026a18.87 18.87 0 01-1.724-4.78H7a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Show translation
                </div>
              )}
              {config.songInfo && (
                <div className="mt-2 bg-black bg-opacity-50 text-xs inline-block py-1 px-2 rounded-md">
                  <p className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                    </svg>
                    {config.songInfo}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TikTok bottom navigation */}
        {platform === 'TikTok' && config.bottomNavItems && (
          <div className="px-2 py-3 bg-black flex justify-between items-center">
            {config.bottomNavItems.map((item, index) => (
              <div key={index} className={`flex flex-col items-center ${index === 2 ? 'relative' : ''}`}>
                {index === 2 ? (
                  <div className="w-12 h-8 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500 rounded-md"></div>
                    <div className="absolute inset-0 bg-pink-500 rounded-md ml-1 mt-1"></div>
                    <span className="relative text-white text-xl font-bold">+</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                    </svg>
                    <span className="text-[10px] mt-1">{item.name}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (platform === 'TikTok') {
      return renderTikTokContent();
    }
    
    return (
      <>
        {/* Platform header - Simplified */}
        <div className="p-2 flex justify-between items-center border-b border-gray-200">
          {config.icon}
          <div className="flex space-x-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </div>
        </div>
        
        {/* User info bar */}
        <div className="px-3 py-2 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {brandLogo ? (
              <Image 
                src={brandLogo} 
                alt={`${brandName} logo`} 
                width={32} 
                height={32} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {brandName.substring(0, 1)}
              </div>
            )}
          </div>
          <div className={`flex-1 ${config.textColor}`}>
            <p className="text-sm font-semibold">{brandName}</p>
            <p className="text-xs opacity-70">Sponsored</p>
          </div>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
          </svg>
        </div>
        
        {/* Creative content */}
        <div className={`flex-1 ${aspectRatioClass} overflow-hidden bg-gray-100 relative`}>
          {creative.type === videoType ? (
            <video 
              src={creative.url} 
              controls={false}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : creative.type === imageType ? (
            <Image 
              src={creative.url} 
              alt="Creative asset" 
              width={300} 
              height={300} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              No creative asset available
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="p-2 flex justify-between">
          <div className="flex space-x-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
            </svg>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"></path>
            </svg>
          </div>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a2 2 0 01-2 2h5.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V8a1 1 0 00-.293-.707l-2-2A1 1 0 0017 5h-5a1 1 0 00-1 1v4a1 1 0 01-1 1H3V6a1 1 0 011-1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 01-1-1V4a1 1 0 00-1-1H3z"></path>
          </svg>
        </div>
        
        {/* Caption section */}
        {(caption || hashtags) && (
          <div className="px-3 py-2 max-h-20 overflow-y-auto">
            <p className={`text-xs ${config.captionColor}`}>
              <span className="font-semibold">{brandName}</span> {caption}
              {hashtags && (
                <span className="text-blue-500"> {hashtags}</span>
              )}
            </p>
            {music && (
              <p className="text-xs mt-1 text-gray-500">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                  </svg>
                  {music}
                </span>
              </p>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Phone mockup - slightly smaller for full visibility */}
      <div className="w-full max-w-[280px] h-[560px] mx-auto border-8 border-black rounded-[36px] shadow-xl overflow-hidden bg-gray-100 flex flex-col">
        {/* Status bar */}
        <div className={`${config.statusBarBg} ${config.statusBarTextColor} p-1 flex justify-between items-center text-xs flex-none`}>
          <span>9:41 AM</span>
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5z"></path>
              <path d="M8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7z"></path>
              <path d="M14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
            </svg>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
            </svg>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4.75C2 3.784 2.784 3 3.75 3h4.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 018.25 11h-4.5A1.75 1.75 0 012 9.25v-4.5zM10 4.75c0-.966.784-1.75 1.75-1.75h4.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 0116.25 11h-4.5A1.75 1.75 0 0110 9.25v-4.5zM2 14.75c0-.966.784-1.75 1.75-1.75h4.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 018.25 21h-4.5A1.75 1.75 0 012 19.25v-4.5zM10 14.75c0-.966.784-1.75 1.75-1.75h4.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 0116.25 21h-4.5A1.75 1.75 0 0110 19.25v-4.5z"></path>
            </svg>
          </div>
        </div>
        
        {/* Main screen content - platform specific */}
        <div className={`flex-1 ${config.bgColor} flex flex-col overflow-hidden relative`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 