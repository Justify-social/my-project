////////////////////////////////////
// src/types/influencer.ts
////////////////////////////////////
/**
 * Core influencer interface containing essential properties
 */
export type Influencer = {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  platform: string;
  followers: number;
  tier: 'Gold' | 'Silver' | 'Bronze';

  justifyMetrics: {
    justifyScore: number;
    scoreComponents: {
      audienceRelevance: number;
      engagementQuality: number;
      contentAuthenticity: number;
      brandSafetyRating: number;
      performanceConsistency: number;
    };
    historicalScoreTrend: Array<{
      date: string;
      score: number;
    }>;
  };

  audienceMetrics: {
    demographics: {
      ageRanges: {
        [key: string]: number;
      };
      genderSplit: {
        [key: string]: number;
      };
      topLocations: {
        [key: string]: number;
      };
    };
    engagement: {
      rate: number;
      averageLikes: number;
      averageComments: number;
      averageShares: number;
    };
  };

  safetyMetrics: {
    riskScore: number;
    lastAssessmentDate: string;
    complianceStatus: 'compliant' | 'warning' | 'non-compliant';
    contentModeration: {
      flaggedContent: boolean;
      contentWarnings: number;
    };
  };
};

/**
 * Interface for influencer filters
 */
export interface InfluencerFilters {
  platform?: string;
  tier?: string;
  minScore?: number;
  minFollowers?: number;
  minEngagement?: number;
  maxRiskScore?: number;
  sortBy?: 'justifyScore' | 'followers' | 'engagement';
}

/**
 * Campaign status types
 */
export type CampaignStatus = 'draft' | 'pending' | 'active' | 'completed' | 'canceled';

/**
 * Content requirements for influencer campaigns
 */
export interface ContentRequirement {
  id: string;
  type: 'post' | 'story' | 'reel' | 'video';
  description: string;
  required: boolean;
  deliveryDate?: string;
  specs?: {
    minDuration?: number;
    maxDuration?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
    resolution?: string;
    aspectRatio?: string;
  };
}

/**
 * Payment terms for influencer contracts
 */
export interface PaymentTerm {
  amount: number;
  schedule: 'upfront' | 'milestone' | 'completion';
  milestoneDescription?: string;
  dueDate?: string;
}

/**
 * Influencer campaign interface
 */
export interface InfluencerCampaign {
  id: string;
  name: string;
  brand: {
    id: string;
    name: string;
    logo: string;
  };
  status: CampaignStatus;
  budget: number;
  startDate: string;
  endDate: string;
  objectives: {
    primary: string;
    secondary?: string[];
    kpis: string[];
    targetAudience: string;
  };
  contentRequirements: ContentRequirement[];
  influencers: {
    influencer: Influencer;
    status: 'invited' | 'pending' | 'accepted' | 'rejected' | 'completed';
    paymentTerms: PaymentTerm[];
    contractUrl?: string;
    deliverables?: {
      id: string;
      contentRequirementId: string;
      status: 'pending' | 'submitted' | 'approved' | 'rejected';
      submissionUrl?: string;
      submissionDate?: string;
      feedbackNotes?: string;
    }[];
  }[];
  creativeAssets?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  approvalWorkflow: {
    requiresApproval: boolean;
    approvers?: {
      id: string;
      name: string;
      email: string;
      role: string;
    }[];
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Campaign creation/edit form data
 */
export interface CampaignFormData {
  name: string;
  brandId: string;
  budget: number;
  startDate: string;
  endDate: string;
  primaryObjective: string;
  secondaryObjectives?: string[];
  kpis: string[];
  targetAudience: string;
  contentRequirements: Omit<ContentRequirement, 'id'>[];
  selectedInfluencers: string[]; // Array of influencer IDs
  creativeAssets?: {
    name: string;
    url: string;
    type: string;
  }[];
  requiresApproval: boolean;
  approverIds?: string[];
  notes?: string;
}

import { PlatformEnum } from './enums'; // Assuming PlatformEnum exists
// Import InsightIQ specific types for reference
import {
  InsightIQProfile,
  InsightIQDemographicsAttributes,
  InsightIQContentEngagement,
} from './insightiq';

/**
 * Core data needed for displaying influencers in lists/cards.
 * Aligned with expected data from InsightIQ Profile/Analytics.
 */
export interface InfluencerSummary {
  id: string; // Justify DB ID
  name: string | null; // From InsightIQProfile.full_name or name
  handle: string | null; // From InsightIQProfile.platform_username
  avatarUrl: string | null; // From InsightIQProfile.image_url
  platforms: PlatformEnum[]; // Assumes mapping logic exists based on InsightIQProfile.work_platform.name or separate source
  followersCount: number | null; // From InsightIQProfile.reputation.follower_count
  justifyScore: number | null; // Calculated by Justify backend
  isVerified: boolean;
  primaryAudienceLocation?: string | null; // Possibly derived from InsightIQDemographicsAttributes.countries
  primaryAudienceAgeRange?: string | null; // Possibly derived from InsightIQDemographicsAttributes.gender_age_distribution
  primaryAudienceGender?: 'Male' | 'Female' | 'Other' | 'Mixed' | null; // Possibly derived from InsightIQDemographicsAttributes.gender_age_distribution
  engagementRate?: number | null; // Possibly derived from InsightIQProfile.reputation.engagementRate or ContentEngagement
  audienceQualityIndicator?: 'High' | 'Medium' | 'Low' | null; // Logic TBD based on available InsightIQ metrics (e.g., follower types)
  insightiqUserId?: string | null; // Added for internal linking
}

/**
 * Detailed audience demographic data, aligned with InsightIQGetAudienceResponse.
 */
export interface AudienceDemographics extends InsightIQDemographicsAttributes {
  // Inherits countries, cities, gender_age_distribution from InsightIQ type
  // Add any Justify-specific derived fields if needed
}

/**
 * Detailed engagement metrics, aligned with InsightIQ schemas.
 */
export interface EngagementMetrics {
  // Potentially derived from InsightIQProfile.reputation or InsightIQContentEngagement
  averageLikes?: number | null;
  averageComments?: number | null;
  averageViews?: number | null;
  averageShares?: number | null;
  // Add other relevant metrics derived from InsightIQ data
}

/**
 * Full data required for the influencer profile page.
 * Combines summary data with specific details likely from InsightIQProfile and InsightIQGetAudienceResponse.
 */
export interface InfluencerProfileData extends InfluencerSummary {
  bio?: string | null; // From InsightIQProfile.introduction
  contactEmail?: string | null; // From InsightIQProfile.emails (needs logic to find WORK email)
  audienceDemographics?: AudienceDemographics | null; // Populated from GET /v1/audience or similar
  engagementMetrics?: EngagementMetrics | null; // Populated/derived from relevant InsightIQ data
  // Add other fields based on InsightIQProfile as needed (e.g., website, category)
  website?: string | null; // From InsightIQProfile.website
  category?: string | null; // From InsightIQProfile.category
}
