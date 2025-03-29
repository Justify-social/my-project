import { HTMLAttributes } from 'react';

/**
 * Types for the AssetCard component
 */

/**
 * Asset interface representing different types of media assets
 */
export interface Asset {
  /** Unique identifier for the asset */
  id?: string;
  /** Name or title of the asset */
  name: string;
  /** URL to the asset media file */
  url: string;
  /** Type of asset, e.g., 'image', 'video' */
  type: string;
  /** Platform the asset belongs to (e.g., 'Instagram', 'TikTok') */
  platform?: string;
  /** Handle or username of the influencer associated with the asset */
  influencerHandle?: string;
  /** Description of the asset */
  description?: string;
  /** Budget allocated for the asset (number or string representation) */
  budget?: number | string;
  /** Size or dimensions of the asset */
  size?: string;
  /** Duration of the asset (for videos) */
  duration?: number;
}

/**
 * Props for the AssetCard component
 */
export interface AssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Asset object containing all information about the asset */
  asset: Asset;
  /** Currency code for budget formatting (default: 'USD') */
  currency?: string;
  /** Default platform to compare against (used to prevent redundant display) */
  defaultPlatform?: string;
  /** Additional class names for styling */
  className?: string;
  /** Whether to show the type label on the asset preview */
  showTypeLabel?: boolean;
}

/**
 * Props for the AssetPreview component
 */
export interface AssetPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL to the asset media file */
  url: string;
  /** Name or filename of the asset (used for alt text) */
  fileName?: string;
  /** Type of asset, e.g., 'image', 'video' */
  type: string;
  /** Whether to show the type label (image/video) */
  showTypeLabel?: boolean;
  /** Additional class names for styling */
  className?: string;
} 