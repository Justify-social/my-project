import React from 'react';
import { SkeletonSection as LoadingSkeletonSection } from './LoadingSkeleton';

export interface SkeletonSectionProps {
  title?: boolean;
  titleWidth?: string;
  actionButton?: boolean;
  lines?: number;
  lineHeight?: string;
  children?: React.ReactNode;
  className?: string;
}

const SkeletonSection: React.FC<SkeletonSectionProps> = (props) => {
  return <LoadingSkeletonSection {...props} />;
};

export default SkeletonSection; 