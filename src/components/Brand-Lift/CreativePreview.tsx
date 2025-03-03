"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Platform, CreativeAssetType } from '@prisma/client';
import { CreativeAsset } from '@/types/brandLift';

// Use string value instead of enum reference to avoid potential issues
const imageType = 'image' as CreativeAssetType;
const videoType = 'video' as CreativeAssetType;

interface CreativePreviewProps {
  platform: Platform;
  brandName: string;
  brandLogo?: string;
  creative: CreativeAsset;
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
  // Platform-specific styles and elements
  const platformConfig = {
    [Platform.Instagram]: {
      headerBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      headerText: 'text-white',
      containerBg: 'bg-white',
      textColor: 'text-gray-800',
      secondaryText: 'text-blue-600',
      platformName: 'Instagram',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="18.5" cy="5.5" r="1.5" />
        </svg>
      ),
    },
    [Platform.TikTok]: {
      headerBg: 'bg-black',
      headerText: 'text-white',
      containerBg: 'bg-gray-900',
      textColor: 'text-white',
      secondaryText: 'text-blue-400',
      platformName: 'TikTok',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
        </svg>
      ),
    },
    [Platform.YouTube]: {
      headerBg: 'bg-red-600',
      headerText: 'text-white',
      containerBg: 'bg-white',
      textColor: 'text-gray-800',
      secondaryText: 'text-red-600',
      platformName: 'YouTube',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
      ),
    },
  };

  // Determine aspect ratio class based on platform and creative type
  const getAspectRatioClass = () => {
    if (creative.aspectRatio) {
      const [width, height] = creative.aspectRatio.split(':').map(Number);
      
      if (width === 1 && height === 1) return 'aspect-square';
      if (width === 4 && height === 5) return 'aspect-4/5';
      if (width === 9 && height === 16) return 'aspect-9/16';
      if (width === 16 && height === 9) return 'aspect-16/9';
    }
    
    // Default aspect ratios by platform
    switch (platform) {
      case Platform.Instagram:
        return 'aspect-square';
      case Platform.TikTok:
        return 'aspect-9/16';
      case Platform.YouTube:
        return 'aspect-16/9';
      default:
        return 'aspect-square';
    }
  };

  // Render the creative asset based on type
  const renderCreativeAsset = () => {
    // Safety check if creative is undefined
    if (!creative) {
      return (
        <div className={`w-full ${getAspectRatioClass()} bg-gray-200 flex items-center justify-center`}>
          <span className="text-gray-500">No creative assets available</span>
        </div>
      );
    }
    
    if (creative.type === videoType) {
      return (
        <div className={`relative w-full ${getAspectRatioClass()} bg-gray-900 overflow-hidden`}>
          <Image 
            src={creative.thumbnailUrl || creative.url || 'https://placehold.co/600x400/333333/FFFFFF?text=Video+Unavailable'}
            alt="Video thumbnail"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-opacity duration-300 group-hover:opacity-90"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
            </motion.div>
          </div>
          {creative.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              {Math.floor(creative.duration / 60)}:{(creative.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      );
    } else if (creative.type === imageType) {
      return (
        <div className={`relative w-full ${getAspectRatioClass()} bg-gray-100 overflow-hidden`}>
          <Image 
            src={creative.url || 'https://placehold.co/600x400/EEEEEE/AAAAAA?text=Image+Unavailable'}
            alt="Creative image"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      );
    }
    
    // Fallback
    return (
      <div className={`w-full ${getAspectRatioClass()} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500">Preview not available</span>
      </div>
    );
  };

  return (
    <motion.div 
      className={`rounded-lg overflow-hidden shadow-md ${platformConfig[platform].containerBg} group`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Platform header */}
      <div className={`p-3 ${platformConfig[platform].headerBg} ${platformConfig[platform].headerText} flex items-center justify-between`}>
        <div className="flex items-center">
          {brandLogo && (
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-white/20">
              <Image 
                src={brandLogo} 
                alt={brandName} 
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex items-center">
              <span className="text-sm font-semibold">{brandName}</span>
              <span className="ml-1 text-xs opacity-70">• Sponsored</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {platformConfig[platform].icon}
          <span className="ml-1 text-xs">{platformConfig[platform].platformName}</span>
        </div>
      </div>
      
      {/* Creative content */}
      {renderCreativeAsset()}
      
      {/* Caption and engagement */}
      <div className="p-3">
        <div className={`text-sm mb-1 ${platformConfig[platform].textColor}`}>
          {caption}
        </div>
        
        <div className={`text-sm mb-2 ${platformConfig[platform].secondaryText}`}>
          {hashtags}
        </div>
        
        {music && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="mr-1">♫</span>
            <p className="truncate">{music}</p>
          </div>
        )}
        
        {/* Engagement metrics mockup */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>2.4k</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
            <span>128</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span>Share</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 