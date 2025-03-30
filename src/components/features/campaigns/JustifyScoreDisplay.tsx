'use client';

import React from 'react';
import JustifyScoreDisplayProps from './influencers/JustifyScoreDisplay';
import { Icon } from '@/components/ui/atoms/icons'
import { cn } from '@/utils/string/utils';

export interface JustifyScoreDisplayProps {
  score: number;
  previousScore?: number;
  size?: 'small' | 'medium' | 'large';
  showChange?: boolean;
  showLabel?: boolean;
  colorCoding?: boolean;
  className?: string;
}

const JustifyScoreDisplay: React.FC<JustifyScoreDisplayProps> = ({
  score,
  previousScore,
  size = 'medium',
  showChange = false,
  showLabel = false,
  colorCoding = true,
  className,
}) => {
  // Get score color based on value
  const getScoreColor = () => {
    if (!colorCoding) return 'text-blue-600';
    
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get background color based on value
  const getScoreBgColor = () => {
    if (!colorCoding) return 'bg-blue-50';
    
    if (score >= 85) return 'bg-green-50';
    if (score >= 70) return 'bg-blue-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };
  
  // Calculate change from previous score
  const getScoreChange = () => {
    if (previousScore === undefined) return { change: 0, trend: 'neutral' };
    
    const change = score - previousScore;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return { change: Math.abs(change), trend };
  };
  
  // Get trend icon and color
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return { icon: 'faArrowUp', color: 'text-green-600' };
    }
    if (trend === 'down') {
      return { icon: 'faArrowDown', color: 'text-red-600' };
    }
    return { icon: 'faMinus', color: 'text-gray-600' };
  };
  
  // Size specific classes
  const sizeClasses = {
    small: {
      container: 'h-10 w-10 text-xs',
      score: 'text-sm font-bold',
      label: 'text-xs',
    },
    medium: {
      container: 'h-14 w-14 text-sm',
      score: 'text-lg font-bold',
      label: 'text-xs',
    },
    large: {
      container: 'h-20 w-20 text-base',
      score: 'text-2xl font-bold',
      label: 'text-sm',
    },
  };
  
  const { change, trend } = getScoreChange();
  const { icon, color } = getTrendIcon(trend);
  
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {showLabel && (
        <div className={cn('mb-1 text-gray-600 font-medium', sizeClasses[size].label)}>
          Justify Score
        </div>
      )}
      
      <div className="relative">
        <div
          className={cn(
            'rounded-full flex items-center justify-center',
            getScoreBgColor(),
            sizeClasses[size].container
          )}
        >
          <span className={cn(getScoreColor(), sizeClasses[size].score)}>
            {score}
          </span>
        </div>
        
        {showChange && trend !== 'neutral' && (
          <div
            className={cn(
              'absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center',
              trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            <Icon name={icon} className={cn('text-xs', color)} />
          </div>
        )}
      </div>
      
      {showChange && previousScore !== undefined && (
        <div className={cn('mt-1 flex items-center', sizeClasses[size].label)}>
          <Icon name={icon} className={cn('mr-1 text-xs', color)} />
          <span className={color}>{change.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};

export default JustifyScoreDisplay; 