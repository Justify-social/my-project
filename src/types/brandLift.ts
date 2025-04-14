/**
 * Types for Brand Lift surveys and preview data
 */

import { Platform, KPI, CreativeAssetType } from '@prisma/client';

// Question options for survey questions
export interface SurveyQuestionOption {
  id: string;
  text: string;
  image: string | null;
}

// Survey question structure
export interface SurveyQuestion {
  id: string;
  title: string;
  type: string;
  kpi: KPI;
  options: SurveyQuestionOption[];
  required: boolean;
}

// Creative asset structure for surveys
export interface SurveyCreativeAsset {
  id: string;
  type: CreativeAssetType;
  url: string;
  aspectRatio: string;
  thumbnailUrl: string;
  duration: number;
}

// Survey preview data structure
export interface SurveyPreviewData {
  id: string;
  campaignName: string;
  date: string;
  brandName: string;
  brandLogo: string;
  platforms: Platform[];
  activePlatform: Platform;
  adCreative: SurveyCreativeAsset;
  adCaption: string;
  adHashtags: string;
  adMusic: string;
  questions: SurveyQuestion[];
  submissionStatus: string;
}
