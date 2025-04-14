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
