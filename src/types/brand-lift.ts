/**
 * TypeScript definitions for Brand Lift Survey data models
 * Aligned with Prisma schema structure
 */

import { Platform, KPI, CreativeAssetType } from '@prisma/client';

/**
 * Survey option presented to users in brand lift surveys
 */
export interface SurveyOption {
  id: string;
  text: string;
  image?: string | null;
}

/**
 * Survey question structure with KPI alignment
 */
export interface SurveyQuestion {
  id: string;
  title: string;
  type: 'Single Choice' | 'Multiple Choice';
  kpi: KPI; // Using KPI enum from Prisma schema
  options: SurveyOption[];
  required?: boolean;
}

/**
 * Creative asset for display in platform previews
 */
export interface CreativeAsset {
  id: string;
  type: CreativeAssetType; // From Prisma schema
  url: string;
  aspectRatio?: string;
  thumbnailUrl?: string;
  duration?: number; // For videos
}

/**
 * Complete survey preview data structure
 */
export interface SurveyPreviewData {
  id: string;
  campaignName: string;
  date: string;
  brandName: string;
  brandLogo?: string;
  platforms: Platform[]; // From Prisma schema
  activePlatform: Platform;
  adCreative: CreativeAsset;
  adCaption: string;
  adHashtags: string;
  adMusic?: string;
  questions: SurveyQuestion[];
  submissionStatus?: 'draft' | 'submitted';
}

/**
 * User responses to survey questions
 */
export interface SurveyResponses {
  [questionId: string]: string[]; // Array to support multi-select
}

/**
 * Survey validation error structure
 */
export interface ValidationErrors {
  [questionId: string]: string;
} 