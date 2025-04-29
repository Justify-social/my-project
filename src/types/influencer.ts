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

/**
 * Core data needed for displaying influencers in lists/cards.
 * Reflects MVP data points and addresses Kelly P. needs (verification, score, audience).
 */
export interface InfluencerSummary {
  id: string; // Justify DB ID
  name: string;
  handle: string;
  avatarUrl: string;
  platforms: PlatformEnum[]; // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  followersCount: number; // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  justifyScore: number | null; // Calculated by Justify backend (Ticket 1.9)
  isPhylloVerified: boolean; // From Phyllo Identity API via Justify Backend
  primaryAudienceLocation?: string; // Optional for summary. e.g., "United States" // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  primaryAudienceAgeRange?: string; // Optional for summary. e.g., "25-34" // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  primaryAudienceGender?: 'Male' | 'Female' | 'Other' | 'Mixed'; // Optional for summary // TODO: Confirm exact source, structure & enum values from Phyllo Profile Analytics
  engagementRate?: number; // Optional for summary, e.g., 3.5 (%) // TODO: Confirm exact source & structure from Phyllo Profile Analytics or Engagement Metrics API
  audienceQualityIndicator?: 'High' | 'Medium' | 'Low'; // Optional for summary. Simple flag based on Phyllo follower quality analysis // TODO: Confirm exact source, structure & logic from Phyllo Profile Analytics
  // TODO: Consider adding a 'lastRefreshedAt' timestamp if backend signals Phyllo data staleness?
}

/**
 * Detailed audience demographic data.
 */
export interface AudienceDemographics {
  ageDistribution?: Record<string, number>; // e.g., { '18-24': 25, '25-34': 45, ... } // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  genderDistribution?: Record<string, number>; // e.g., { 'Female': 65, 'Male': 30, ... } // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  locationDistribution?: Record<string, number>; // e.g., { 'USA': 40, 'UK': 20, ... } // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  // TODO: Add other relevant MVP demographics if needed (e.g., top interests array?) - Requires BE support & Phyllo source confirmation
}

/**
 * Detailed engagement metrics.
 */
export interface EngagementMetrics {
  averageLikes?: number; // TODO: Confirm exact source & structure from Phyllo Profile Analytics or Engagement Metrics API
  averageComments?: number; // TODO: Confirm exact source & structure from Phyllo Profile Analytics or Engagement Metrics API
  // TODO: Add other relevant MVP metrics if needed - Requires BE support & Phyllo source confirmation
}

/**
 * Full data required for the influencer profile page.
 */
export interface InfluencerProfileData extends InfluencerSummary {
  bio?: string | null; // TODO: Confirm exact source & structure from Phyllo Profile Analytics
  contactEmail?: string | null; // Direct contact (Elevated Priority - Ticket 2.5). Requires BE support & source confirmation (Phyllo? Internal DB?).
  audienceDemographics?: AudienceDemographics | null;
  engagementMetrics?: EngagementMetrics | null;
  // TODO: Add other MVP fields like pastCampaignHighlights?: { campaignName: string; brandName: string }[]; - Requires BE support & source confirmation
  // TODO: Add brand safety flags/score post-MVP
}
