# Enhanced Justify Influencer Marketplace Implementation Plan

## 1. User-Centric Framework

### 1.1 Primary User Personas

#### Brand Marketer Persona

```markdown
**Name:** Marketing Director Maya
**Role:** Digital Marketing Director at mid-sized D2C brand
**Goals:**

- Find authentic influencers who match brand values
- Minimize time spent vetting influencers
- Accurately measure campaign ROI
- Reduce risk of problematic influencer partnerships
  **Pain Points:**
- Overwhelmed by vanity metrics
- Difficulty assessing true audience alignment
- Concerned about brand safety risks
- Struggles to measure true campaign impact
```

#### Influencer Persona

```markdown
**Name:** Content Creator Chris
**Role:** Lifestyle and wellness content creator
**Goals:**

- Find brands aligned with personal values
- Showcase authentic audience engagement
- Demonstrate campaign effectiveness
- Maintain professional reputation
  **Pain Points:**
- Being overlooked due to follower count
- Difficulty highlighting engagement quality
- Limited tools to demonstrate past performance
- No standardized safety verification system
```

### 1.2 User Journey Maps

#### Brand Journey

```typescript
// src/types/journeys.ts
export interface BrandUserJourney {
  phases: [
    {
      name: 'Discovery';
      touchpoints: [
        'MarketplaceEntryPoint',
        'SearchInterface',
        'FilterPanel',
        'JustifyScoreOverview',
      ];
      decisions: [
        'Platform selection',
        'Audience targeting',
        'Budget allocation',
        'Score threshold',
      ];
      metrics: [
        'Time to discovery',
        'Filter usage rate',
        'Search refinements',
        'Score filter usage',
      ];
    },
    {
      name: 'Evaluation';
      touchpoints: [
        'InfluencerProfile',
        'RiskAssessment',
        'AudienceAnalysis',
        'JustifyScoreDetail',
      ];
      decisions: [
        'Alignment evaluation',
        'Risk tolerance',
        'Performance projection',
        'Score component analysis',
      ];
      metrics: [
        'Profile view duration',
        'Safety tool usage',
        'Comparison frequency',
        'Score component clicks',
      ];
    },
    {
      name: 'Campaign Setup';
      touchpoints: ['CampaignWizard', 'InfluencerAssignment', 'BriefCreation'];
      decisions: ['Campaign structure', 'Influencer selection', 'Content requirements'];
      metrics: ['Completion rate', 'Time to setup', 'Brief clarity score'];
    },
    {
      name: 'Negotiation';
      touchpoints: ['NegotiationPanel', 'OfferCreation', 'TermsReview', 'MessageExchange'];
      decisions: ['Initial offer', 'Response to counteroffers', 'Final terms acceptance'];
      metrics: [
        'Time to agreement',
        'Offer acceptance rate',
        'Message response time',
        'Negotiation satisfaction',
      ];
    },
    {
      name: 'Management';
      touchpoints: ['CampaignDashboard', 'ContentApproval', 'Messaging'];
      decisions: ['Content feedback', 'Timeline adjustments', 'Performance optimization'];
      metrics: ['Response time', 'Revision requests', 'Task completion rate'];
    },
    {
      name: 'Analysis';
      touchpoints: ['ResultsDashboard', 'ROICalculator', 'ExportTools'];
      decisions: ['Performance evaluation', 'Future strategy', 'Budget allocation'];
      metrics: ['Report generation', 'Data export frequency', 'Insight application'];
    },
  ];
}
```

#### Influencer Journey

```typescript
// src/types/journeys.ts
export interface InfluencerUserJourney {
  phases: [
    {
      name: 'Onboarding';
      touchpoints: [
        'ProfileCreation',
        'PlatformConnection',
        'SafetyVerification',
        'JustifyScoreExplanation',
      ];
      decisions: [
        'Profile completeness',
        'Platform selection',
        'Verification level',
        'Score improvement goals',
      ];
      metrics: [
        'Completion rate',
        'Time to verify',
        'Profile strength score',
        'Score improvement tips viewed',
      ];
    },
    {
      name: 'Discovery';
      touchpoints: ['OpportunityFeed', 'BrandProfiles', 'CampaignAlerts'];
      decisions: ['Brand alignment', 'Campaign fit', 'Effort estimation'];
      metrics: ['Browse duration', 'Application rate', 'Match quality'];
    },
    {
      name: 'Application';
      touchpoints: [
        'CampaignApplicationForm',
        'PortfolioSelector',
        'RateProposal',
        'ViewCampaignOffers',
        'NegotiateTerms',
      ];
      decisions: [
        'Content proposal',
        'Rate setting',
        'Timeline commitment',
        'Offer acceptance',
        'Counter-proposal',
      ];
      metrics: [
        'Application completion',
        'Proposal quality score',
        'Response rate',
        'Negotiation success rate',
      ];
    },
    {
      name: 'Execution';
      touchpoints: ['ContentCreationTools', 'BriefAccess', 'SubmissionPortal'];
      decisions: ['Content approach', 'Compliance check', 'Delivery timing'];
      metrics: ['On-time delivery', 'Brief adherence', 'Content quality score'];
    },
    {
      name: 'Performance';
      touchpoints: [
        'MetricsDashboard',
        'PortfolioBuilder',
        'FeedbackReview',
        'JustifyScoreTracking',
      ];
      decisions: [
        'Performance analysis',
        'Portfolio update',
        'Growth strategy',
        'Score improvement tactics',
      ];
      metrics: [
        'Dashboard engagement',
        'Performance improvement',
        'Repeat booking rate',
        'Justify score growth',
      ];
    },
  ];
}
```

## 1.3 Front-End-First Development Strategy

This plan prioritizes building a fully functional front-end using mock data and placeholder components before implementing the back-end. This approach allows for:

1. **Rapid UI Development:** Quickly build and test the interface without waiting for API endpoints
2. **Early User Feedback:** Get stakeholder input on visual designs and user flows early
3. **Parallel Development:** Front-end and back-end teams can work simultaneously
4. **Seamless Transition:** Mock data structures mirror real data schemas for easy API integration later

The development will follow these principles:

- Build UI components with mock data that matches expected API responses
- Create a mock service layer that simulates API calls
- Implement state management using the same patterns that will connect to real APIs
- Design component props and interfaces that anticipate real data requirements

This approach ensures we can visualize the marketplace quickly while laying a foundation for robust back-end integration.

## 2. Enhanced Data Architecture

### 2.1 Expanded Data Models

#### 2.1.1 Enhanced Influencer Interface

```typescript
// src/types/influencer.ts
export interface InfluencerExtended extends Influencer {
  // Professional information
  professionalProfile: {
    specialties: string[];
    industries: string[];
    yearsOfExperience: number;
    languages: string[];
    brandValues: string[];
    contentStyle: string[];
  };

  // Extended audience metrics
  enhancedAudienceMetrics: {
    realFollowersPercentage: number;
    audienceGrowthRate: number;
    audienceRetentionRate: number;
    followerActivity: {
      dailyActive: number;
      weeklyActive: number;
      monthlyActive: number;
    };
    interestAffinities: {
      [category: string]: number;
    };
    brandAffinities: {
      [brand: string]: number;
    };
    sentimentAnalysis: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };

  // Content performance
  contentAnalytics: {
    topPerformingCategories: string[];
    contentConsistency: number;
    postFrequency: number;
    averageResponseTime: number;
    contentQualityScore: number;
    formatPerformance: {
      [format: string]: {
        engagementRate: number;
        reachRate: number;
        conversionRate?: number;
      };
    };
  };

  // Compliance and brand safety
  complianceData: {
    contentPolicies: {
      disclosureCompliance: boolean;
      regulatoryAdherence: boolean;
      contentGuidelineAdherence: boolean;
    };
    contentRestrictions: string[];
    controversyHistory: {
      incidents: number;
      resolutionRate: number;
      lastIncident?: string;
    };
    prohibitedCategories: string[];
    industryRestrictionsStatus: {
      alcohol: 'Compliant' | 'Non-compliant' | 'N/A';
      gambling: 'Compliant' | 'Non-compliant' | 'N/A';
      pharmaceuticals: 'Compliant' | 'Non-compliant' | 'N/A';
      financialServices: 'Compliant' | 'Non-compliant' | 'N/A';
    };
  };

  // Justify specific metrics
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
    benchmarkComparison: {
      industryAverage: number;
      percentileRanking: number;
      peersComparison: number;
    };
  };

  // Collaboration history
  collaborationHistory: {
    totalCampaigns: number;
    successRate: number;
    brandSatisfactionAverage: number;
    repeatCollaborationRate: number;
    deliveryReliabilityScore: number;
    pastCollaborations: Array<{
      brandId: string;
      campaignId: string;
      date: string;
      performanceRating: number;
      category: string;
    }>;
    testimonials: Array<{
      brandId: string;
      text: string;
      rating: number;
      date: string;
    }>;
  };

  // Financial and commercial
  commercialTerms: {
    rateCard: {
      [contentType: string]: {
        baseRate: number;
        currencyType: string;
        negotiable: boolean;
      };
    };
    paymentTerms: string;
    exclusivityRequirements: string[];
    rightsDuration: string;
    availabilityCalendar: {
      unavailableDates: string[];
      preferredLeadTime: number; // in days
      maxSimultaneousCampaigns: number;
    };
  };
}
```

#### 2.1.2 Enhanced Campaign Interface

```typescript
// src/types/campaign.ts
export interface CampaignExtended extends Campaign {
  // Extended campaign properties
  campaignStrategy: {
    marketingObjectives: string[];
    targetAudienceDetailed: {
      psychographics: string[];
      behaviors: string[];
      purchaseIntent: string[];
      customerSegment: string[];
    };
    campaignTheme: string;
    creativeGuidelines: {
      brandTone: string;
      visualRequirements: string[];
      contentDos: string[];
      contentDonts: string[];
      requiredHashtags: string[];
      requiredMentions: string[];
      contentReviewProcess: string;
    };
    competitiveDifferentiators: string[];
  };

  // Enhanced deliverables
  enhancedDeliverables: {
    contentPlan: Array<{
      contentType: string;
      platform: string;
      format: string;
      quantity: number;
      schedule: Array<{
        dueDate: string;
        publishDate: string;
        contentDescription: string;
      }>;
      creative: {
        theme: string;
        keyMessages: string[];
        visualStyle: string;
        callToAction: string;
      };
    }>;
    approvalWorkflow: {
      stakeholders: string[];
      approvalStages: string[];
      estimatedTurnaround: number; // in hours
      revisionAllowance: number;
    };
    contentRights: {
      usageDuration: string;
      permittedChannels: string[];
      territorialRestrictions: string[];
      repurposingRights: boolean;
    };
  };

  // Enhanced performance tracking
  performanceTracking: {
    kpiTargets: {
      [kpiName: string]: {
        target: number;
        priority: number;
        description: string;
      };
    };
    attributionModel: string;
    trackingMechanics: {
      utmParameters: {
        source: string;
        medium: string;
        campaign: string;
        term?: string;
        content?: string;
      };
      conversionPixels?: string[];
      promoCode?: string;
      customTracking?: string;
    };
    benchmarks: {
      industryAverage?: number;
      pastCampaignsAverage?: number;
      competitorEstimate?: number;
    };
    reportingSchedule: {
      frequency: string;
      recipients: string[];
      metrics: string[];
      visualizations: string[];
    };
  };

  // Budget and payment details
  financialDetails: {
    budgetBreakdown: {
      influencerFees: number;
      productionCosts: number;
      additionalExpenses: number;
      contingency: number;
    };
    paymentSchedule: Array<{
      milestone: string;
      amount: number;
      dueDate: string;
      status: 'Pending' | 'Paid' | 'Overdue';
    }>;
    costPerEngagement: number;
    costPerAcquisition: number;
    roi: {
      target: number;
      actual?: number;
      calculation: string;
    };
  };

  // Risk management
  riskManagement: {
    contractualSafeguards: string[];
    contentApprovalRights: string;
    crisisResponsePlan: string;
    complianceRequirements: {
      disclosureRequirements: string[];
      regulatoryGuidelines: string[];
      industrySpecificRules: string[];
    };
    liabilityLimitations: string;
    insuranceRequirements: string[];
  };

  // Negotiation details
  negotiationDetails: {
    status: 'pending' | 'in_progress' | 'accepted' | 'rejected' | 'completed';
    offerHistory: Array<{
      id: string;
      date: string;
      fromParty: 'brand' | 'influencer';
      rate: number;
      deliverables: string[];
      terms: string[];
      expirationDate: string;
      status: 'pending' | 'accepted' | 'rejected' | 'countered';
      notes?: string;
    }>;
    currentOffer?: string; // ID of the current active offer
    negotiations: Array<{
      influencerId: string;
      status: 'not_started' | 'in_progress' | 'completed';
      startDate?: string;
      completionDate?: string;
      messagesCount: number;
      lastActivity: string;
    }>;
  };
}
```

### 2.2 Database Indexing Strategy

```typescript
// src/db/indexing-schema.ts
export const influencerIndexes = [
  {
    name: 'influencer_search',
    fields: ['name', 'username', 'bio', 'specialties', 'industries'],
    type: 'text',
    weights: {
      name: 10,
      username: 8,
      bio: 5,
      specialties: 7,
      industries: 6,
    },
  },
  {
    name: 'justify_score',
    fields: ['justifyMetrics.justifyScore'],
    type: 'numeric',
  },
  {
    name: 'audience_geo',
    fields: ['audienceMetrics.demographics.location'],
    type: 'geo',
  },
  {
    name: 'platform_compound',
    fields: ['platform', 'audienceMetrics.engagement'],
    type: 'compound',
  },
  {
    name: 'risk_assessment',
    fields: ['riskAssessment.score'],
    type: 'numeric',
  },
];

export const campaignIndexes = [
  {
    name: 'campaign_search',
    fields: ['name', 'objectives', 'targetAudience.interests'],
    type: 'text',
  },
  {
    name: 'campaign_date_range',
    fields: ['startDate', 'endDate'],
    type: 'date',
  },
  {
    name: 'campaign_budget',
    fields: ['budget'],
    type: 'numeric',
  },
  {
    name: 'campaign_status_compound',
    fields: ['status', 'startDate'],
    type: 'compound',
  },
  {
    name: 'negotiation_status',
    fields: ['negotiationDetails.status'],
    type: 'keyword',
  },
];
```

### 2.3 Mock Data Models for Front-End Development

To enable rapid front-end development, we'll implement mock data models that mirror the structure of expected API responses. These models will be used during initial development and gradually replaced with real API data.

#### 2.3.1 Mock Influencer Data

```typescript
// src/data/mock/influencers.ts
export const mockInfluencers = [
  {
    id: 'inf-1',
    name: 'Emily Carter',
    username: '@emilycarter',
    bio: 'Lifestyle & wellness influencer sharing tips on healthy living, travel, and fashion.',
    avatar: '/mock/avatars/emily-carter.jpg',
    platform: 'Instagram',
    followers: 125000,
    tier: 'Gold',
    justifyMetrics: {
      justifyScore: 83,
      scoreComponents: {
        audienceRelevance: 78,
        engagementQuality: 82,
        contentAuthenticity: 75,
        brandSafetyRating: 90,
        performanceConsistency: 70,
      },
      historicalScoreTrend: [
        { date: '2023-01-01', score: 72 },
        { date: '2023-02-01', score: 74 },
        { date: '2023-03-01', score: 76 },
        { date: '2023-04-01', score: 79 },
        { date: '2023-05-01', score: 83 },
      ],
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { '18-24': 25, '25-34': 45, '35-44': 20, '45+': 10 },
        genderSplit: { female: 65, male: 30, other: 5 },
        topLocations: { 'United States': 40, 'United Kingdom': 20, Australia: 15 },
      },
      engagement: {
        rate: 3.2,
        averageLikes: 1200,
        averageComments: 85,
        averageShares: 25,
      },
    },
    safetyMetrics: {
      riskScore: 15,
      lastAssessmentDate: '2023-04-15',
      complianceStatus: 'compliant',
    },
  },
  {
    id: 'inf-2',
    name: 'Michael Green',
    username: '@mikethehiker',
    bio: 'Outdoor adventure and travel content creator. Passionate about sustainability.',
    avatar: '/mock/avatars/michael-green.jpg',
    platform: 'YouTube',
    followers: 350000,
    tier: 'Silver',
    justifyMetrics: {
      justifyScore: 76,
      scoreComponents: {
        audienceRelevance: 72,
        engagementQuality: 75,
        contentAuthenticity: 82,
        brandSafetyRating: 73,
        performanceConsistency: 78,
      },
      historicalScoreTrend: [
        { date: '2023-01-01', score: 70 },
        { date: '2023-02-01', score: 72 },
        { date: '2023-03-01', score: 74 },
        { date: '2023-04-01', score: 75 },
        { date: '2023-05-01', score: 76 },
      ],
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { '18-24': 15, '25-34': 40, '35-44': 30, '45+': 15 },
        genderSplit: { female: 35, male: 60, other: 5 },
        topLocations: { 'United States': 35, Canada: 25, Germany: 15 },
      },
      engagement: {
        rate: 5.8,
        averageLikes: 8500,
        averageComments: 420,
        averageShares: 150,
      },
    },
    safetyMetrics: {
      riskScore: 22,
      lastAssessmentDate: '2023-03-20',
      complianceStatus: 'warning',
    },
  },
  {
    id: 'inf-3',
    name: 'Sarah Johnson',
    username: '@sarahcooks',
    bio: 'Food blogger and recipe developer specializing in healthy, quick meals for busy families.',
    avatar: '/mock/avatars/sarah-johnson.jpg',
    platform: 'Instagram',
    followers: 89000,
    tier: 'Bronze',
    justifyMetrics: {
      justifyScore: 79,
      scoreComponents: {
        audienceRelevance: 85,
        engagementQuality: 77,
        contentAuthenticity: 80,
        brandSafetyRating: 85,
        performanceConsistency: 68,
      },
      historicalScoreTrend: [
        { date: '2023-01-01', score: 76 },
        { date: '2023-02-01', score: 75 },
        { date: '2023-03-01', score: 77 },
        { date: '2023-04-01', score: 78 },
        { date: '2023-05-01', score: 79 },
      ],
    },
    audienceMetrics: {
      demographics: {
        ageRanges: { '18-24': 10, '25-34': 55, '35-44': 25, '45+': 10 },
        genderSplit: { female: 75, male: 20, other: 5 },
        topLocations: { 'United States': 55, Canada: 15, Australia: 10 },
      },
      engagement: {
        rate: 4.1,
        averageLikes: 3600,
        averageComments: 250,
        averageShares: 85,
      },
    },
    safetyMetrics: {
      riskScore: 12,
      lastAssessmentDate: '2023-04-05',
      complianceStatus: 'compliant',
    },
  },
];
```

#### 2.3.2 Mock Campaign Data

```typescript
// src/data/mock/campaigns.ts
export const mockCampaigns = [
  {
    id: 'camp-1',
    name: 'Summer Fitness Challenge',
    brand: 'ActiveLife Nutrition',
    status: 'active',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    budget: 25000,
    objectives: ['Brand Awareness', 'Engagement', 'Product Launch'],
    targetAudience: {
      interests: ['fitness', 'nutrition', 'wellness'],
      ageRange: ['18-34'],
      platforms: ['Instagram', 'TikTok'],
    },
    assignedInfluencers: ['inf-1', 'inf-3'],
    negotiationDetails: {
      status: 'in_progress',
      offerHistory: [
        {
          id: 'offer-1',
          date: '2023-05-15',
          fromParty: 'brand',
          rate: 1500,
          deliverables: ['3 Feed Posts', '5 Stories', '1 Reel'],
          terms: ['Content Usage Rights: 6 months', 'No Competing Brands: 30 days'],
          expirationDate: '2023-05-22',
          status: 'pending',
        },
      ],
      currentOffer: 'offer-1',
      negotiations: [
        {
          influencerId: 'inf-1',
          status: 'in_progress',
          startDate: '2023-05-15',
          messagesCount: 3,
          lastActivity: '2023-05-16',
        },
      ],
    },
  },
  {
    id: 'camp-2',
    name: 'Eco-Friendly Product Launch',
    brand: 'GreenEarth',
    status: 'planning',
    startDate: '2023-07-15',
    endDate: '2023-09-15',
    budget: 35000,
    objectives: ['Product Launch', 'Sales', 'User-Generated Content'],
    targetAudience: {
      interests: ['sustainability', 'eco-friendly', 'outdoor activities'],
      ageRange: ['25-45'],
      platforms: ['Instagram', 'YouTube'],
    },
    assignedInfluencers: ['inf-2'],
    negotiationDetails: {
      status: 'pending',
      offerHistory: [],
      negotiations: [],
    },
  },
  {
    id: 'camp-3',
    name: 'Holiday Recipe Series',
    brand: 'GourmetKitchen',
    status: 'draft',
    startDate: '2023-11-01',
    endDate: '2023-12-31',
    budget: 18000,
    objectives: ['Brand Awareness', 'Content Creation', 'Community Building'],
    targetAudience: {
      interests: ['cooking', 'recipes', 'food', 'family'],
      ageRange: ['25-54'],
      platforms: ['Instagram', 'TikTok', 'Pinterest'],
    },
    assignedInfluencers: [],
    negotiationDetails: {
      status: 'not_started',
      offerHistory: [],
      negotiations: [],
    },
  },
];
```

#### 2.3.3 Mock Negotiation Data

```typescript
// src/data/mock/negotiations.ts
export const mockNegotiations = [
  {
    id: 'neg-1',
    campaignId: 'camp-1',
    influencerId: 'inf-1',
    status: 'in_progress',
    messages: [
      {
        id: 'msg-1',
        sender: 'brand',
        text: "Hi Emily, we're excited to work with you on the Summer Fitness Challenge campaign. We've sent an initial offer for your review.",
        timestamp: '2023-05-15T10:30:00Z',
        read: true,
      },
      {
        id: 'msg-2',
        sender: 'influencer',
        text: "Thanks for reaching out! The campaign looks great. I've reviewed the offer and would like to discuss the deliverables a bit more.",
        timestamp: '2023-05-15T14:45:00Z',
        read: true,
      },
      {
        id: 'msg-3',
        sender: 'brand',
        text: 'Of course! What aspects of the deliverables would you like to discuss?',
        timestamp: '2023-05-16T09:15:00Z',
        read: true,
      },
    ],
    offers: [
      {
        id: 'offer-1',
        date: '2023-05-15T10:30:00Z',
        fromParty: 'brand',
        rate: 1500,
        deliverables: ['3 Feed Posts', '5 Stories', '1 Reel'],
        terms: ['Content Usage Rights: 6 months', 'No Competing Brands: 30 days'],
        expirationDate: '2023-05-22T23:59:59Z',
        status: 'pending',
      },
    ],
    suggestedRate: {
      min: 1200,
      max: 1800,
      recommended: 1500,
    },
  },
];
```

#### 2.3.4 Mock User Subscription Data

```typescript
// src/data/mock/subscriptions.ts
export const mockSubscription = {
  planId: 'free',
  planName: 'Free',
  features: {
    influencerMarketplace: true,
    justifyScoreBasic: true,
    influencerComparison: true,
    campaignManagement: true,
    advancedAnalytics: false,
    brandLiftMeasurement: false,
    creativeAssetTesting: false,
    influencerSafety: false,
    mixedMediaModels: false,
  },
  limits: {
    influencerSearches: {
      limit: 50,
      used: 12,
      remaining: 38,
    },
    campaignsPerMonth: {
      limit: 2,
      used: 1,
      remaining: 1,
    },
    influencersPerCampaign: {
      limit: 5,
      used: 0,
      remaining: 5,
    },
  },
  expirationDate: null,
};
```

## 3. Expanded Technical Architecture

### 3.1 Enhanced File Directory Structure

```
src/
├── app/
│   ├── influencer-marketplace/
│   │   ├── page.tsx                         # Main marketplace listing page
│   │   ├── marketplace-components/
│   │   │   ├── MarketplaceInstructions.tsx  # Usage guidance for brands
│   │   │   ├── TierExplainer.tsx            # Explain tier system
│   │   │   └── ScoreEducation.tsx           # Educational content about Justify score
│   │   ├── [id]/
│   │   │   ├── page.tsx                     # Individual influencer profile
│   │   │   ├── performance/
│   │   │   │   └── page.tsx                 # Performance metrics deep dive
│   │   │   ├── audience/
│   │   │   │   └── page.tsx                 # Audience analysis deep dive
│   │   │   ├── content/
│   │   │   │   └── page.tsx                 # Content portfolio view
│   │   │   ├── history/
│   │   │   │   └── page.tsx                 # Collaboration history view
│   │   │   └── safety/
│   │   │       └── page.tsx                 # Safety assessment page
│   ├── influencer-portal/                   # Influencer-facing views
│   │   ├── page.tsx                         # Influencer dashboard
│   │   ├── profile/
│   │   │   └── page.tsx                     # Profile management for influencers
│   │   ├── opportunities/
│   │   │   └── page.tsx                     # Available campaign opportunities
│   │   ├── campaigns/
│   │   │   └── page.tsx                     # Active/past campaign view for influencers
│   │   └── analytics/
│   │       └── page.tsx                     # Performance analytics for influencers
│   ├── campaigns/
│   │   ├── page.tsx                         # Campaign listing page
│   │   ├── new/
│   │   │   ├── page.tsx                     # Campaign creation wizard
│   │   │   ├── objectives/                  # Campaign wizard step pages
│   │   │   ├── targeting/
│   │   │   ├── content/
│   │   │   ├── influencers/
│   │   │   └── review/
│   │   └── [id]/
│   │       ├── page.tsx                     # Campaign details page
│   │       ├── performance/
│   │       │   └── page.tsx                 # Performance tracking
│   │       ├── influencers/
│   │       │   └── page.tsx                 # Campaign influencer management
│   │       ├── content/
│   │       │   └── page.tsx                 # Content review and approval
│   │       ├── negotiation/
│   │       │   └── page.tsx                 # Negotiation interface for campaign offers
│   │       └── contracts/
│   │           └── page.tsx                 # Contract management
│   ├── safety-center/                       # Safety education and tools
│   │   ├── page.tsx                         # Safety center landing page
│   │   ├── risk-assessment/
│   │   │   └── page.tsx                     # Risk assessment tools
│   │   └── guidelines/
│   │       └── page.tsx                     # Safety guidelines
│   ├── reports/                             # Analytics and reporting
│   │   ├── page.tsx                         # Reports dashboard
│   │   ├── campaign-performance/
│   │   │   └── page.tsx                     # Campaign performance reports
│   │   ├── influencer-insights/
│   │   │   └── page.tsx                     # Influencer analytics
│   │   └── roi-analysis/
│   │       └── page.tsx                     # ROI analytics
│   └── layout.tsx                           # Shared layout with navigation
```

### 3.2 Expanded API Services

#### 3.2.1 Comprehensive Influencer Service

```typescript
// src/services/influencer/api.ts
export const influencerService = {
  // Discovery and Search
  getInfluencers: async (filters?: InfluencerFilters) => {...},
  getInfluencerById: async (id: string) => {...},
  searchInfluencers: async (query: string, filters?: InfluencerFilters) => {...},
  getRecommendedInfluencers: async (campaignId: string) => {...},
  getTrendingInfluencers: async (category?: string) => {...},

  // Safety and Compliance
  getInfluencerSafety: async (id: string) => {...},
  getComplianceHistory: async (id: string) => {...},
  runRiskAssessment: async (id: string) => {...},
  getSecurityScore: async (id: string) => {...},
  getContentModerationStatus: async (id: string) => {...},

  // Audience and Analytics
  getInfluencerMetrics: async (id: string, timeframe: string) => {...},
  getAudienceDemographics: async (id: string) => {...},
  getEngagementAnalytics: async (id: string, contentType?: string) => {...},
  getPerformanceBenchmarks: async (id: string, industry?: string) => {...},
  getAudienceOverlap: async (influencerIds: string[]) => {...},

  // Management and Status
  updateInfluencerStatus: async (id: string, status: InfluencerStatus) => {...},
  requestVerification: async (id: string, documents: File[]) => {...},
  updateInfluencerTier: async (id: string, tier: string) => {...},
  getCollaborationHistory: async (id: string) => {...},

  // Justification and Scoring
  getJustifyScoreBreakdown: async (id: string) => {...},
  getJustifyScoreHistory: async (id: string, period: string) => {...},
  simulateJustifyScoreImpact: async (id: string, hypotheticalChanges: JustifyScoreImpactParams) => {...},
  getScoreComponentDetails: async (id: string, component: string) => {...},
  getScoreImprovementTips: async (id: string) => {...},

  // Influencer-specific methods
  updateInfluencerProfile: async (id: string, profileData: Partial<Influencer>) => {...},
  getAvailableCampaignOpportunities: async (id: string) => {...},
  applyToCampaign: async (influencerId: string, campaignId: string, application: CampaignApplication) => {...},
  getInfluencerEarnings: async (id: string, timeframe?: string) => {...},
  getContentPerformanceStats: async (id: string) => {...}
};
```

#### 3.2.2 Comprehensive Campaign Service

```typescript
// src/services/campaign/api.ts
export const campaignService = {
  // Core Campaign CRUD
  getCampaigns: async (filters?: CampaignFilters) => {...},
  getCampaignById: async (id: string) => {...},
  createCampaign: async (campaign: CampaignInput) => {...},
  updateCampaign: async (id: string, updates: Partial<CampaignInput>) => {...},
  deleteCampaign: async (id: string) => {...},

  // Campaign setup and management
  saveAsDraft: async (campaign: Partial<CampaignInput>) => {...},
  publishCampaign: async (id: string) => {...},
  pauseCampaign: async (id: string, reason?: string) => {...},
  reactivateCampaign: async (id: string) => {...},
  duplicateCampaign: async (id: string, modifications?: Partial<CampaignInput>) => {...},

  // Influencer management
  addInfluencerToCampaign: async (campaignId: string, influencerId: string) => {...},
  removeInfluencerFromCampaign: async (campaignId: string, influencerId: string) => {...},
  getMatchedInfluencers: async (campaignId: string, matchCriteria?: MatchCriteria) => {...},
  getInfluencerApplications: async (campaignId: string) => {...},
  respondToApplication: async (applicationId: string, response: ApplicationResponse) => {...},

  // Negotiation management
  submitOffer: async (campaignId: string, influencerId: string, offerDetails: OfferDetails) => {...},
  respondToOffer: async (offerId: string, response: 'accept' | 'reject' | 'counter', counterOffer?: OfferDetails) => {...},
  getNegotiationHistory: async (campaignId: string, influencerId: string) => {...},
  getCurrentOfferStatus: async (offerId: string) => {...},
  sendNegotiationMessage: async (campaignId: string, influencerId: string, message: string) => {...},

  // Performance and analytics
  getCampaignPerformance: async (id: string) => {...},
  getCampaignROI: async (id: string) => {...},
  getInfluencerPerformanceInCampaign: async (campaignId: string, influencerId: string) => {...},
  getCampaignAudienceInsights: async (id: string) => {...},
  forecastCampaignResults: async (campaignData: CampaignForecastParams) => {...},

  // Content and approvals
  getContentCalendar: async (campaignId: string) => {...},
  getContentSubmissions: async (campaignId: string, status?: ContentStatus) => {...},
  reviewContent: async (contentId: string, review: ContentReview) => {...},
  requestRevision: async (contentId: string, feedback: string) => {...},

  // Contracts and finances
  uploadContract: async (campaignId: string, file: File) => {...},
  generateContract: async (campaignId: string, influencerId: string, terms: ContractTerms) => {...},
  getSignedContracts: async (campaignId: string) => {...},
  recordPayment: async (campaignId: string, influencerId: string, payment: PaymentRecord) => {...},

  // Reporting and exports
  generateCampaignReport: async (campaignId: string, reportConfig: ReportConfig) => {...},
  exportCampaignData: async (campaignId: string, format: ExportFormat) => {...}
};
```

#### 3.2.3 Justify Scoring Service

```typescript
// src/services/scoring/justify-score.ts
export const justifyScoreService = {
  // Score calculation and management
  calculateJustifyScore: async (influencerId: string) => {...},
  getScoreComponentBreakdown: async (influencerId: string) => {...},
  getHistoricalScores: async (influencerId: string, period: string) => {...},
  getIndustryBenchmarks: async (category: string) => {...},

  // Scoring algorithm components
  evaluateAudienceQuality: async (influencerId: string) => {...},
  measureEngagementAuthenticity: async (influencerId: string) => {...},
  analyzeBrandAlignment: async (influencerId: string, brandId?: string) => {...},
  assessContentQuality: async (influencerId: string) => {...},
  evaluateBrandSafety: async (influencerId: string) => {...},

  // Score impact analysis
  simulateScoreImpact: async (influencerId: string, hypotheticalChanges: JustifyScoreImpactParams) => {...},
  getImprovementRecommendations: async (influencerId: string) => {...},
  compareScoreWithPeers: async (influencerId: string) => {...},
  getScoreTrends: async (influencerId: string) => {...},

  // Educational tools
  generateScoreExplanation: async (influencerId: string) => {...},
  getScoreFactors: async (influencerId: string) => {...}
};
```

#### 3.2.4 Mock Service Implementations for Front-End Development

To enable rapid front-end development without waiting for back-end APIs, we'll implement mock service layers that mirror the structure of the real services but return mock data.

```typescript
// src/services/mock/mockInfluencerService.ts
import { mockInfluencers } from '../../data/mock/influencers';

export const mockInfluencerService = {
  // Discovery and Search
  getInfluencers: async (filters?: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Apply basic filtering if filters are provided
    if (filters) {
      return mockInfluencers.filter(influencer => {
        if (filters.platform && influencer.platform !== filters.platform) return false;
        if (filters.tier && influencer.tier !== filters.tier) return false;
        if (filters.minScore && influencer.justifyMetrics.justifyScore < filters.minScore)
          return false;
        return true;
      });
    }

    return mockInfluencers;
  },

  getInfluencerById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInfluencers.find(influencer => influencer.id === id);
  },

  searchInfluencers: async (query: string, filters?: any) => {
    await new Promise(resolve => setTimeout(resolve, 700));

    // Simple search implementation for mock data
    const results = mockInfluencers.filter(influencer => {
      const searchFields = [influencer.name, influencer.username, influencer.bio].map(field =>
        field.toLowerCase()
      );

      return searchFields.some(field => field.includes(query.toLowerCase()));
    });

    // Apply filters if provided
    if (filters) {
      return results.filter(influencer => {
        if (filters.platform && influencer.platform !== filters.platform) return false;
        if (filters.tier && influencer.tier !== filters.tier) return false;
        if (filters.minScore && influencer.justifyMetrics.justifyScore < filters.minScore)
          return false;
        return true;
      });
    }

    return results;
  },

  // Justify Score
  getJustifyScoreBreakdown: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const influencer = mockInfluencers.find(i => i.id === id);
    return influencer?.justifyMetrics.scoreComponents;
  },

  getJustifyScoreHistory: async (id: string, period: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const influencer = mockInfluencers.find(i => i.id === id);
    return influencer?.justifyMetrics.historicalScoreTrend;
  },
};
```

```typescript
// src/services/mock/mockCampaignService.ts
import { mockCampaigns } from '../../data/mock/campaigns';
import { mockInfluencers } from '../../data/mock/influencers';

export const mockCampaignService = {
  // Core Campaign CRUD
  getCampaigns: async (filters?: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (filters) {
      return mockCampaigns.filter(campaign => {
        if (filters.status && campaign.status !== filters.status) return false;
        return true;
      });
    }

    return mockCampaigns;
  },

  getCampaignById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCampaigns.find(campaign => campaign.id === id);
  },

  createCampaign: async (campaign: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCampaign = {
      id: `camp-${mockCampaigns.length + 1}`,
      ...campaign,
      status: 'draft',
      assignedInfluencers: [],
      negotiationDetails: {
        status: 'not_started',
        offerHistory: [],
        negotiations: [],
      },
    };

    // In a real implementation, this would be added to the database
    // For mock purposes, we'll just return the new campaign object
    return newCampaign;
  },

  // Influencer management
  getMatchedInfluencers: async (campaignId: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const campaign = mockCampaigns.find(c => c.id === campaignId);

    if (!campaign) return [];

    // Simple matching algorithm for demonstration
    return mockInfluencers
      .filter(influencer => {
        // Check if influencer's audience interests overlap with campaign target
        const influencerInterests = influencer.audienceMetrics.demographics.topLocations;
        const targetInterests = campaign.targetAudience.interests;

        // For mock purposes, just return influencers not already assigned to this campaign
        return !campaign.assignedInfluencers.includes(influencer.id);
      })
      .map(influencer => ({
        ...influencer,
        matchScore: Math.floor(Math.random() * 30) + 70, // Random match score between 70-100
      }));
  },

  // Negotiation endpoints
  submitOffer: async (campaignId: string, influencerId: string, offerDetails: any) => {
    await new Promise(resolve => setTimeout(resolve, 700));

    // In a real implementation, this would update the database
    // For mock purposes, we'll just return a success response
    return {
      success: true,
      offerId: `offer-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
    };
  },

  getNegotiationHistory: async (campaignId: string, influencerId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Return mock negotiation data from the mockNegotiations array
    // In a real implementation, this would query the database
    return {
      messages: [
        {
          id: 'msg-1',
          sender: 'brand',
          text: 'Hi, we would like to invite you to our campaign.',
          timestamp: '2023-05-15T10:00:00Z',
          read: true,
        },
        {
          id: 'msg-2',
          sender: 'influencer',
          text: 'Thanks for reaching out! Can you share more details?',
          timestamp: '2023-05-15T14:30:00Z',
          read: true,
        },
      ],
      offers: [
        {
          id: 'offer-1',
          date: '2023-05-16T09:00:00Z',
          fromParty: 'brand',
          rate: 1500,
          deliverables: ['3 Posts', '2 Stories'],
          terms: ['Usage rights for 3 months'],
          status: 'pending',
        },
      ],
    };
  },
};
```

```typescript
// src/services/mock/mockNegotiationService.ts
import { mockNegotiations } from '../../data/mock/negotiations';

export const mockNegotiationService = {
  getNegotiationById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNegotiations.find(n => n.id === id);
  },

  sendMessage: async (negotiationId: string, message: string, sender: 'brand' | 'influencer') => {
    await new Promise(resolve => setTimeout(resolve, 400));

    // In a real implementation, this would update the database
    // For mock purposes, we'll just return a success response
    return {
      success: true,
      messageId: `msg-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
  },

  respondToOffer: async (
    offerId: string,
    response: 'accept' | 'reject' | 'counter',
    counterOffer?: any
  ) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real implementation, this would update the offer status in the database
    // For mock purposes, we'll just return a success response
    return {
      success: true,
      status: response,
      newOfferId: counterOffer ? `offer-${Math.floor(Math.random() * 1000)}` : undefined,
    };
  },
};
```

```typescript
// src/services/mock/mockSubscriptionService.ts
import { mockSubscription } from '../../data/mock/subscriptions';

export const mockSubscriptionService = {
  getCurrentSubscription: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockSubscription;
  },

  checkFeatureAccess: async (featureId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the feature is available in the current subscription
    const hasAccess = mockSubscription.features[featureId] === true;

    return {
      hasAccess,
      reason: hasAccess ? 'Available in your plan' : 'Upgrade required',
      upgradeOptions: hasAccess ? [] : ['basic', 'pro', 'enterprise'],
    };
  },

  getRemainingUsage: async (resourceId: string) => {
    await new Promise(resolve => setTimeout(resolve, 150));

    // Check remaining usage for the specified resource
    const resourceLimit = mockSubscription.limits[resourceId];

    return resourceLimit || { limit: 0, used: 0, remaining: 0 };
  },
};
```

## 4. Expanded Component Structure

### 4.1 Influencer Discovery Components

#### 4.1.1 Advanced Search and Filter Components

```typescript
// src/components/Influencers/AdvancedSearch/
interface AdvancedSearchProps {
  // Configuration
  initialFilters?: InfluencerFilters;
  allowedFilterTypes?: FilterType[];
  showSavedSearches?: boolean;
  maxSelectedFilters?: number;

  // Behavior
  onSearchSubmit: (query: string, filters: InfluencerFilters) => void;
  onSaveSearch?: (searchName: string, query: string, filters: InfluencerFilters) => void;
  onFilterChange?: (filters: InfluencerFilters) => void;

  // Appearance
  variant?: 'compact' | 'expanded';
  hideLabels?: boolean;
  customClasses?: {
    container?: string;
    searchInput?: string;
    filterSection?: string;
    filterItem?: string;
  };
}
```

#### 4.1.2 Marketplace List Components

```typescript
// src/components/Influencers/MarketplaceList/
interface MarketplaceListProps {
  // Data
  influencers: Influencer[];
  totalCount: number;
  isLoading: boolean;
  error?: Error;

  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };

  // Display options
  viewMode: 'grid' | 'list' | 'compact';
  sortOptions: {
    field: string;
    direction: 'asc' | 'desc';
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  };

  // Selection
  selectionMode?: 'single' | 'multiple' | 'none';
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;

  // Appearance and behavior
  showTierBadges?: boolean;
  showJustifyScore?: boolean;
  enableQuickView?: boolean;
  enableComparison?: boolean;
  enableSaveToShortlist?: boolean;
  animateEntrance?: boolean;

  // Event handlers
  onInfluencerClick: (id: string) => void;
  onCompare?: (ids: string[]) => void;
  onSaveToShortlist?: (id: string) => void;
}
```

### 4.2 Influencer Profile Components

#### 4.2.1 Justify Score Visualization

```typescript
// src/components/Influencers/metrics/JustifyScoreDisplay.tsx
interface JustifyScoreDisplayProps {
  // Core data
  score: number;
  previousScore?: number;
  components: {
    audienceRelevance: number;
    engagementQuality: number;
    contentAuthenticity: number;
    brandSafetyRating: number;
    performanceConsistency: number;
  };

  // Display options
  size: 'small' | 'medium' | 'large';
  showChange?: boolean;
  showComponents?: boolean;
  showExplanation?: boolean;
  colorCoding?: boolean;

  // Historical data
  historicalData?: Array<{ date: string; score: number }>;
  showTrend?: boolean;
  trendPeriod?: '7d' | '30d' | '90d' | 'ytd';

  // Benchmark data
  benchmarks?: {
    industryAverage?: number;
    peerAverage?: number;
    threshold?: number;
  };
  showBenchmarks?: boolean;

  // Interaction
  isInteractive?: boolean;
  onComponentClick?: (component: string) => void;
  onExplainRequest?: () => void;
}
```

#### 4.2.2 Audience Insight Components

```typescript
// src/components/Influencers/audience/AudienceInsights.tsx
interface AudienceInsightsProps {
  // Demographics data
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
    interests: Record<string, number>;
    languages: Record<string, number>;
    devices: Record<string, number>;
  };

  // Quality metrics
  qualityMetrics: {
    authenticityScore: number;
    engagementDistribution: {
      highlyEngaged: number;
      moderatelyEngaged: number;
      passiveFollowers: number;
    };
    followerGrowth: Array<{ date: string; count: number }>;
    followersVsEngagement: Array<{ date: string; followers: number; engagement: number }>;
  };

  // Brand relevance
  brandRelevance?: {
    overlapScore: number;
    matchedInterests: string[];
    audienceAffinityScore: number;
    potentialReach: number;
  };

  // Display options
  activeTab?: 'demographics' | 'quality' | 'relevance';
  visualizationTypes: {
    age: 'bar' | 'pie' | 'table';
    gender: 'pie' | 'bar' | 'donut';
    location: 'map' | 'bar' | 'table';
    interests: 'bubble' | 'bar' | 'wordCloud';
  };

  // Interaction
  onTabChange?: (tab: string) => void;
  onExport?: (format: 'pdf' | 'csv' | 'image') => void;
  onVisualizationTypeChange?: (metric: string, type: string) => void;
}
```

### 4.3 Safety and Risk Assessment Components

#### 4.3.1 Comprehensive Risk Dashboard

```typescript
// src/components/safety/RiskDashboard.tsx
interface RiskDashboardProps {
  // Risk data
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: {
    [factor: string]: {
      status: boolean | string;
      impact: 'Low' | 'Medium' | 'High';
      recommendation?: string;
    };
  };

  // Compliance data
  complianceStatus: {
    disclosureCompliance: boolean;
    platformPolicyAdherence: boolean;
    industryRegulations: boolean;
    contentGuidelines: boolean;
  };

  // Historical data
  historicalRisk: Array<{ date: string; score: number; level: string }>;
  incidentHistory?: Array<{
    date: string;
    type: string;
    description: string;
    resolution: string;
    impact: number;
  }>;

  // Brand safety
  contentAudit?: {
    inappropriateContentRisk: number;
    controversialTopics: string[];
    languageConcerns: string[];
    audienceSafetyMetrics: {
      minorPercentage: number;
      vulnerableGroupsPercentage: number;
    };
  };

  // Authentication & security
  securityMeasures: {
    twoFactorAuthentication: boolean;
    strongPassword: boolean;
    recentSecurityCheck: boolean;
    accountProtection: boolean;
    dataProtection: boolean;
  };

  // Display options
  showFactorDetails?: boolean;
  showRecommendations?: boolean;
  showHistoricalData?: boolean;

  // Interaction
  onFactorClick?: (factor: string) => void;
  onInitiateRemediation?: (factor: string) => void;
  onRequestVerification?: () => void;
  onGenerateReport?: () => void;
}
```

#### 4.3.2 Content Safety Analysis

```typescript
// src/components/safety/ContentSafetyAnalysis.tsx
interface ContentSafetyAnalysisProps {
  // Content sample analysis
  contentSamples: Array<{
    platform: string;
    url: string;
    date: string;
    safetyScore: number;
    flags: string[];
    categories: string[];
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    brandSafetyRisk: 'Low' | 'Medium' | 'High';
  }>;

  // Pattern analysis
  contentPatterns: {
    topicDistribution: Record<string, number>;
    sentimentTrend: Array<{ date: string; sentiment: number }>;
    languageAnalysis: {
      profanity: number;
      sensitivity: number;
      controversy: number;
    };
    visualContentSafety: {
      appropriateImageRate: number;
      brandGuidelines: number;
      qualityAssessment: number;
    };
  };

  // Industry compatibility
  industryCompatibility: {
    [industry: string]: {
      compatibility: number;
      concerns: string[];
      strengths: string[];
    };
  };

  // Display options
  sampleSize?: number;
  timeRange?: '30d' | '90d' | '6m' | '1y';
  platformFilter?: string[];

  // Interaction
  onSampleClick?: (sampleUrl: string) => void;
  onIndustrySelect?: (industry: string) => void;
  onTimeRangeChange?: (range: string) => void;
  onGenerateDeepAnalysis?: () => void;
}
```

### 4.4 Campaign Management Components (continued)

#### 4.4.1 Multi-step Campaign Wizard (continued)

```typescript
// src/components/campaigns/wizard/CampaignWizard.tsx
interface CampaignWizardProps {
  // Configuration
  initialData?: Partial<Campaign>;
  steps: Array<{
    id: string;
    label: string;
    optional?: boolean;
    component: React.ComponentType<any>;
  }>;

  // Validation
  validationSchema: Record<string, Yup.Schema>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;

  // Navigation
  allowSkipToSteps?: boolean;
  allowGoBack?: boolean;
  showStepProgress?: boolean;

  // Data and state
  campaign: Partial<Campaign>;
  activeStep: number;

  // Save options
  saveAsDraft?: boolean;
  autosaveInterval?: number; // in ms

  // Completion actions
  onComplete: (campaign: Campaign) => void;
  onSaveDraft?: (campaign: Partial<Campaign>) => void;

  // Navigation handlers
  onNextStep: () => void;
  onPrevStep: () => void;
  onStepSelect?: (step: number) => void;

  // Appearance
  layout?: 'horizontal' | 'vertical';
  size?: 'compact' | 'default' | 'large';
  showSummary?: boolean;
  showCostEstimate?: boolean;
}
```

#### 4.4.2 Influencer Selection and Management

```typescript
// src/components/campaigns/InfluencerSelectionManager.tsx
interface InfluencerSelectionManagerProps {
  // Campaign context
  campaignId: string;
  campaignObjectives: string[];
  campaignBudget: number;

  // Influencer data
  recommendedInfluencers: Influencer[];
  selectedInfluencers: SelectedInfluencer[];
  savedInfluencers?: Influencer[];

  // Selection options
  selectionMode: 'budget' | 'count' | 'unlimited';
  maxInfluencers?: number;
  maxBudget?: number;

  // Budget allocation
  budgetAllocationMode?: 'manual' | 'automatic' | 'tiered';
  budgetConstraints?: {
    minPerInfluencer?: number;
    maxPerInfluencer?: number;
    requiredReserve?: number;
  };

  // Display options
  showJustifyScore?: boolean;
  showAudienceMatch?: boolean;
  showROIEstimate?: boolean;
  showCostBreakdown?: boolean;

  // Organization options
  groupBy?: 'tier' | 'platform' | 'audience' | 'cost';
  sortBy?: 'justifyScore' | 'audienceSize' | 'engagement' | 'cost' | 'relevance';

  // Interaction handlers
  onInfluencerSelect: (influencer: Influencer, budget?: number) => void;
  onInfluencerRemove: (influencerId: string) => void;
  onBudgetUpdate: (influencerId: string, budget: number) => void;
  onSaveSelection: (selection: SelectedInfluencer[]) => void;
  onRequestMoreRecommendations?: () => void;
}
```

#### 4.4.3 Negotiation Panel Component

```typescript
// src/components/campaigns/NegotiationPanel.tsx
interface NegotiationPanelProps {
  // Negotiation context
  campaignId: string;
  influencerId: string;
  campaignName: string;
  influencerName: string;

  // Negotiation state
  negotiationStatus: 'not_started' | 'in_progress' | 'completed';
  currentOffer?: {
    id: string;
    fromParty: 'brand' | 'influencer';
    rate: number;
    deliverables: string[];
    terms: string[];
    expirationDate: string;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
  };
  offerHistory: Array<{
    id: string;
    date: string;
    fromParty: 'brand' | 'influencer';
    rate: number;
    deliverables: string[];
    terms: string[];
    expirationDate: string;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
  }>;

  // Messaging
  messages: Array<{
    id: string;
    sender: 'brand' | 'influencer';
    text: string;
    timestamp: string;
    attachment?: string;
    read: boolean;
  }>;

  // Initial offer details
  initialRate?: number;
  suggestedRate?: {
    min: number;
    max: number;
    recommended: number;
  };
  defaultDeliverables?: string[];
  defaultTerms?: string[];

  // Display options
  showRateHistory?: boolean;
  showMessageHistory?: boolean;
  allowAttachments?: boolean;

  // Interaction handlers
  onSubmitOffer: (offerDetails: OfferDetails) => void;
  onRespondToOffer: (
    offerId: string,
    response: 'accept' | 'reject' | 'counter',
    counterOffer?: OfferDetails
  ) => void;
  onSendMessage: (message: string, attachment?: File) => void;
  onCompleteNegotiation: () => void;
  onCancelNegotiation?: () => void;
}
```

### 4.5 Freemium Model Components

#### 4.5.1 Feature Access Manager

```typescript
// src/components/subscription/FeatureAccessManager.tsx
interface FeatureAccessManagerProps {
  // User subscription data
  currentPlan: 'free' | 'basic' | 'pro' | 'enterprise';
  featureAccess: Record<string, boolean>;
  featureUsage: Record<string, number>;
  featureLimits: Record<string, number>;

  // Feature being accessed
  featureId: string;
  featureContext?: any;

  // Display options
  upgradeMode: 'modal' | 'inline' | 'redirect';
  messageType: 'block' | 'warn' | 'inform';
  showUsage?: boolean;

  // Custom UI
  customMessages?: {
    limitReached?: string;
    upgradePrompt?: string;
    featureDescription?: string;
  };
  customComponents?: {
    limitReachedUI?: React.ComponentType<any>;
    upgradeButtonUI?: React.ComponentType<any>;
  };

  // Interaction handlers
  onUpgradeClick?: () => void;
  onRequestTrial?: () => void;
  onDismiss?: () => void;

  // Children represent the gated feature
  children: React.ReactNode;
}
```

#### 4.5.2 Premium Feature Showcase

```typescript
// src/components/subscription/PremiumFeatureShowcase.tsx
interface PremiumFeatureShowcaseProps {
  // Feature data
  featureId: string;
  featureName: string;
  featureDescription: string;
  includedInPlans: ('basic' | 'pro' | 'enterprise')[];

  // Visualization
  previewImage?: string;
  demoVideo?: string;
  benefits: string[];
  valueProposition: string;

  // Social proof
  testimonials?: Array<{
    quote: string;
    author: string;
    company: string;
    plan: string;
  }>;

  // Usage examples
  useCases: Array<{
    title: string;
    description: string;
    industry?: string;
    result?: string;
  }>;

  // Limited preview
  previewComponent?: React.ReactNode;
  previewData?: any;
  previewLimitations?: string[];

  // Conversion options
  ctaText: string;
  ctaHighlight?: string;
  showPricing?: boolean;
  offerTrial?: boolean;

  // Interaction handlers
  onCtaClick: () => void;
  onLearnMoreClick?: () => void;
  onDismiss?: () => void;
}
```

#### 4.5.3 Plan Comparison Table

```typescript
// src/components/subscription/PlanComparisonTable.tsx
interface PlanComparisonTableProps {
  // Plan data
  plans: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    billingPeriod: 'monthly' | 'annual';
    discountPercentage?: number;
    popularPlan?: boolean;
    features: Array<{
      name: string;
      included: boolean | string | number;
      highlighted?: boolean;
    }>;
  }>;

  // Current selection
  currentPlanId?: string;

  // Display options
  highlightedFeatures?: string[];
  showToggle?: boolean;
  defaultBillingPeriod?: 'monthly' | 'annual';
  compactMode?: boolean;

  // Customization
  ctaText?: string;
  customColumns?: string[];
  categoryGrouping?: Record<string, string[]>;

  // Interaction handlers
  onPlanSelect: (planId: string) => void;
  onBillingPeriodChange?: (period: 'monthly' | 'annual') => void;
  onFeatureInfoClick?: (featureName: string) => void;
}
```

## 5. Implementation Roadmap

The development of the Influencer Marketplace will follow a front-end-first approach, organized into strategic phases that prioritize UI development with mock data before full back-end integration.

### 5.1 Phase 1: Core UI Foundation & Mock Data Setup (Weeks 1-2)

- [ ] **Front-End Environment Setup**

  - Set up Next.js/React project structure
  - Configure TypeScript, ESLint, and testing tools
  - Establish component library integration (using existing UI components)
  - Set up Storybook for component development

- [ ] **Mock Data Implementation**

  - Create mock influencer data models
  - Create mock campaign data models
  - Create mock negotiation data models
  - Create mock subscription data models

- [ ] **Mock Service Layer**

  - Implement mock influencer service
  - Implement mock campaign service
  - Implement mock negotiation service
  - Implement mock subscription service

- [ ] **Base Component Development**
  - Create basic layout components
  - Implement navigation structure
  - Build common UI elements (buttons, forms, cards)

### 5.2 Phase 2: Marketplace UI & Discovery Experience (Weeks 3-4)

- [ ] **Influencer Discovery Interface**

  - Implement influencer search and filtering UI
  - Create influencer cards and list views
  - Build advanced filtering components
  - Implement sorting and pagination

- [ ] **Influencer Profile UI**

  - Build detailed profile view components
  - Create profile tabs for different information sections
  - Implement content samples display
  - Build audience demographics visualizations

- [ ] **Justify Score Visualization**
  - Implement score display components
  - Create score breakdown visualizations
  - Build comparative metrics displays
  - Implement historical performance charts

### 5.3 Phase 3: Campaign & Negotiation UI (Weeks 5-6)

- [ ] **Campaign Management Interface**

  - Build campaign dashboard UI
  - Implement campaign creation wizard
  - Create campaign detail views
  - Implement campaign analytics displays

- [ ] **Negotiation Interface**

  - Create negotiation panel components
  - Implement messaging UI
  - Build offer creation and display components
  - Implement negotiation status tracking

- [ ] **Freemium Features UI**
  - Implement feature access controls
  - Create subscription tier displays
  - Build upgrade prompts and CTAs
  - Implement feature preview components

### 5.4 Phase 4: Back-End Services & API Development (Weeks 7-8)

- [ ] **Database Implementation**

  - Set up database schemas
  - Implement data models
  - Create migrations
  - Establish database indexing

- [ ] **API Endpoints Development**

  - Implement influencer discovery endpoints
  - Create campaign management endpoints
  - Build negotiation service endpoints
  - Implement subscription management endpoints

- [ ] **Authentication & Authorization**
  - Implement user authentication
  - Create role-based access controls
  - Set up API key management
  - Implement subscription-based feature gating

### 5.5 Phase 5: Integration & Front-End Refactoring (Weeks 9-10)

- [ ] **Service Layer Integration**

  - Refactor mock services to use real APIs
  - Implement error handling for API calls
  - Add loading states for asynchronous operations
  - Create fallback mechanisms for API failures

- [ ] **Data Migration**

  - Transfer mock data to production database
  - Validate data integrity
  - Implement data seeding for testing
  - Create data backup procedures

- [ ] **Performance Optimization**
  - Implement API response caching
  - Optimize component rendering
  - Implement lazy loading for heavy components
  - Fine-tune database queries

### 5.6 Phase 6: Testing & Refinement (Weeks 11-12)

- [ ] **Comprehensive Testing**

  - Conduct unit testing for all components
  - Perform integration testing
  - Execute end-to-end testing of key user flows
  - Complete accessibility testing

- [ ] **User Experience Refinement**

  - Conduct usability testing
  - Refine interaction patterns
  - Optimize user flows
  - Implement user feedback mechanisms

- [ ] **Documentation & Training**

  - Create technical documentation
  - Develop user guides
  - Prepare training materials
  - Document API endpoints

- [ ] **Deployment Preparation**
  - Set up CI/CD pipelines
  - Configure monitoring tools
  - Establish logging systems
  - Create rollback procedures

## 6. Back-End Integration Preparation

The front-end-first approach requires careful planning for a smooth transition to real back-end services. This section outlines the strategy for moving from mock data to live APIs.

### 6.1 Service Layer Architecture

We'll use a service abstraction layer pattern to facilitate the transition from mock to real APIs:

```typescript
// src/services/influencer/index.ts
import { mockInfluencerService } from '../mock/mockInfluencerService';
import { apiInfluencerService } from './apiInfluencerService';

// This flag will be controlled by environment variables or feature flags
const USE_REAL_API = process.env.USE_REAL_API === 'true';

// Export the appropriate service implementation
export const influencerService = USE_REAL_API ? apiInfluencerService : mockInfluencerService;
```

This pattern allows us to:

1. Start development using mock data
2. Implement real API services in parallel
3. Switch between mock and real data during testing
4. Gradually transition to real APIs feature by feature

### 6.2 API Integration Checklist

When transitioning from mock to real data, follow this checklist for each feature:

1. **Implement API endpoint** - Create the back-end API endpoint
2. **Create API service** - Develop the real API service that follows the same interface as the mock service
3. **Test API service** - Verify the API service returns data in the expected format
4. **Update service index** - Configure the service index to use the real API
5. **Handle error states** - Update components to handle API errors and loading states
6. **Validate data format** - Ensure the API returns data in the same format as mock data
7. **Update tests** - Update unit and integration tests to use real API (with proper mocking)

Example integration test for the influencer service:

```typescript
// tests/services/influencerService.test.ts
import { apiInfluencerService } from '../../src/services/influencer/apiInfluencerService';

describe('Influencer API Service', () => {
  it('should fetch influencers with correct filtering', async () => {
    const filters = { platform: 'Instagram', minScore: 70 };
    const result = await apiInfluencerService.getInfluencers(filters);

    expect(result.length).toBeGreaterThan(0);
    result.forEach(influencer => {
      expect(influencer.platform).toBe('Instagram');
      expect(influencer.justifyMetrics.justifyScore).toBeGreaterThanOrEqual(70);
    });
  });

  it('should fetch influencer details by ID', async () => {
    const influencerId = 'test-influencer-id';
    const result = await apiInfluencerService.getInfluencerById(influencerId);

    expect(result).not.toBeNull();
    expect(result.id).toBe(influencerId);
  });
});
```

### 6.3 Back-End Implementation Tasks

#### 6.3.1 Database Schema Implementation

```sql
-- Example schema for influencers table
CREATE TABLE influencers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(255),
  platform VARCHAR(50) NOT NULL,
  followers INTEGER NOT NULL,
  tier VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example schema for justify_metrics table
CREATE TABLE justify_metrics (
  id UUID PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  justify_score INTEGER NOT NULL,
  audience_relevance INTEGER NOT NULL,
  engagement_quality INTEGER NOT NULL,
  content_authenticity INTEGER NOT NULL,
  brand_safety_rating INTEGER NOT NULL,
  performance_consistency INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional tables would be created for campaigns, negotiations, etc.
```

#### 6.3.2 API Endpoint Implementation Plan

The following endpoints will need to be implemented for the core functionality:

**Influencer Endpoints:**

- `GET /api/influencers` - List influencers with filtering
- `GET /api/influencers/:id` - Get influencer details
- `GET /api/influencers/:id/justify-score` - Get Justify Score details
- `GET /api/influencers/:id/audience` - Get audience demographics
- `GET /api/influencers/:id/content` - Get content metrics
- `GET /api/influencers/:id/safety` - Get safety metrics

**Campaign Endpoints:**

- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create a campaign
- `PUT /api/campaigns/:id` - Update a campaign
- `GET /api/campaigns/:id/influencers` - Get influencers assigned to a campaign
- `POST /api/campaigns/:id/influencers` - Assign influencers to a campaign

**Negotiation Endpoints:**

- `GET /api/negotiations/:id` - Get negotiation details
- `POST /api/negotiations/:id/messages` - Send a message
- `POST /api/negotiations/:id/offers` - Submit an offer
- `PUT /api/negotiations/offers/:id` - Respond to an offer

#### 6.3.3 Authentication and Authorization

Authentication and authorization will be implemented using JWT tokens with the following roles:

- `brand-user` - Brand marketer with standard permissions
- `brand-admin` - Brand administrator with advanced permissions
- `influencer` - Influencer with access to their own profile
- `admin` - System administrator

### 6.4 Testing Strategy for API Integration

1. **Unit Testing** - Test individual components with mock API responses
2. **Integration Testing** - Test API services against real endpoints
3. **End-to-End Testing** - Test complete workflows using Cypress or similar tools

Example integration test for the influencer service:

```typescript
// tests/services/influencerService.test.ts
import { apiInfluencerService } from '../../src/services/influencer/apiInfluencerService';

describe('Influencer API Service', () => {
  it('should fetch influencers with correct filtering', async () => {
    const filters = { platform: 'Instagram', minScore: 70 };
    const result = await apiInfluencerService.getInfluencers(filters);

    expect(result.length).toBeGreaterThan(0);
    result.forEach(influencer => {
      expect(influencer.platform).toBe('Instagram');
      expect(influencer.justifyMetrics.justifyScore).toBeGreaterThanOrEqual(70);
    });
  });

  it('should fetch influencer details by ID', async () => {
    const influencerId = 'test-influencer-id';
    const result = await apiInfluencerService.getInfluencerById(influencerId);

    expect(result).not.toBeNull();
    expect(result.id).toBe(influencerId);
  });
});
```

### 6.5 Data Migration Plan

When moving from development to production, follow this data migration plan:

1. **Seed Database** - Populate the production database with initial data
2. **Migrate Mock Data** - Convert any valuable mock data to production data
3. **Verify Data Integrity** - Run validation scripts to ensure data integrity
4. **Back Up Data** - Create regular backups of production data
5. **Monitoring** - Implement monitoring for database performance and API usage

## 7. Testing and Quality Assurance

To ensure a robust and user-friendly implementation, comprehensive testing will be performed throughout development.

### 7.1 Front-End Testing Strategy

#### 7.1.1 Component Testing with Storybook

We'll use Storybook to develop and test UI components in isolation:

```typescript
// src/stories/JustifyScoreDisplay.stories.tsx
import { JustifyScoreDisplay } from '../components/Influencers/metrics/JustifyScoreDisplay';

export default {
  title: 'Components/Metrics/JustifyScoreDisplay',
  component: JustifyScoreDisplay,
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 100 } },
    trend: { control: { type: 'select', options: ['up', 'down', 'stable'] } },
    size: { control: { type: 'select', options: ['small', 'medium', 'large'] } }
  }
};

const Template = (args) => <JustifyScoreDisplay {...args} />;

export const Default = Template.bind({});
Default.args = {
  score: 78,
  previousScore: 72,
  trend: 'up',
  size: 'medium',
  components: {
    audienceRelevance: 75,
    engagementQuality: 80,
    contentAuthenticity: 78,
    brandSafetyRating: 85,
    performanceConsistency: 72
  }
};

export const Small = Template.bind({});
Small.args = {
  ...Default.args,
  size: 'small',
  showComponents: false
};

export const WithBenchmarks = Template.bind({});
WithBenchmarks.args = {
  ...Default.args,
  showBenchmarks: true,
  benchmarks: {
    industryAverage: 65,
    peerAverage: 70
  }
};
```

#### 7.1.2 User Flow Testing

We'll create comprehensive tests for key user flows using Cypress:

```typescript
// cypress/integration/influencer-discovery.spec.ts
describe('Influencer Discovery Flow', () => {
  beforeEach(() => {
    cy.visit('/influencer-marketplace');
  });

  it('should allow searching for influencers', () => {
    cy.get('[data-testid=search-input]').type('fitness');
    cy.get('[data-testid=search-button]').click();
    cy.get('[data-testid=influencer-card]').should('have.length.at.least', 1);
  });

  it('should filter influencers by platform', () => {
    cy.get('[data-testid=platform-filter]').click();
    cy.get('[data-testid=platform-option-instagram]').click();
    cy.get('[data-testid=influencer-card]').each($card => {
      cy.wrap($card).find('[data-testid=platform-badge]').should('contain', 'Instagram');
    });
  });

  it('should navigate to influencer profile', () => {
    cy.get('[data-testid=influencer-card]').first().click();
    cy.url().should('include', '/influencer-marketplace/');
    cy.get('[data-testid=justify-score-display]').should('exist');
  });
});
```

#### 7.1.3 Mock API Testing

We'll test component behavior with mock APIs during the front-end development phase:

```typescript
// tests/components/InfluencerCard.test.tsx
import { render, screen } from '@testing-library/react';
import { InfluencerCard } from '../../components/Influencers/InfluencerCard';
import { mockInfluencers } from '../../data/mock/influencers';

describe('InfluencerCard', () => {
  it('renders influencer information correctly', () => {
    const influencer = mockInfluencers[0];
    render(<InfluencerCard influencer={influencer} />);

    expect(screen.getByText(influencer.name)).toBeInTheDocument();
    expect(screen.getByText(`@${influencer.username}`)).toBeInTheDocument();
    expect(screen.getByText(influencer.platform)).toBeInTheDocument();
    expect(screen.getByTestId('justify-score')).toHaveTextContent(influencer.justifyMetrics.justifyScore.toString());
  });

  it('shows correct tier badge', () => {
    const influencer = mockInfluencers[0];
    render(<InfluencerCard influencer={influencer} />);

    const tierBadge = screen.getByTestId('tier-badge');
    expect(tierBadge).toHaveTextContent(influencer.tier);

    // Check for correct color based on tier
    if (influencer.tier === 'Gold') {
      expect(tierBadge).toHaveClass('bg-yellow-100');
    } else if (influencer.tier === 'Silver') {
      expect(tierBadge).toHaveClass('bg-gray-100');
    } else if (influencer.tier === 'Bronze') {
      expect(tierBadge).toHaveClass('bg-amber-100');
    }
  });
});
```

### 7.2 Back-End Testing Strategy

#### 7.2.1 API Endpoint Testing

We'll use Jest and Supertest to validate API endpoints:

```typescript
// tests/api/influencers.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDatabase, teardownTestDatabase } from '../utils/test-db';

describe('Influencer API Endpoints', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('GET /api/influencers should return a list of influencers', async () => {
    const response = await request(app)
      .get('/api/influencers')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    // Validate structure of returned influencers
    const influencer = response.body[0];
    expect(influencer).toHaveProperty('id');
    expect(influencer).toHaveProperty('name');
    expect(influencer).toHaveProperty('platform');
    expect(influencer).toHaveProperty('justifyMetrics');
  });

  it('GET /api/influencers/:id should return a single influencer', async () => {
    const influencerId = 'test-influencer-id';

    const response = await request(app)
      .get(`/api/influencers/${influencerId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', influencerId);
    expect(response.body).toHaveProperty('justifyMetrics');
    expect(response.body.justifyMetrics).toHaveProperty('justifyScore');
    expect(response.body.justifyMetrics).toHaveProperty('scoreComponents');
  });

  it('GET /api/influencers with filters should filter results', async () => {
    const response = await request(app)
      .get('/api/influencers')
      .query({ platform: 'Instagram', minScore: 70 })
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Verify all returned influencers match the filter criteria
    response.body.forEach(influencer => {
      expect(influencer.platform).toBe('Instagram');
      expect(influencer.justifyMetrics.justifyScore).toBeGreaterThanOrEqual(70);
    });
  });
});
```

#### 7.2.2 Database Testing

We'll test database models and queries using Jest:

```typescript
// tests/db/influencer-repository.test.ts
import { InfluencerRepository } from '../../src/repositories/influencer-repository';
import { setupTestDatabase, teardownTestDatabase } from '../utils/test-db';

describe('Influencer Repository', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should find influencers by platform', async () => {
    const repository = new InfluencerRepository();
    const influencers = await repository.findByPlatform('Instagram');

    expect(influencers.length).toBeGreaterThan(0);
    influencers.forEach(influencer => {
      expect(influencer.platform).toBe('Instagram');
    });
  });

  it('should calculate Justify Score correctly', async () => {
    const repository = new InfluencerRepository();
    const influencerId = 'test-influencer-id';
    const justifyScore = await repository.calculateJustifyScore(influencerId);

    expect(justifyScore).toBeGreaterThan(0);
    expect(justifyScore).toBeLessThanOrEqual(100);

    // Verify score components add up correctly (with potential weighting)
    const scoreComponents = await repository.getJustifyScoreComponents(influencerId);
    const weightedSum =
      scoreComponents.audienceRelevance * 0.25 +
      scoreComponents.engagementQuality * 0.25 +
      scoreComponents.contentAuthenticity * 0.2 +
      scoreComponents.brandSafetyRating * 0.2 +
      scoreComponents.performanceConsistency * 0.1;

    expect(Math.round(weightedSum)).toBe(justifyScore);
  });
});
```

### 7.3 Performance Testing

We'll implement performance testing to ensure the application can handle expected load:

#### 7.3.1 Front-End Performance

- Use Lighthouse for overall performance scoring
- Implement React.memo and useMemo for expensive components
- Optimize bundle size with code splitting
- Benchmark rendering performance for lists and complex visualizations

#### 7.3.2 API Performance

- Use k6 for load testing key API endpoints
- Benchmark database query performance
- Implement and test caching strategies
- Monitor response times across different endpoints

```javascript
// k6-tests/influencer-list.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  const response = http.get('https://api.justify.com/api/influencers', {
    headers: { Authorization: `Bearer ${__ENV.TEST_TOKEN}` },
  });

  check(response, {
    'status is 200': r => r.status === 200,
    'response time < 500ms': r => r.timings.duration < 500,
    'contains influencers': r => JSON.parse(r.body).length > 0,
  });

  sleep(1);
}
```

### 7.4 Accessibility Testing

We'll ensure the application is accessible to all users:

- Implement automated accessibility testing with axe
- Ensure proper keyboard navigation throughout the application
- Verify screen reader compatibility for core features
- Test color contrast for all UI components

```typescript
// tests/accessibility/marketplace.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { InfluencerMarketplace } from '../../src/app/influencer-marketplace/page';

expect.extend(toHaveNoViolations);

describe('Accessibility - Influencer Marketplace', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<InfluencerMarketplace />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

## 7. Implementation Progress

### Version: 1.6

**Last Updated: 2023-06-20**

#### Core Features Implemented:

- Influencer marketplace main page with filtering and search
- Influencer detail page
- Campaigns listing page
- Campaign detail page with multi-tab view (overview, influencers, content requirements, assets)
- Campaign creation workflow:
  - Step 1: Basic campaign information form
  - Step 2: Content requirements form with add/remove functionality
  - Step 3: Influencer selection with search, filtering, and budget allocation
  - Step 4: Review and launch page with summary of all steps

#### Components:

- `InfluencerCard` component for consistent display of influencer information
- `MarketplaceList` component for the main marketplace view
- Campaign creation wizard (steps 1-4) with:
  - Form validation and navigation
  - Content requirements management interface
  - Influencer selection interface with budget allocation
  - Summary review interface with editing capabilities
- Campaign detail page with:
  - Overview tab for campaign summary and quick actions
  - Influencers tab for managing campaign influencers
  - Content Requirements tab for viewing campaign deliverables
  - Creative Assets tab for managing campaign assets

#### UI Enhancements:

- Created a consistent card-based layout for influencers and campaigns
- Implemented responsive design for all pages
- Added multi-step wizard UI pattern for campaign creation
- Implemented tabbed interface for campaign details
- Created responsive forms that work well on different device sizes
- Applied the application's design system fonts, colors, and spacing
- Unified icon system throughout the components

#### Data Management:

- Defined type interfaces for influencers and campaigns
- Implemented mock service for data operations
- Created basic campaign data model
- Added content requirements data model
- Implemented influencer selection and budget allocation data model
- Added campaign detail retrieval and display logic

#### Bug Fixes/Optimizations:

- Added missing hostname for randomuser.me to Next.js image configuration
- Fixed platform icon inconsistencies across components
- Corrected type conflicts in the mock service implementation
- Fixed image loading issues and improved error handling
- Added loading states for data fetching operations

## Next Implementation Steps

### Enhanced Features

- Influencer messaging system
- Content approval workflow
- Analytics dashboard for campaign performance
- Contract management system

### API Integration

- Connect to real backend API endpoints
- Implement proper authentication for API requests
- Add real-time notification system

### Testing and Optimization

- Add comprehensive unit and integration tests
- Implement performance optimizations
- Add accessibility enhancements
- Conduct usability testing

---

**Document Version:** 1.6  
**Last Updated:** 2023-06-20  
**Key Contributors:** Digital Marketing Team, Product Development
