////////////////////////////////////
// src/components/Influencers/InfluencerCard.tsx
////////////////////////////////////
"use client";

import React from "react";
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon, ButtonIcon, StaticIcon, PlatformIcon } from '@/components/ui/icons';
import { Influencer } from "@/types/influencer";
import JustifyScoreDisplay from '@/components/Influencers/metrics/JustifyScoreDisplay';
import { formatFollowerCount } from '@/lib/utils';

export interface InfluencerCardProps {
  influencer: Influencer;
  layout?: 'card' | 'row';
  showMetrics?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({
  influencer,
  layout = 'card',
  showMetrics = true,
  selected = false,
  onClick,
  className = '',
}) => {
  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Bronze':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };
  
  // Get the appropriate platform icon name
  const getPlatformIconName = (platform: string) => {
    const normalizedPlatform = platform.toLowerCase();
    
    if (normalizedPlatform.includes('instagram')) return 'instagram';
    if (normalizedPlatform.includes('facebook')) return 'facebook';
    if (normalizedPlatform.includes('linkedin')) return 'linkedin';
    if (normalizedPlatform.includes('tiktok')) return 'tiktok';
    if (normalizedPlatform.includes('youtube')) return 'youtube';
    if (normalizedPlatform.includes('twitter') || normalizedPlatform.includes('x')) return 'x';
    
    // For platforms not directly supported by the PlatformIcon component,
    // we'll fallback to a generic social icon or the platform that's supported
    return 'instagram';
  };

  if (layout === 'card') {
    return (
      <Card 
        className={`overflow-hidden hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-[#3182CE]' : ''} ${className} group cursor-pointer`}
        onClick={onClick}
      >
        <div className="p-5">
          <div className="flex items-center mb-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-gray-100">
              <Image
                src={influencer.avatar}
                alt={influencer.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            
            <div className="ml-4 flex-1">
              <h3 className="font-bold text-lg text-[#333333]">{influencer.name}</h3>
              <p className="text-[#4A5568] text-sm">{influencer.username}</p>
            </div>
            
            {showMetrics && (
              <JustifyScoreDisplay
                score={influencer.justifyMetrics.justifyScore}
                size="small"
              />
            )}
          </div>
          
          <p className="text-[#333333] text-sm mb-4 line-clamp-2">{influencer.bio}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getTierColor(influencer.tier)}>
              {influencer.tier}
            </Badge>
            
            <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
              <PlatformIcon platformName={getPlatformIconName(influencer.platform) as any} size="sm" />
              {influencer.platform}
            </Badge>
            
            {showMetrics && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                <StaticIcon name="faUsers" size="sm" />
                {formatFollowerCount(influencer.followers)}
              </Badge>
            )}
            
            {showMetrics && (
              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                <StaticIcon name="faChartLine" size="sm" />
                {influencer.audienceMetrics.engagement.rate.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }
  
  // Row layout
  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-[#3182CE]' : ''} ${className} group cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-3 flex items-center">
        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
          <Image
            src={influencer.avatar}
            alt={influencer.name}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="font-bold text-base truncate text-[#333333]">{influencer.name}</h3>
              <p className="text-[#4A5568] text-xs truncate">{influencer.username}</p>
            </div>
            
            {showMetrics && (
              <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                <div className="flex items-center text-blue-700 text-sm">
                  <StaticIcon name="faUsers" className="mr-1" size="sm" />
                  <span>{formatFollowerCount(influencer.followers)}</span>
                </div>
                
                <div className="flex items-center text-green-700 text-sm">
                  <StaticIcon name="faChartLine" className="mr-1" size="sm" />
                  <span>{influencer.audienceMetrics.engagement.rate.toFixed(1)}%</span>
                </div>
                
                <JustifyScoreDisplay
                  score={influencer.justifyMetrics.justifyScore}
                  size="small"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={`${getTierColor(influencer.tier)} text-xs px-2 py-0.5`}>
              {influencer.tier}
            </Badge>
            
            <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 flex items-center gap-1">
              <PlatformIcon platformName={getPlatformIconName(influencer.platform) as any} size="sm" />
              {influencer.platform}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InfluencerCard;