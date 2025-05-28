/**
 * 🎯 SINGLE SOURCE OF TRUTH - InsightIQ Data Extraction Utility
 *
 * MIT Professor Implementation - Centralizes ALL data extraction logic to eliminate
 * duplicate code and ensure 100% utilization of Profile Analytics API endpoints.
 *
 * Based on Airtable Profile Analytics API mapping:
 * https://airtable.com/apppMSWCtnGMdRkVJ/shr00d5XZfQKV778J/tblWWDq8IBworK515/viw6QWOBiRh0bjvY1
 */

import { InfluencerProfileData } from '@/types/influencer';
import { logger } from '@/utils/logger';

// 🏗️ **COMPREHENSIVE TYPE DEFINITIONS - SSOT**

export interface InsightIQExtractedData {
  // Trust & Authenticity (High Priority Analysis)
  trust: {
    credibilityScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    followerTypes: Array<{
      name: string;
      value: number;
      category: 'positive' | 'negative' | 'neutral';
    }>;
    significantFollowersPercentage: number;
    realFollowersPercentage: number;
    suspiciousFollowersPercentage: number;
    qualityFollowersPercentage: number;
    massFollowersPercentage: number;
    influencerFollowersPercentage: number;
    hasDetailedData: boolean;
    audienceQualityScore: number | null;
    suspiciousActivityIndicators: string[];
    platformVerificationDetails: {
      isVerified: boolean;
      verificationDate: string | null;
      verificationMethod: string | null;
    };
  };

  // Professional Intelligence (Background Check Analysis)
  professional: {
    contactDetails: Array<{
      type: string;
      value: string;
      category: 'email' | 'phone' | 'social' | 'website' | 'other';
    }>;
    emails: Array<{ type: string; email: string; isPrimary: boolean; verified: boolean }>;
    phoneNumbers: Array<{ type: string; number: string; country?: string; verified: boolean }>;
    addresses: Array<{
      type: string;
      address: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    }>;
    website: string | null;
    socialProfiles: Array<{
      platform: string;
      url: string;
      username: string;
      verified: boolean;
    }>;
    accountType: 'PERSONAL' | 'CREATOR' | 'BUSINESS' | 'UNKNOWN';
    verificationStatus: {
      isVerified: boolean;
      verifiedDate: string | null;
      verificationMethod: string | null;
    };
    location: {
      city: string | null;
      state: string | null;
      country: string | null;
      postalCode?: string;
      coordinates: {
        latitude: number | null;
        longitude: number | null;
      } | null;
      timezone: string | null;
    };
    accountAge: number | null;
    profileCompleteness: number;
  };

  // Performance Intelligence (Vetting Efficiency)
  performance: {
    engagement: {
      rate: number | null;
      averageLikes: number | null;
      averageComments: number | null;
      averageViews: number | null;
      averageReelsViews: number | null;
      averageShares: number | null;
      averageSaves: number | null;
      likesToCommentsRatio: number | null;
      peakEngagementHours: string[];
      engagementTrend: 'INCREASING' | 'STABLE' | 'DECREASING' | 'UNKNOWN';
    };
    sponsored: {
      performance: number | null;
      postsCount: number | null;
      totalSponsoredContent: number | null;
      sponsoredEngagementAverage: number | null;
      organicComparison: {
        sponsoredEngagement: number | null;
        organicEngagement: number | null;
        ratio: number | null;
        performance: 'BETTER' | 'WORSE' | 'SIMILAR' | 'UNKNOWN';
      };
      brandCollaborations: Array<{
        brandName: string;
        collaborationType: string;
        performance: number | null;
        date: string;
      }>;
      averageSponsoredLikes: number | null;
      averageSponsoredComments: number | null;
      sponsoredPerformanceRating: 'UNKNOWN' | 'POOR' | 'AVERAGE' | 'GOOD' | 'EXCELLENT';
    };
    reputation: {
      followerCount: number | null;
      followingCount: number | null;
      subscriberCount: number | null;
      contentCount: number | null;
      totalPostsCount: number | null;
      averagePostFrequency: number | null;
      followerToFollowingRatio: number | null;
      postToFollowerRatio: number | null;
    };
    trends: {
      reputationHistory: Array<{
        month: string;
        followerCount?: number;
        followingCount?: number;
        averageLikes?: number;
        subscriberCount?: number;
        engagementRate?: number;
      }>;
      engagementRateHistogram: Array<{
        band: { min: number; max: number };
        count: number;
      }>;
      growthMetrics: {
        followerGrowthRate: number | null;
        engagementGrowthRate: number | null;
        contentGrowthRate: number | null;
      };
      seasonalTrends: Array<{
        period: string;
        engagementMultiplier: number;
        optimalPostingTimes: string[];
      }>;
    };
  };

  // Content Intelligence
  content: {
    topContents: Array<{
      id: string;
      type: string;
      url?: string;
      caption?: string;
      likes: number;
      comments: number;
      shares?: number;
      saves?: number;
      date: string;
      performance: number;
      isSponsored: boolean;
    }>;
    recentContents: Array<{
      id: string;
      type: string;
      url?: string;
      caption?: string;
      likes: number;
      comments: number;
      saves?: number;
      date: string;
      hashtags: string[];
      mentions: string[];
    }>;
    sponsoredContents: Array<{
      id: string;
      brandName: string;
      type: string;
      performance: number;
      date: string;
      disclosureType: string;
    }>;
    contentAnalysis: {
      totalCount: number | null;
      hiddenLikesPercentage: number | null;
      performanceRanking: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'UNKNOWN';
      averageWordsPerPost: number | null;
      hashtagUsageFrequency: number | null;
      mentionUsageFrequency: number | null;
      contentTypeDistribution: Array<{
        type: string;
        percentage: number;
        avgPerformance: number;
      }>;
      postingFrequency: {
        daily: number | null;
        weekly: number | null;
        monthly: number | null;
        consistency: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
      };
    };
    strategy: {
      topHashtags: Array<{ name: string; usage: number; performance: number }>;
      topMentions: Array<{ name: string; frequency: number; type: string }>;
      topInterests: Array<{ name: string; relevance: number; category: string }>;
      contentThemes: Array<{ theme: string; frequency: number; engagement: number }>;
      brandMentions: Array<{ brand: string; frequency: number; sentiment: string }>;
    };
    qualityMetrics: {
      originalContentPercentage: number | null;
      highQualityImagePercentage: number | null;
      captionCompleteness: number | null;
      hashtagOptimization: number | null;
    };
  };

  // Audience Intelligence
  audience: {
    demographics: {
      countries: Array<{ code: string; name?: string; value: number; rank?: number }>;
      cities: Array<{ name: string; value: number; country?: string; rank?: number }>;
      genderAgeDistribution: Array<{
        gender: string;
        ageRange: string;
        value: number;
        interests?: string[];
      }>;
      ethnicities: Array<{ name: string; value: number; region?: string }>;
      languages: Array<{ code: string; name?: string; value: number; primary?: boolean }>;
      occupations: Array<{ name: string; value: number; industry?: string }>;
      incomeDistribution: Array<{ range: string; percentage: number }>;
      educationLevels: Array<{ level: string; percentage: number }>;
    };
    interests: Array<{
      name: string;
      value: number;
      category?: string;
      trendingScore?: number;
    }>;
    brandAffinity: Array<{
      name: string;
      value: number;
      category?: string;
      logoUrl?: string;
      industry?: string;
      priceRange?: string;
    }>;
    credibilityBand: Array<{
      min: number;
      max: number;
      totalProfileCount: number;
      percentile?: number;
    }>;
    likers: {
      significantLikersPercentage: number | null;
      credibilityScore: number | null;
      significantLikers: Array<{
        platformUsername: string;
        imageUrl?: string;
        isVerified?: boolean;
        followerCount?: number;
        influence: 'HIGH' | 'MEDIUM' | 'LOW';
        niche?: string;
      }>;
      countries: Array<{ code: string; value: number }>;
      cities: Array<{ name: string; value: number; country?: string }>;
      genderAgeDistribution: Array<{
        gender: string;
        ageRange: string;
        value: number;
      }>;
      ethnicities: Array<{ name: string; value: number }>;
      languages: Array<{ code: string; name?: string; value: number }>;
      brandAffinity: Array<{ name: string; value: number }>;
      interests: Array<{ name: string; value: number }>;
      averageEngagementOfLikers: number | null;
      likerGrowthRate: number | null;
    };
    behavior: {
      peakActivityHours: string[];
      deviceUsage: Array<{ device: string; percentage: number }>;
      platformCrossover: Array<{ platform: string; percentage: number }>;
      shoppingBehavior: {
        onlineShopping: number | null;
        brandLoyalty: number | null;
        purchaseInfluence: number | null;
      };
    };
  };

  // Brand Intelligence & Competitive Analysis
  brand: {
    lookalikes: Array<{
      platformUsername: string;
      imageUrl?: string;
      isVerified?: boolean;
      followerCount?: number;
      category?: string;
      similarityScore?: number;
      engagementRate?: number;
      averageLikes?: number;
      country?: string;
      niche?: string;
      collaborationPotential: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    creatorBrandAffinity: Array<{
      name: string;
      value: number;
      category?: string;
      logoUrl?: string;
      industry?: string;
      marketSegment?: string;
      collaborationHistory?: number;
    }>;
    significantFollowers: {
      platformUsername: string;
      imageUrl?: string;
      isVerified?: boolean;
      followerCount?: number;
      influence: 'HIGH' | 'MEDIUM' | 'LOW';
      industry?: string;
    } | null;
    marketPositioning: {
      industry: string | null;
      niche: string | null;
      competitiveRank: number | null;
      marketShare: number | null;
      uniqueValueProposition: string[];
    };
    collaborationHistory: Array<{
      brandName: string;
      campaignType: string;
      performance: number;
      duration: string;
      success: boolean;
    }>;
  };

  // Pricing Intelligence
  pricing: {
    currency: string | null;
    postTypes: Record<
      string,
      {
        min?: number;
        max?: number;
        average?: number;
        median?: number;
        lastUpdated?: string;
      }
    >;
    explanations: Record<
      string,
      {
        level: string;
        description: string;
        factors?: string[];
      }
    >;
    hasPricingData: boolean;
    marketComparison: {
      percentile: number | null;
      industryAverage: number | null;
      priceRange: 'BUDGET' | 'MID_RANGE' | 'PREMIUM' | 'LUXURY' | 'UNKNOWN';
    };
    pricingTrends: Array<{
      period: string;
      averageRate: number;
      trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    }>;
  };

  // Creator Demographics
  creator: {
    gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED' | null;
    ageGroup: string | null;
    estimatedAge: number | null;
    language: string | null;
    dateOfBirth: string | null;
    nationality: string | null;
    ethnicity: string | null;
    profession: string | null;
    expertise: string[];
    personalityTraits: Array<{
      trait: string;
      score: number;
      confidence: number;
    }>;
    contentStyle: {
      tone: string | null;
      visualStyle: string | null;
      postingPattern: string | null;
      authenticityScore: number | null;
    };
  };

  // Advanced Analytics
  advanced: {
    sentimentAnalysis: {
      overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
      sentimentScore: number | null;
      commentSentiment: number | null;
      brandMentionSentiment: number | null;
      controversyScore: number | null;
    };
    riskAssessment: {
      brandSafetyScore: number | null;
      contentAppropriateness: number | null;
      pastControversies: Array<{
        incident: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        date: string;
        resolved: boolean;
      }>;
      complianceScore: number | null;
    };
    predictiveMetrics: {
      growthProjection: number | null;
      engagementForecast: number | null;
      brandFitScore: number | null;
      campaignSuccessProbability: number | null;
    };
    crossPlatformData: Array<{
      platform: string;
      handle: string;
      followerCount: number;
      engagementRate: number;
      lastActive: string;
    }>;
  };

  // ✅ ADDED: Livestream Analytics (Twitch-specific)
  livestream: {
    metrics: {
      hoursWatched: number | null;
      peakViewers: number | null;
      averageViewers: number | null;
      airtime: number | null;
      daysStreamed: number | null;
    };
    followerGrowth: {
      percentage: number | null;
      count: number | null;
      perHour: number | null;
    };
    games: Array<{
      count: number;
      name: string;
      hoursWatched: number;
      hoursWatchedPercentage: number;
    }>;
    viewership: {
      totalLiveViewCount: number | null;
      uniqueViewers: number | null;
      authUniqueViewers: number | null;
    };
    estimatedAudience: {
      dailyAverage: number | null;
      averageViewDuration: number | null;
    };
    subscribers: {
      total: number | null;
      income: {
        min: number | null;
        max: number | null;
      };
      tierBreakdown: {
        paid: number | null;
        gifted: number | null;
        prime: number | null;
        tier1: number | null;
        tier2: number | null;
        tier3: number | null;
      };
    };
    chat: {
      totalMessages: number | null;
      activeChatters: number | null;
      dailyEngagementRate: number | null;
      messagesPerChatter: number | null;
    };
    bits: {
      totalBits: number | null;
      income: number | null;
    };
  };
}

// 🧮 **CORE EXTRACTION FUNCTIONS**

/**
 * Extract Trust & Authenticity Data - High Priority Analysis
 */
function extractTrustData(influencer: InfluencerProfileData): InsightIQExtractedData['trust'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const audienceData = insightiq?.audience;

  // InsightIQ credibility score - API returns percentage values directly
  const rawCredibilityScore = audienceData?.credibility_score || 0;
  const credibilityScore = Math.round(rawCredibilityScore); // ✅ FIXED: API already returns percentage (73 = 73%)

  const followerTypes = (audienceData?.follower_types || []).map((type: any) => ({
    name: type.name,
    value: type.value, // Keep as raw value for now
    category: getFollowerTypeCategory(type.name),
  }));

  // InsightIQ significant followers percentage - API returns percentage values directly
  const rawSignificantPercentage = audienceData?.significant_followers_percentage || 0;
  const significantFollowersPercentage = Math.round(rawSignificantPercentage); // ✅ FIXED: API already returns percentage

  // Extract specific follower percentages - these are typically decimals (0.6590)
  const realFollowersData = followerTypes.find((type: any) => type.category === 'positive');
  const suspiciousFollowersData = followerTypes.find((type: any) => type.category === 'negative');
  const qualityFollowersData = followerTypes.find((type: any) =>
    type.name?.toLowerCase().includes('quality')
  );
  const massFollowersData = followerTypes.find((type: any) =>
    type.name?.toLowerCase().includes('mass')
  );
  const influencerFollowersData = followerTypes.find((type: any) =>
    type.name?.toLowerCase().includes('influencer')
  );

  // Convert decimal values to percentages for display
  const realFollowersPercentage = realFollowersData
    ? Math.round(realFollowersData.value) // ✅ FIXED: API already returns percentages (65.9 = 65.9%)
    : 0;
  const suspiciousFollowersPercentage = suspiciousFollowersData
    ? Math.round(suspiciousFollowersData.value) // ✅ FIXED: API already returns percentages
    : 0;
  const qualityFollowersPercentage = qualityFollowersData
    ? Math.round(qualityFollowersData.value) // ✅ FIXED: API already returns percentages
    : 0;
  const massFollowersPercentage = massFollowersData
    ? Math.round(massFollowersData.value) // ✅ FIXED: API already returns percentages
    : 0;
  const influencerFollowersPercentage = influencerFollowersData
    ? Math.round(influencerFollowersData.value) // ✅ FIXED: API already returns percentages
    : 0;

  // Calculate risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (credibilityScore < 50 || suspiciousFollowersPercentage > 30) {
    riskLevel = 'HIGH';
  } else if (credibilityScore < 70 || suspiciousFollowersPercentage > 15) {
    riskLevel = 'MEDIUM';
  }

  // Audience quality score calculation
  const audienceQualityScore =
    audienceData?.audience_quality_score ||
    (credibilityScore > 0 ? Math.round((credibilityScore + realFollowersPercentage) / 2) : null);

  // Suspicious activity indicators
  const suspiciousActivityIndicators: string[] = [];
  if (suspiciousFollowersPercentage > 30)
    suspiciousActivityIndicators.push('High suspicious follower ratio');
  if (massFollowersPercentage > 20)
    suspiciousActivityIndicators.push('High mass followers detected');
  if (credibilityScore < 50) suspiciousActivityIndicators.push('Low credibility score');

  // Platform verification details
  const platformVerificationDetails = {
    isVerified: influencer.isVerified || false,
    verificationDate: insightiq?.profile?.verification_date || null,
    verificationMethod: insightiq?.profile?.verification_method || null,
  };

  return {
    credibilityScore,
    riskLevel,
    followerTypes,
    significantFollowersPercentage,
    realFollowersPercentage,
    suspiciousFollowersPercentage,
    qualityFollowersPercentage,
    massFollowersPercentage,
    influencerFollowersPercentage,
    hasDetailedData: Boolean(audienceData?.credibility_score && followerTypes.length > 0),
    audienceQualityScore,
    suspiciousActivityIndicators,
    platformVerificationDetails,
  };
}

// Helper function to return empty professional data structure for error cases
function getEmptyProfessionalData(): InsightIQExtractedData['professional'] {
  return {
    contactDetails: [],
    emails: [],
    phoneNumbers: [],
    addresses: [],
    website: null,
    socialProfiles: [],
    accountType: 'UNKNOWN',
    verificationStatus: {
      isVerified: false,
      verifiedDate: null,
      verificationMethod: null,
    },
    location: {
      city: null,
      state: null,
      country: null,
      coordinates: null,
      timezone: null,
    },
    accountAge: null,
    profileCompleteness: 0,
  };
}

/**
 * Extract Professional Intelligence Data - Background Checks
 */
function extractProfessionalData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['professional'] {
  // 🛡️ **ROBUST ERROR HANDLING**: Validate input data before processing
  if (!influencer || typeof influencer !== 'object') {
    console.warn('⚠️ CONTACT EXTRACTION: Invalid influencer data provided, using empty defaults');
    return getEmptyProfessionalData();
  }

  // Check if influencer has minimal required structure
  if (!influencer.id && !influencer.handle && !influencer.name) {
    console.warn('⚠️ CONTACT EXTRACTION: Incomplete influencer data, using empty defaults');
    return getEmptyProfessionalData();
  }

  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  // ✅ ENHANCED CONTACT DETAILS EXTRACTION - SSOT with comprehensive debugging
  // Extracts from ALL possible sources in the Airtable schema
  const contactDetails: Array<{
    type: string;
    value: string;
    category: 'email' | 'phone' | 'social' | 'website' | 'other';
  }> = [];

  // 🔍 **MIT-PROFESSOR-LEVEL DEBUGGING**: Comprehensive data structure analysis
  if (insightiq) {
    console.log('🔬 CONTACT EXTRACTION DEBUG: Full influencer object structure', {
      influencerKeys: Object.keys(influencer),
      hasInsightiq: !!insightiq,
      insightiqKeys: insightiq ? Object.keys(insightiq) : [],
      insightiqProfile: insightiq?.profile ? Object.keys(insightiq.profile) : [],
      directContactDetails: !!insightiq?.contact_details,
      contactDetailsLength: insightiq?.contact_details?.length || 0,
      profileContactDetails: !!insightiq?.profile?.contact_details,
      influencerContactDetails: !!(influencer as any).contact_details,
      rootContactDetails: !!(influencer as any).contact_details,
      // Check for alternative contact paths from Airtable schema
      profileWebsite: insightiq?.profile?.website,
      profileEmail: insightiq?.profile?.email,
      profilePhone: insightiq?.profile?.phone,
      businessContact: insightiq?.business,
    });
  }

  // 1. Primary source: Direct contact_details array (matches Airtable schema)
  const apiContactDetails = insightiq?.contact_details || [];
  console.log('📧 API Contact Details:', apiContactDetails);

  apiContactDetails.forEach((contact: any) => {
    if (contact && contact.value && contact.type) {
      console.log('✅ CONTACT FOUND:', contact);
      contactDetails.push({
        type: contact.type || 'UNKNOWN',
        value: contact.value,
        category: categorizeContactType(contact.type || ''),
      });
    }
  });

  // 2. Fallback: Check for contact_details at root level of influencer object
  const rootContactDetails = (influencer as any).contact_details || [];
  console.log('🌐 Root Contact Details:', rootContactDetails);

  rootContactDetails.forEach((contact: any) => {
    if (
      contact &&
      contact.value &&
      contact.type &&
      !contactDetails.find(c => c.value === contact.value)
    ) {
      console.log('✅ ROOT CONTACT FOUND:', contact);
      contactDetails.push({
        type: contact.type || 'UNKNOWN',
        value: contact.value,
        category: categorizeContactType(contact.type || ''),
      });
    }
  });

  // 🎯 **TARGETED EXTRACTION**: Direct field checking based on Airtable schema
  // According to Airtable: contact_details.type, contact_details.value

  // 3. Check if contact_details is at profile level
  const profileContactDetails = insightiq?.profile?.contact_details || [];
  console.log('👤 Profile Contact Details:', profileContactDetails);

  profileContactDetails.forEach((contact: any) => {
    if (
      contact &&
      contact.value &&
      contact.type &&
      !contactDetails.find(c => c.value === contact.value)
    ) {
      console.log('✅ PROFILE CONTACT FOUND:', contact);
      contactDetails.push({
        type: contact.type || 'UNKNOWN',
        value: contact.value,
        category: categorizeContactType(contact.type || ''),
      });
    }
  });

  // 4. Extract from known field patterns (website, email, phone directly)
  const directFieldExtractions = [
    { value: insightiq?.profile?.website, type: 'website' },
    { value: insightiq?.profile?.email, type: 'email' },
    { value: insightiq?.profile?.phone, type: 'phone' },
    { value: insightiq?.business?.website, type: 'business_website' },
    { value: insightiq?.business?.email, type: 'business_email' },
    { value: insightiq?.business?.phone, type: 'business_phone' },
    { value: influencer.website, type: 'influencer_website' },
    { value: (influencer as any).email, type: 'influencer_email' },
    { value: (influencer as any).contactEmail, type: 'contact_email' },
  ];

  directFieldExtractions.forEach(({ value, type }) => {
    if (value && !contactDetails.find(c => c.value === value)) {
      console.log(`✅ DIRECT FIELD FOUND (${type}):`, value);
      contactDetails.push({
        type,
        value,
        category: categorizeContactType(type),
      });
    }
  });

  // 3. Debug logging for contact details extraction
  if (contactDetails.length > 0) {
    console.log(
      `✅ CONTACT EXTRACTION: Found ${contactDetails.length} contact details for influencer`,
      contactDetails
    );
  } else {
    console.warn(
      `⚠️ CONTACT EXTRACTION: No contact details found for influencer ${influencer.handle || influencer.name || 'unknown'}. This may be expected for private accounts or limited data sharing.`
    );
  }

  // Enhanced email extraction from multiple sources with better fallbacks
  const emails: Array<{ type: string; email: string; isPrimary: boolean; verified: boolean }> = [];

  // 1. From profile.emails array (if exists)
  const profileEmails = insightiq?.profile?.emails || [];
  profileEmails.forEach((email: any) => {
    if (email && (email.email || email.address)) {
      emails.push({
        type: email.type || 'PROFILE',
        email: email.email || email.address,
        isPrimary: email.isPrimary || email.primary || false,
        verified: email.verified || email.isVerified || false,
      });
    }
  });

  // 2. From direct profile.email field
  if (insightiq?.profile?.email && !emails.find(e => e.email === insightiq.profile.email)) {
    emails.push({
      type: 'PRIMARY',
      email: insightiq.profile.email,
      isPrimary: true,
      verified: insightiq?.profile?.emailVerified || false,
    });
  }

  // 3. From top level email field (removed - influencer.email doesn't exist)
  // Check for any email field that might exist in influencer object
  const influencerEmailField = (influencer as any).contactEmail || (influencer as any).email;
  if (influencerEmailField && !emails.find(e => e.email === influencerEmailField)) {
    emails.push({
      type: 'CONTACT',
      email: influencerEmailField,
      isPrimary: emails.length === 0,
      verified: false,
    });
  }

  // 4. From contact_details array
  contactDetails.forEach((contact: { type: string; value: string; category: string }) => {
    if (
      contact.category === 'email' &&
      contact.value &&
      !emails.find(e => e.email === contact.value)
    ) {
      emails.push({
        type: contact.type || 'EXTRACTED',
        email: contact.value,
        isPrimary: emails.length === 0,
        verified: false,
      });
    }
  });

  // 5. From business contact fields
  if (insightiq?.business?.email && !emails.find(e => e.email === insightiq.business.email)) {
    emails.push({
      type: 'BUSINESS',
      email: insightiq.business.email,
      isPrimary: false,
      verified: insightiq?.business?.emailVerified || false,
    });
  }

  // Enhanced phone number extraction from multiple sources
  const phoneNumbers: Array<{ type: string; number: string; country?: string; verified: boolean }> =
    [];

  // 1. From profile.phone_numbers array
  const profilePhones = insightiq?.profile?.phone_numbers || insightiq?.profile?.phoneNumbers || [];
  profilePhones.forEach((phone: any) => {
    if (phone && (phone.phone_number || phone.number || phone.phoneNumber)) {
      phoneNumbers.push({
        type: phone.type || 'PROFILE',
        number: phone.phone_number || phone.number || phone.phoneNumber,
        country: phone.country || undefined,
        verified: phone.verified || phone.isVerified || false,
      });
    }
  });

  // 2. From direct profile.phone field
  if (insightiq?.profile?.phone && !phoneNumbers.find(p => p.number === insightiq.profile.phone)) {
    phoneNumbers.push({
      type: 'PRIMARY',
      number: insightiq.profile.phone,
      country: insightiq?.profile?.phone_country || undefined,
      verified: insightiq?.profile?.phoneVerified || false,
    });
  }

  // 3. From contact_details array
  contactDetails.forEach((contact: { type: string; value: string; category: string }) => {
    if (
      contact.category === 'phone' &&
      contact.value &&
      !phoneNumbers.find(p => p.number === contact.value)
    ) {
      phoneNumbers.push({
        type: contact.type || 'EXTRACTED',
        number: contact.value,
        country: undefined,
        verified: false,
      });
    }
  });

  // 4. From business contact fields
  if (
    insightiq?.business?.phone &&
    !phoneNumbers.find(p => p.number === insightiq.business.phone)
  ) {
    phoneNumbers.push({
      type: 'BUSINESS',
      number: insightiq.business.phone,
      country: insightiq?.business?.phone_country || undefined,
      verified: insightiq?.business?.phoneVerified || false,
    });
  }

  // Enhanced website extraction
  const websites: string[] = [];

  // Multiple website sources
  const websiteSources = [
    insightiq?.profile?.website,
    insightiq?.profile?.url,
    insightiq?.business?.website,
    influencer.website,
    insightiq?.profile?.external_url,
    insightiq?.profile?.blog_url,
  ].filter(Boolean);

  websiteSources.forEach(website => {
    if (website && !websites.includes(website)) {
      websites.push(website);
    }
  });

  // Enhanced social profiles extraction
  const socialProfiles: Array<{
    platform: string;
    username: string;
    url: string;
    verified: boolean;
  }> = [];

  // From social_profiles array
  const profileSocials = insightiq?.profile?.social_profiles || insightiq?.social_profiles || [];
  profileSocials.forEach((social: any) => {
    if (social && social.platform && (social.username || social.url)) {
      socialProfiles.push({
        platform: social.platform.toLowerCase(),
        username: social.username || extractUsernameFromUrl(social.url) || '',
        url: social.url || buildSocialUrl(social.platform, social.username),
        verified: social.verified || social.isVerified || false,
      });
    }
  });

  // From individual platform fields
  const platformMappings = [
    { field: 'instagram_username', platform: 'instagram', baseUrl: 'https://instagram.com/' },
    { field: 'twitter_username', platform: 'twitter', baseUrl: 'https://twitter.com/' },
    { field: 'tiktok_username', platform: 'tiktok', baseUrl: 'https://tiktok.com/@' },
    { field: 'youtube_username', platform: 'youtube', baseUrl: 'https://youtube.com/c/' },
    { field: 'facebook_username', platform: 'facebook', baseUrl: 'https://facebook.com/' },
    { field: 'linkedin_username', platform: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
  ];

  platformMappings.forEach(({ field, platform, baseUrl }) => {
    const username = insightiq?.profile?.[field];
    if (username && !socialProfiles.find(p => p.platform === platform)) {
      socialProfiles.push({
        platform,
        username,
        url: baseUrl + username,
        verified: insightiq?.profile?.[`${platform}_verified`] || false,
      });
    }
  });

  // Account type determination with enhanced logic
  const accountType =
    insightiq?.profile?.account_type ||
    insightiq?.account_type ||
    (insightiq?.profile?.is_business
      ? 'BUSINESS'
      : insightiq?.profile?.is_creator
        ? 'CREATOR'
        : 'PERSONAL');

  // Verification status with multiple checks
  const verificationStatus = {
    isVerified:
      influencer.isVerified || insightiq?.profile?.is_verified || insightiq?.verified || false,
    verifiedDate: insightiq?.profile?.verified_date || insightiq?.verified_date || null,
    verificationMethod: insightiq?.profile?.verification_method || 'PLATFORM',
  };

  // Enhanced location extraction
  const location = {
    city: insightiq?.profile?.city || insightiq?.location?.city || '',
    state: insightiq?.profile?.state || insightiq?.location?.state || '',
    country: insightiq?.profile?.country || insightiq?.location?.country || '',
    postalCode: insightiq?.profile?.postal_code || insightiq?.location?.postal_code || '',
    coordinates: {
      latitude: insightiq?.profile?.latitude || insightiq?.location?.latitude || null,
      longitude: insightiq?.profile?.longitude || insightiq?.location?.longitude || null,
    },
    timezone: insightiq?.profile?.timezone || insightiq?.location?.timezone || '',
  };

  // Account age calculation
  const accountCreated =
    insightiq?.profile?.created_at || insightiq?.profile?.account_created || null;
  const accountAge = accountCreated
    ? Math.floor((Date.now() - new Date(accountCreated).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    contactDetails,
    emails,
    phoneNumbers,
    addresses: [], // Addresses not provided in the new extraction logic
    website: websites[0] || '', // Primary website
    socialProfiles,
    accountType,
    verificationStatus,
    location,
    accountAge,
    profileCompleteness: calculateProfileCompleteness(
      emails,
      phoneNumbers,
      websites,
      socialProfiles,
      location
    ),
  };
}

// Helper functions for contact extraction
function categorizeContactType(type: string): 'email' | 'phone' | 'social' | 'website' | 'other' {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('email') || lowerType.includes('mail')) return 'email';
  if (lowerType.includes('phone') || lowerType.includes('tel') || lowerType.includes('mobile'))
    return 'phone';
  if (lowerType.includes('website') || lowerType.includes('url') || lowerType.includes('link'))
    return 'website';
  if (lowerType.includes('social') || lowerType.includes('profile')) return 'social';
  return 'other';
}

function extractUsernameFromUrl(url: string): string {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || '';
  } catch {
    return '';
  }
}

function buildSocialUrl(platform: string, username: string): string {
  const platformUrls: Record<string, string> = {
    instagram: 'https://instagram.com/',
    twitter: 'https://twitter.com/',
    tiktok: 'https://tiktok.com/@',
    youtube: 'https://youtube.com/c/',
    facebook: 'https://facebook.com/',
    linkedin: 'https://linkedin.com/in/',
  };

  const baseUrl = platformUrls[platform.toLowerCase()];
  return baseUrl ? baseUrl + username : '';
}

function calculateProfileCompleteness(
  emails: any[],
  phoneNumbers: any[],
  websites: string[],
  socialProfiles: any[],
  location: any
): number {
  let score = 0;
  const maxScore = 5;

  if (emails.length > 0) score += 1;
  if (phoneNumbers.length > 0) score += 1;
  if (websites.length > 0) score += 1;
  if (socialProfiles.length > 0) score += 1;
  if (location.city || location.country) score += 1;

  return Math.round((score / maxScore) * 100);
}

/**
 * Extract Performance Intelligence Data - Vetting Efficiency
 */
function extractPerformanceData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['performance'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  const engagement = {
    rate:
      influencer.engagementRate ??
      insightiq?.engagement_rate ??
      insightiq?.profile?.engagement_rate ??
      insightiq?.analytics?.engagement_rate ??
      insightiq?.metrics?.engagement_rate ??
      null,
    averageLikes:
      insightiq?.average_likes ??
      insightiq?.engagement?.averageLikes ??
      insightiq?.analytics?.average_likes ??
      insightiq?.metrics?.average_likes ??
      insightiq?.profile?.average_likes ??
      null,
    averageComments:
      insightiq?.average_comments ??
      insightiq?.engagement?.averageComments ??
      insightiq?.analytics?.average_comments ??
      insightiq?.metrics?.average_comments ??
      insightiq?.profile?.average_comments ??
      null,
    averageViews:
      insightiq?.average_views ??
      insightiq?.engagement?.averageViews ??
      insightiq?.analytics?.average_views ??
      insightiq?.metrics?.average_views ??
      insightiq?.profile?.average_views ??
      null, // ✅ FIXED: Use ?? to handle 0 values
    averageReelsViews:
      insightiq?.average_reels_views ??
      insightiq?.engagement?.averageReelsViews ??
      insightiq?.analytics?.average_reels_views ??
      insightiq?.metrics?.average_reels_views ??
      null,
    averageShares:
      insightiq?.average_shares ??
      insightiq?.engagement?.averageShares ??
      insightiq?.analytics?.average_shares ??
      insightiq?.metrics?.average_shares ??
      null,
    averageSaves:
      insightiq?.average_saves ??
      insightiq?.engagement?.averageSaves ??
      insightiq?.analytics?.average_saves ??
      insightiq?.metrics?.average_saves ??
      null,
    likesToCommentsRatio:
      insightiq?.engagement?.likes_to_comments_ratio ??
      insightiq?.analytics?.likes_comments_ratio ??
      insightiq?.metrics?.likes_comments_ratio ??
      null,
    peakEngagementHours:
      insightiq?.engagement?.peak_hours ??
      insightiq?.analytics?.peak_hours ??
      insightiq?.audience?.peak_activity_hours ??
      [],
    engagementTrend:
      insightiq?.engagement?.trend ??
      insightiq?.analytics?.engagement_trend ??
      insightiq?.trends?.engagement ??
      ('UNKNOWN' as const),
  };

  const sponsored = {
    performance: insightiq?.sponsored_posts_performance || null,
    postsCount: insightiq?.sponsored_contents?.length || 0,
    totalSponsoredContent: insightiq?.sponsored_contents?.length || 0,
    sponsoredEngagementAverage:
      insightiq?.sponsored_contents?.length > 0
        ? insightiq.sponsored_contents.reduce((total: number, content: any) => {
            const engagement = content.engagement || {};
            const likes = engagement.like_count || 0;
            const comments = engagement.comment_count || 0;
            const saves = engagement.save_count || 0;
            const shares = engagement.share_count || 0;
            const totalEngagement = likes + comments + saves + shares;

            // Calculate engagement rate if we have follower count
            if (influencer.followersCount && influencer.followersCount > 0) {
              return total + totalEngagement / influencer.followersCount;
            }
            return total + totalEngagement;
          }, 0) / insightiq.sponsored_contents.length
        : null,
    organicComparison: {
      sponsoredEngagement:
        insightiq?.sponsored_contents?.length > 0
          ? insightiq.sponsored_contents.reduce((total: number, content: any) => {
              const engagement = content.engagement || {};
              const totalEngagement =
                (engagement.like_count || 0) +
                (engagement.comment_count || 0) +
                (engagement.save_count || 0);
              return (
                total +
                (influencer.followersCount
                  ? totalEngagement / influencer.followersCount
                  : totalEngagement)
              );
            }, 0) / insightiq.sponsored_contents.length
          : null,
      organicEngagement: null, // Will be calculated from regular content data
      ratio: null, // Will be calculated after both are available
      performance: 'UNKNOWN' as const,
    },
    brandCollaborations: insightiq?.brand_collaborations || [],
    // Additional metrics for better sponsored content analysis
    averageSponsoredLikes:
      insightiq?.sponsored_contents?.length > 0
        ? Math.round(
            insightiq.sponsored_contents.reduce(
              (total: number, content: any) => total + (content.engagement?.like_count || 0),
              0
            ) / insightiq.sponsored_contents.length
          )
        : null,
    averageSponsoredComments:
      insightiq?.sponsored_contents?.length > 0
        ? Math.round(
            insightiq.sponsored_contents.reduce(
              (total: number, content: any) => total + (content.engagement?.comment_count || 0),
              0
            ) / insightiq.sponsored_contents.length
          )
        : null,
    sponsoredPerformanceRating:
      insightiq?.sponsored_contents?.length > 0
        ? calculateSponsoredPerformanceRating(
            insightiq.sponsored_contents,
            influencer.followersCount || 0
          )
        : 'UNKNOWN',
  };

  const reputation = {
    followerCount: influencer.followersCount, // ✅ FIXED: Use the correctly mapped follower count
    followingCount:
      insightiq?.following_count ??
      insightiq?.profile?.following_count ??
      (insightiq?.reputation_history?.length > 0
        ? insightiq.reputation_history[0].following_count
        : null) ?? // ✅ FIXED: Get from latest reputation history
      null,
    subscriberCount:
      insightiq?.subscriber_count ??
      insightiq?.profile?.subscriber_count ??
      (insightiq?.reputation_history?.length > 0
        ? insightiq.reputation_history[0].subscriber_count
        : null) ??
      null,
    contentCount: insightiq?.content_count ?? insightiq?.content?.contentCount ?? null,
    totalPostsCount: insightiq?.profile?.total_posts ?? null,
    averagePostFrequency: insightiq?.profile?.average_post_frequency ?? null,
    followerToFollowingRatio:
      influencer.followersCount &&
      (insightiq?.following_count ??
        insightiq?.profile?.following_count ??
        (insightiq?.reputation_history?.length > 0
          ? insightiq.reputation_history[0].following_count
          : null))
        ? Math.round(
            (influencer.followersCount /
              (insightiq?.following_count ??
                insightiq?.profile?.following_count ??
                insightiq.reputation_history[0].following_count)) *
              100
          ) / 100
        : null,
    postToFollowerRatio:
      insightiq?.profile?.total_posts && influencer.followersCount
        ? Math.round((insightiq.profile.total_posts / influencer.followersCount) * 10000) / 10000
        : null,
  };

  const trends = {
    reputationHistory:
      insightiq?.analytics?.reputationHistory ||
      insightiq?.reputation_history ||
      insightiq?.growth?.history ||
      insightiq?.trends?.reputation ||
      insightiq?.metrics?.history ||
      insightiq?.performance?.history ||
      [],
    engagementRateHistogram:
      insightiq?.engagement?.engagementRateHistogram ||
      insightiq?.engagement_rate_histogram ||
      insightiq?.analytics?.engagement_histogram ||
      insightiq?.metrics?.engagement_distribution ||
      [],
    growthMetrics: {
      followerGrowthRate:
        insightiq?.growth_metrics?.follower_growth_rate ||
        insightiq?.growth?.follower_rate ||
        insightiq?.analytics?.growth?.followers ||
        insightiq?.metrics?.follower_growth ||
        null,
      engagementGrowthRate:
        insightiq?.growth_metrics?.engagement_growth_rate ||
        insightiq?.growth?.engagement_rate ||
        insightiq?.analytics?.growth?.engagement ||
        insightiq?.metrics?.engagement_growth ||
        null,
      contentGrowthRate:
        insightiq?.growth_metrics?.content_growth_rate ||
        insightiq?.growth?.content_rate ||
        insightiq?.analytics?.growth?.content ||
        insightiq?.metrics?.content_growth ||
        null,
    },
    seasonalTrends:
      insightiq?.seasonal_trends ||
      insightiq?.trends?.seasonal ||
      insightiq?.analytics?.seasonal ||
      [],
  };

  return {
    engagement,
    sponsored,
    reputation,
    trends,
  };
}

/**
 * Extract Content Intelligence Data
 */
function extractContentData(influencer: InfluencerProfileData): InsightIQExtractedData['content'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  const contentAnalysis = {
    totalCount: insightiq?.content_count || insightiq?.content?.contentCount || null,
    hiddenLikesPercentage: insightiq?.posts_hidden_likes_percentage_value || null,
    performanceRanking: determineContentPerformanceRanking(insightiq) as
      | 'EXCELLENT'
      | 'GOOD'
      | 'AVERAGE'
      | 'POOR'
      | 'UNKNOWN',
    averageWordsPerPost: insightiq?.content_analysis?.average_words_per_post || null,
    hashtagUsageFrequency: insightiq?.content_analysis?.hashtag_usage_frequency || null,
    mentionUsageFrequency: insightiq?.content_analysis?.mention_usage_frequency || null,
    contentTypeDistribution: insightiq?.content_analysis?.content_type_distribution || [],
    postingFrequency: {
      daily: insightiq?.content_analysis?.posting_frequency?.daily || null,
      weekly: insightiq?.content_analysis?.posting_frequency?.weekly || null,
      monthly: insightiq?.content_analysis?.posting_frequency?.monthly || null,
      consistency:
        insightiq?.content_analysis?.posting_frequency?.consistency || ('UNKNOWN' as const),
    },
  };

  const strategy = {
    topHashtags: (insightiq?.top_hashtags || insightiq?.content?.topHashtags || []).map(
      (hashtag: any) => ({
        name: hashtag.name || hashtag,
        usage: hashtag.usage || 1,
        performance: hashtag.performance || 0,
      })
    ),
    topMentions: (insightiq?.top_mentions || insightiq?.content?.topMentions || []).map(
      (mention: any) => ({
        name: mention.name || mention,
        frequency: mention.frequency || 1,
        type: mention.type || 'user',
      })
    ),
    topInterests: (insightiq?.top_interests || insightiq?.content?.topInterests || []).map(
      (interest: any) => ({
        name: interest.name || interest,
        relevance: interest.relevance || 1,
        category: interest.category || 'general',
      })
    ),
    contentThemes: insightiq?.content_analysis?.content_themes || [],
    brandMentions: insightiq?.content_analysis?.brand_mentions || [],
  };

  const qualityMetrics = {
    originalContentPercentage: insightiq?.content_analysis?.original_content_percentage || null,
    highQualityImagePercentage: insightiq?.content_analysis?.high_quality_image_percentage || null,
    captionCompleteness: insightiq?.content_analysis?.caption_completeness || null,
    hashtagOptimization: insightiq?.content_analysis?.hashtag_optimization || null,
  };

  return {
    topContents: (insightiq?.top_contents || insightiq?.content?.topContents || []).map(
      (content: any) => ({
        id: content.id || '',
        type: content.type || 'post',
        url: content.url,
        caption: content.caption || content.description,
        likes: content.engagement?.like_count || content.likes || 0,
        comments: content.engagement?.comment_count || content.comments || 0,
        shares: content.engagement?.share_count || content.shares,
        saves: content.engagement?.save_count || content.saves,
        date: content.date || content.published_at || '',
        performance: content.performance || 0,
        isSponsored: content.is_sponsored || false,
      })
    ),
    recentContents: (insightiq?.recent_contents || insightiq?.content?.recentContents || []).map(
      (content: any) => ({
        id: content.id || '',
        type: content.type || 'post',
        url: content.url,
        caption: content.caption || content.description,
        likes: content.engagement?.like_count || content.likes || 0,
        comments: content.engagement?.comment_count || content.comments || 0,
        saves: content.engagement?.save_count || content.saves,
        date: content.date || content.published_at || '',
        hashtags: content.hashtags || [],
        mentions: content.mentions || [],
      })
    ),
    sponsoredContents: (
      insightiq?.sponsored_contents ||
      insightiq?.content?.sponsoredContents ||
      []
    ).map((content: any, index: number) => {
      // Extract brand name from description or mentions
      const extractBrandFromContent = (description: string | null): string => {
        if (!description) return 'Sponsored Post';

        // Look for common brand mention patterns
        const brandPatterns = [
          /@([a-zA-Z0-9._]+)/g, // @mentions
          /#([a-zA-Z0-9._]+)/g, // #hashtags that might be brands
          /Photo by @([a-zA-Z0-9._]+)/gi, // Photo credits
          /by ([A-Z][a-zA-Z0-9\s&]+)(?=\n|\.|\s")/g, // "by BrandName" patterns
        ];

        for (const pattern of brandPatterns) {
          const matches = description.match(pattern);
          if (matches && matches.length > 0) {
            // Clean up the first match
            const brandMatch = matches[0].replace(/[@#]/g, '').trim();
            if (brandMatch && brandMatch.length > 1) {
              return brandMatch.charAt(0).toUpperCase() + brandMatch.slice(1);
            }
          }
        }

        // If no brand found, try to extract from common sponsored post indicators
        if (
          description.toLowerCase().includes('partnership') ||
          description.toLowerCase().includes('collaboration') ||
          description.toLowerCase().includes('sponsored')
        ) {
          return 'Brand Partnership';
        }

        return 'Sponsored Post';
      };

      // Calculate performance based on engagement
      const engagement = content.engagement || {};
      const likes = engagement.like_count || 0;
      const comments = engagement.comment_count || 0;
      const saves = engagement.save_count || 0;
      const totalEngagement = likes + comments + saves;

      // Calculate engagement rate as performance metric
      const engagementRate =
        influencer.followersCount && influencer.followersCount > 0
          ? totalEngagement / influencer.followersCount
          : 0;

      return {
        id: content.url
          ? content.url.split('/').pop() || `sponsored-${index}`
          : `sponsored-${index}`,
        brandName: extractBrandFromContent(content.description),
        type: content.type || 'IMAGE',
        performance: Math.round(engagementRate * 10000) / 100, // Convert to percentage (0.0018 -> 0.18%)
        date: content.published_at || content.date || new Date().toISOString(),
        disclosureType: content.disclosure_type || 'partnership',
        // Additional useful fields for debugging
        totalEngagement,
        engagementRate,
        url: content.url,
      };
    }),
    contentAnalysis,
    strategy,
    qualityMetrics,
  };
}

/**
 * Extract Audience Intelligence Data with proper name mapping
 */
function extractAudienceData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['audience'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const audienceData = insightiq?.audience;

  // ✅ ROBUST PERCENTAGE VALIDATION - SSOT for percentage handling
  // Helper function to normalize percentage values with robust validation
  const normalizePercentage = (value: number, fieldName?: string): number => {
    // ✅ SSOT: All percentage values go through global validation
    return validateGlobalPercentage(value, fieldName);
  };

  // Helper function to normalize gender values
  const normalizeGender = (gender: string): string => {
    const genderLower = gender.toLowerCase().trim();
    if (genderLower === 'female' || genderLower === 'f') return 'Female';
    if (genderLower === 'male' || genderLower === 'm') return 'Male';
    if (genderLower === 'other' || genderLower === 'o') return 'Other';
    // Capitalize first letter for any other gender values
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Enhanced country mapping with real country names
  const getCountryName = (code: string): string => {
    const countryMap: Record<string, string> = {
      US: 'United States',
      UK: 'United Kingdom',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      DE: 'Germany',
      FR: 'France',
      IT: 'Italy',
      ES: 'Spain',
      NL: 'Netherlands',
      BR: 'Brazil',
      MX: 'Mexico',
      IN: 'India',
      JP: 'Japan',
      KR: 'South Korea',
      CN: 'China',
      RU: 'Russia',
      SE: 'Sweden',
      NO: 'Norway',
      DK: 'Denmark',
      FI: 'Finland',
      CH: 'Switzerland',
      AT: 'Austria',
      BE: 'Belgium',
      IE: 'Ireland',
      PT: 'Portugal',
      GR: 'Greece',
      PL: 'Poland',
      CZ: 'Czech Republic',
      HU: 'Hungary',
      RO: 'Romania',
      BG: 'Bulgaria',
      HR: 'Croatia',
      SI: 'Slovenia',
      SK: 'Slovakia',
      LT: 'Lithuania',
      LV: 'Latvia',
      EE: 'Estonia',
      AR: 'Argentina',
      CL: 'Chile',
      CO: 'Colombia',
      PE: 'Peru',
      VE: 'Venezuela',
      UY: 'Uruguay',
      EC: 'Ecuador',
      BO: 'Bolivia',
      PY: 'Paraguay',
      ZA: 'South Africa',
      EG: 'Egypt',
      MA: 'Morocco',
      TN: 'Tunisia',
      KE: 'Kenya',
      NG: 'Nigeria',
      GH: 'Ghana',
      TH: 'Thailand',
      VN: 'Vietnam',
      MY: 'Malaysia',
      SG: 'Singapore',
      ID: 'Indonesia',
      PH: 'Philippines',
      TW: 'Taiwan',
      HK: 'Hong Kong',
      NZ: 'New Zealand',
      IL: 'Israel',
      TR: 'Turkey',
      SA: 'Saudi Arabia',
      AE: 'United Arab Emirates',
      QA: 'Qatar',
      KW: 'Kuwait',
      BH: 'Bahrain',
      OM: 'Oman',
      JO: 'Jordan',
      LB: 'Lebanon',
      IQ: 'Iraq',
      IR: 'Iran',
      PK: 'Pakistan',
      BD: 'Bangladesh',
      LK: 'Sri Lanka',
      MM: 'Myanmar',
      KH: 'Cambodia',
      LA: 'Laos',
      UZ: 'Uzbekistan',
      KZ: 'Kazakhstan',
      KG: 'Kyrgyzstan',
      TJ: 'Tajikistan',
      TM: 'Turkmenistan',
      AF: 'Afghanistan',
      MN: 'Mongolia',
      NP: 'Nepal',
      BT: 'Bhutan',
      MV: 'Maldives',
    };
    return countryMap[code.toUpperCase()] || code.toUpperCase();
  };

  // Enhanced language mapping with real language names
  const getLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
      ur: 'Urdu',
      bn: 'Bengali',
      pa: 'Punjabi',
      te: 'Telugu',
      ta: 'Tamil',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada',
      ml: 'Malayalam',
      or: 'Odia',
      as: 'Assamese',
      nl: 'Dutch',
      sv: 'Swedish',
      no: 'Norwegian',
      da: 'Danish',
      fi: 'Finnish',
      pl: 'Polish',
      cs: 'Czech',
      sk: 'Slovak',
      hu: 'Hungarian',
      ro: 'Romanian',
      bg: 'Bulgarian',
      hr: 'Croatian',
      sr: 'Serbian',
      sl: 'Slovenian',
      mk: 'Macedonian',
      sq: 'Albanian',
      lt: 'Lithuanian',
      lv: 'Latvian',
      et: 'Estonian',
      mt: 'Maltese',
      ga: 'Irish',
      cy: 'Welsh',
      gd: 'Scottish Gaelic',
      is: 'Icelandic',
      fo: 'Faroese',
      eu: 'Basque',
      ca: 'Catalan',
      gl: 'Galician',
      tr: 'Turkish',
      he: 'Hebrew',
      th: 'Thai',
      vi: 'Vietnamese',
      ms: 'Malay',
      id: 'Indonesian',
      tl: 'Filipino',
      sw: 'Swahili',
      am: 'Amharic',
      ha: 'Hausa',
      yo: 'Yoruba',
      ig: 'Igbo',
      zu: 'Zulu',
      af: 'Afrikaans',
      xh: 'Xhosa',
    };
    return languageMap[code.toLowerCase()] || code.toUpperCase();
  };

  const demographics = {
    countries: (audienceData?.countries || []).map((country: any, index: number) => ({
      code: country.code || 'UN',
      name: country.name || getCountryName(country.code || 'UN'),
      value: normalizePercentage(country.value || 0, `country-${country.code || index}`),
      rank: index + 1,
    })),
    cities: (audienceData?.cities || []).map((city: any, index: number) => ({
      name: city.name || city.city || 'Unknown City',
      value: normalizePercentage(city.value || city.percentage || 0, `city-${city.name || index}`),
      country: city.country || city.country_code,
      rank: index + 1,
    })),
    genderAgeDistribution: (
      audienceData?.gender_age_distribution ||
      audienceData?.genderAge ||
      []
    ).map((item: any) => ({
      gender: normalizeGender(item.gender || item.sex || 'Unknown'),
      ageRange: item.ageRange || item.age_range || item.age || 'Unknown',
      value: normalizePercentage(
        item.value || item.percentage || 0,
        `genderAge-${item.gender}-${item.ageRange}`
      ),
      interests: item.interests || [],
    })),
    ethnicities: (audienceData?.ethnicities || []).map((ethnicity: any) => ({
      name: ethnicity.name || ethnicity.ethnicity || 'Unknown',
      value: normalizePercentage(
        ethnicity.value || ethnicity.percentage || 0,
        `ethnicity-${ethnicity.name}`
      ),
      region: ethnicity.region,
    })),
    languages: (audienceData?.languages || []).map((language: any, index: number) => ({
      code: language.code || language.lang || 'en',
      name: language.name || getLanguageName(language.code || language.lang || 'en'),
      value: normalizePercentage(
        language.value || language.percentage || 0,
        `language-${language.code || index}`
      ),
      primary: index === 0,
    })),
    occupations: (audienceData?.occupations || []).map((occupation: any) => ({
      name: occupation.name || occupation.job || occupation.profession || 'Unknown',
      value: normalizePercentage(
        occupation.value || occupation.percentage || 0,
        `occupation-${occupation.name}`
      ),
      industry: occupation.industry || occupation.sector,
    })),
    incomeDistribution: (audienceData?.income_distribution || audienceData?.income || []).map(
      (income: any) => ({
        range: income.range || income.bracket || 'Unknown',
        percentage: normalizePercentage(
          income.percentage || income.value || 0,
          `income-${income.range}`
        ),
      })
    ),
    educationLevels: (audienceData?.education_levels || audienceData?.education || []).map(
      (education: any) => ({
        level: education.level || education.degree || 'Unknown',
        percentage: normalizePercentage(
          education.percentage || education.value || 0,
          `education-${education.level}`
        ),
      })
    ),
  };

  const likers = {
    significantLikersPercentage:
      audienceData?.audienceLikers?.significant_likers_percentage ||
      audienceData?.likers?.significant_percentage ||
      audienceData?.significant_likers_percentage ||
      null,
    credibilityScore:
      audienceData?.audienceLikers?.credibility_score ||
      audienceData?.likers?.credibility ||
      audienceData?.credibility_score ||
      null,
    significantLikers: (
      audienceData?.audienceLikers?.significant_likers ||
      audienceData?.likers?.significant ||
      audienceData?.significant_likers ||
      []
    ).map((liker: any) => ({
      platformUsername: liker.platformUsername || liker.username || liker.handle,
      imageUrl: liker.imageUrl || liker.avatar || liker.profile_picture,
      isVerified: liker.isVerified || liker.verified || false,
      followerCount: liker.followerCount || liker.followers,
      influence: liker.influence || ('MEDIUM' as const),
      niche: liker.niche || liker.category,
    })),
    countries: (
      audienceData?.audienceLikers?.countries ||
      audienceData?.likers?.countries ||
      audienceData?.audience_likers?.countries ||
      []
    ).map((country: any) => ({
      code: country.code || 'UN',
      value: normalizePercentage(country.value || 0, `likers-country-${country.code}`),
    })),
    cities: (audienceData?.audience_likers?.cities || []).map((city: any) => ({
      name: city.name || 'Unknown City',
      value: normalizePercentage(city.value || 0, `likers-city-${city.name}`),
      country: city.country,
    })),
    genderAgeDistribution: (audienceData?.audience_likers?.gender_age_distribution || []).map(
      (item: any) => ({
        gender: normalizeGender(item.gender || 'Unknown'),
        ageRange: item.age_range || 'Unknown',
        value: normalizePercentage(
          item.value || 0,
          `likers-genderAge-${item.gender}-${item.age_range}`
        ),
      })
    ),
    ethnicities: (audienceData?.audience_likers?.ethnicities || []).map((ethnicity: any) => ({
      name: ethnicity.name || 'Unknown',
      value: normalizePercentage(ethnicity.value || 0, `likers-ethnicity-${ethnicity.name}`),
    })),
    languages: (audienceData?.audience_likers?.languages || []).map((language: any) => ({
      code: language.code || 'en',
      name: getLanguageName(language.code || 'en'),
      value: normalizePercentage(language.value || 0, `likers-language-${language.code}`),
    })),
    brandAffinity: (audienceData?.audience_likers?.brand_affinity || []).map((brand: any) => ({
      name: brand.name || 'Unknown',
      value: normalizePercentage(brand.value || 0, `likers-brand-${brand.name}`),
    })),
    interests: (audienceData?.audience_likers?.interests || []).map((interest: any) => ({
      name: interest.name || 'Unknown',
      value: normalizePercentage(interest.value || 0, `likers-interest-${interest.name}`),
    })),
    averageEngagementOfLikers:
      audienceData?.audienceLikers?.average_engagement ||
      audienceData?.likers?.avg_engagement ||
      audienceData?.audience_likers?.average_engagement ||
      null,
    likerGrowthRate:
      audienceData?.audienceLikers?.growth_rate ||
      audienceData?.likers?.growth ||
      audienceData?.audience_likers?.growth_rate ||
      null,
  };

  const behavior = {
    peakActivityHours:
      audienceData?.behavior?.peak_activity_hours || audienceData?.activity?.peak_hours || [],
    deviceUsage: (audienceData?.behavior?.device_usage || audienceData?.devices || []).map(
      (device: any) => ({
        device: device.device || device.type || 'Unknown',
        percentage: normalizePercentage(
          device.percentage || device.value || 0,
          `device-${device.device || device.type}`
        ),
      })
    ),
    platformCrossover: (
      audienceData?.behavior?.platform_crossover ||
      audienceData?.platforms ||
      []
    ).map((platform: any) => ({
      platform: platform.platform || platform.name || 'Unknown',
      percentage: normalizePercentage(
        platform.percentage || platform.value || 0,
        `platform-${platform.platform || platform.name}`
      ),
    })),
    shoppingBehavior: {
      onlineShopping:
        audienceData?.behavior?.shopping_behavior?.online_shopping ||
        audienceData?.shopping?.online ||
        null,
      brandLoyalty:
        audienceData?.behavior?.shopping_behavior?.brand_loyalty ||
        audienceData?.shopping?.loyalty ||
        null,
      purchaseInfluence:
        audienceData?.behavior?.shopping_behavior?.purchase_influence ||
        audienceData?.shopping?.influence ||
        null,
    },
  };

  return {
    demographics,
    interests: (audienceData?.interests || []).map((interest: any) => ({
      name: interest.name || interest.topic || interest.category || 'Unknown',
      value: normalizePercentage(
        interest.value || interest.percentage || 0,
        `interest-${interest.name || interest.topic || interest.category}`
      ),
      category: interest.category || interest.type,
      trendingScore: interest.trending_score || interest.trend,
    })),
    brandAffinity: (audienceData?.brand_affinity || audienceData?.brands || []).map(
      (brand: any) => ({
        name: brand.name || brand.brand || 'Unknown Brand',
        value: normalizePercentage(
          brand.value || brand.percentage || 0,
          `brand-${brand.name || brand.brand}`
        ),
        category: brand.category || brand.type,
        logoUrl: brand.logoUrl || brand.logo,
        industry: brand.industry || brand.sector,
        priceRange: brand.price_range || brand.pricing,
      })
    ),
    credibilityBand: (audienceData?.credibility_score_band || []).map(
      (band: any, index: number) => {
        // Generate proper credibility ranges since API min/max are invalid
        const totalBands = audienceData?.credibility_score_band?.length || 20;
        const rangeSize = 100 / totalBands;
        const calculatedMin = Math.round(index * rangeSize);
        const calculatedMax = Math.round((index + 1) * rangeSize);

        return {
          min: calculatedMin,
          max: calculatedMax === 100 ? 100 : calculatedMax - 1, // Ensure no overlap
          totalProfileCount: band.total_profile_count || band.count || 0, // ✅ FIXED: Use correct API field name
          percentile: Math.round(((index + 1) / totalBands) * 100),
        };
      }
    ),
    likers,
    behavior,
  };
}

/**
 * Extract Brand Intelligence Data
 */
function extractBrandData(influencer: InfluencerProfileData): InsightIQExtractedData['brand'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  // ✅ CRITICAL FIX: Look for lookalikes data in the correct paths according to Airtable schema
  // According to the schema: profile.lookalikes.platform_username, profile.lookalikes.url, etc.
  console.log('🔍 DEBUG: Looking for lookalikes data in InsightIQ object', {
    hasInsightIQ: !!insightiq,
    hasProfile: !!insightiq?.profile,
    hasProfileLookalikes: !!insightiq?.profile?.lookalikes,
    hasDirectLookalikes: !!insightiq?.lookalikes,
    hasAnalyticsLookalikes: !!insightiq?.analytics?.lookalikes,
  });

  const extractLookalikes = () => {
    // Primary source: profile.lookalikes (matches Airtable schema)
    const profileLookalikes = insightiq?.profile?.lookalikes || [];

    // Fallback sources for backward compatibility
    const analyticsLookalikes = insightiq?.analytics?.lookalikes || [];
    const rootLookalikes = insightiq?.lookalikes || [];

    // Additional potential sources based on API variations
    const audienceLookalikes = insightiq?.audience?.lookalikes || [];
    const brandLookalikes = insightiq?.brand?.lookalikes || [];
    const competitiveLookalikes = insightiq?.competitive?.lookalikes || [];

    // Use the source with the most data
    const allSources = [
      profileLookalikes,
      analyticsLookalikes,
      rootLookalikes,
      audienceLookalikes,
      brandLookalikes,
      competitiveLookalikes,
    ];
    const bestSource = allSources.reduce(
      (prev, current) => (current.length > prev.length ? current : prev),
      []
    );

    console.log('🔍 DEBUG: Lookalikes extraction comprehensive summary', {
      profileLookalikes: profileLookalikes.length,
      analyticsLookalikes: analyticsLookalikes.length,
      rootLookalikes: rootLookalikes.length,
      audienceLookalikes: audienceLookalikes.length,
      brandLookalikes: brandLookalikes.length,
      competitiveLookalikes: competitiveLookalikes.length,
      selectedSource: bestSource.length,
      totalDataSources: allSources.filter(src => src.length > 0).length,
    });

    return bestSource.map((lookalike: any) => ({
      platformUsername:
        lookalike.platform_username ||
        lookalike.platformUsername ||
        lookalike.username ||
        lookalike.handle ||
        'Profile Available',
      imageUrl:
        lookalike.image_url || lookalike.imageUrl || lookalike.avatar || lookalike.profile_picture,
      isVerified: lookalike.is_verified || lookalike.isVerified || lookalike.verified || false,
      followerCount:
        lookalike.follower_count || lookalike.followerCount || lookalike.followers || 0,
      category: lookalike.category || lookalike.niche || lookalike.type || 'Unknown',
      similarityScore:
        lookalike.similarity_score ||
        lookalike.similarityScore ||
        lookalike.match_score ||
        lookalike.score ||
        0,
      engagementRate:
        lookalike.engagement_rate || lookalike.engagementRate || lookalike.engagement || 0,
      averageLikes: lookalike.average_likes || lookalike.averageLikes || lookalike.avg_likes || 0,
      country: lookalike.country || lookalike.location || 'Unknown',
      niche: lookalike.niche || lookalike.category || lookalike.vertical || 'General',
      collaborationPotential:
        lookalike.collaboration_potential ||
        lookalike.collaborationPotential ||
        ('MEDIUM' as const),
    }));
  };

  return {
    lookalikes: extractLookalikes(),
    creatorBrandAffinity: (
      insightiq?.analytics?.creatorBrandAffinity ||
      insightiq?.brand_affinity ||
      []
    ).map((brand: any) => ({
      ...brand,
      industry: brand.industry,
      marketSegment: brand.market_segment,
      collaborationHistory: brand.collaboration_history || 0,
    })),
    significantFollowers: insightiq?.audience?.significant_followers
      ? {
          ...insightiq.audience.significant_followers,
          influence: insightiq.audience.significant_followers.influence || ('MEDIUM' as const),
          industry: insightiq.audience.significant_followers.industry,
        }
      : null,
    marketPositioning: {
      industry: insightiq?.market_positioning?.industry || null,
      niche: insightiq?.market_positioning?.niche || null,
      competitiveRank: insightiq?.market_positioning?.competitive_rank || null,
      marketShare: insightiq?.market_positioning?.market_share || null,
      uniqueValueProposition: insightiq?.market_positioning?.unique_value_proposition || [],
    },
    collaborationHistory: insightiq?.collaboration_history || [],
  };
}

/**
 * Extract Pricing Intelligence Data
 */
function extractPricingData(influencer: InfluencerProfileData): InsightIQExtractedData['pricing'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const pricingData = insightiq?.pricing;

  return {
    currency: pricingData?.pricing?.currency || null,
    postTypes: Object.fromEntries(
      Object.entries(pricingData?.pricing?.post_type || {}).map(([key, value]: [string, any]) => [
        key,
        {
          min: value.min,
          max: value.max,
          average: value.average,
          median: value.median,
          lastUpdated: value.last_updated,
        },
      ])
    ),
    explanations: Object.fromEntries(
      Object.entries(pricingData?.explanations || {}).map(([key, value]: [string, any]) => [
        key,
        {
          level: value.level,
          description: value.description,
          factors: value.factors || [],
        },
      ])
    ),
    hasPricingData: Boolean(pricingData?.pricing || pricingData?.explanations),
    marketComparison: {
      percentile: pricingData?.market_comparison?.percentile || null,
      industryAverage: pricingData?.market_comparison?.industry_average || null,
      priceRange: pricingData?.market_comparison?.price_range || ('UNKNOWN' as const),
    },
    pricingTrends: pricingData?.pricing_trends || [],
  };
}

/**
 * Extract Creator Demographics Data
 */
function extractCreatorData(influencer: InfluencerProfileData): InsightIQExtractedData['creator'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const creatorData = insightiq?.demographics?.creator;

  return {
    gender: creatorData?.gender || insightiq?.profile?.gender || null,
    ageGroup: creatorData?.ageGroup || insightiq?.age_group || null,
    estimatedAge: creatorData?.estimatedAge || null,
    language: creatorData?.language || insightiq?.language || null,
    dateOfBirth: insightiq?.profile?.date_of_birth || null,
    nationality: creatorData?.nationality || null,
    ethnicity: creatorData?.ethnicity || null,
    profession: creatorData?.profession || null,
    expertise: creatorData?.expertise || [],
    personalityTraits: creatorData?.personalityTraits || [],
    contentStyle: {
      tone: creatorData?.contentStyle?.tone || null,
      visualStyle: creatorData?.contentStyle?.visualStyle || null,
      postingPattern: creatorData?.contentStyle?.postingPattern || null,
      authenticityScore: creatorData?.contentStyle?.authenticityScore || null,
    },
  };
}

/**
 * Extract Advanced Analytics Data
 */
function extractAdvancedData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['advanced'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  return {
    sentimentAnalysis: {
      overallSentiment: insightiq?.sentiment_analysis?.overall_sentiment || ('NEUTRAL' as const),
      sentimentScore: insightiq?.sentiment_analysis?.sentiment_score || null,
      commentSentiment: insightiq?.sentiment_analysis?.comment_sentiment || null,
      brandMentionSentiment: insightiq?.sentiment_analysis?.brand_mention_sentiment || null,
      controversyScore: insightiq?.sentiment_analysis?.controversy_score || null,
    },
    riskAssessment: {
      brandSafetyScore: insightiq?.risk_assessment?.brand_safety_score || null,
      contentAppropriateness: insightiq?.risk_assessment?.content_appropriateness || null,
      pastControversies: insightiq?.risk_assessment?.past_controversies || [],
      complianceScore: insightiq?.risk_assessment?.compliance_score || null,
    },
    predictiveMetrics: {
      growthProjection: insightiq?.predictive_metrics?.growth_projection || null,
      engagementForecast: insightiq?.predictive_metrics?.engagement_forecast || null,
      brandFitScore: insightiq?.predictive_metrics?.brand_fit_score || null,
      campaignSuccessProbability:
        insightiq?.predictive_metrics?.campaign_success_probability || null,
    },
    crossPlatformData: insightiq?.cross_platform_data || [],
  };
}

// 🛠️ **UTILITY FUNCTIONS**

function getFollowerTypeCategory(typeName: string): 'positive' | 'negative' | 'neutral' {
  const upperName = typeName.toUpperCase();
  if (
    upperName.includes('REAL') ||
    upperName.includes('GENUINE') ||
    upperName.includes('AUTHENTIC')
  ) {
    return 'positive';
  }
  if (upperName.includes('SUSPICIOUS') || upperName.includes('FAKE') || upperName.includes('BOT')) {
    return 'negative';
  }
  return 'neutral';
}

function determineContentPerformanceRanking(insightiq: any): string {
  const engagement = insightiq?.engagement_rate || 0;
  const sponsoredPerformance = insightiq?.sponsored_posts_performance || 0;

  if (engagement > 0.05 && sponsoredPerformance > 0.8) return 'EXCELLENT';
  if (engagement > 0.03 && sponsoredPerformance > 0.6) return 'GOOD';
  if (engagement > 0.01 && sponsoredPerformance > 0.3) return 'AVERAGE';
  if (engagement > 0 || sponsoredPerformance > 0) return 'POOR';
  return 'UNKNOWN';
}

function calculateSponsoredPerformanceRating(
  sponsoredContents: any[],
  followerCount: number
): 'POOR' | 'AVERAGE' | 'GOOD' | 'EXCELLENT' | 'UNKNOWN' {
  if (!sponsoredContents || sponsoredContents.length === 0) return 'UNKNOWN';

  // Calculate average engagement rate for sponsored content
  const totalEngagementRate = sponsoredContents.reduce((total, content) => {
    const engagement = content.engagement || {};
    const totalEngagement =
      (engagement.like_count || 0) + (engagement.comment_count || 0) + (engagement.save_count || 0);
    return total + (followerCount > 0 ? totalEngagement / followerCount : 0);
  }, 0);

  const averageEngagementRate = totalEngagementRate / sponsoredContents.length;

  // Rate based on industry benchmarks for sponsored content
  if (averageEngagementRate >= 0.03) return 'EXCELLENT'; // 3%+ is excellent for sponsored
  if (averageEngagementRate >= 0.015) return 'GOOD'; // 1.5%+ is good for sponsored
  if (averageEngagementRate >= 0.008) return 'AVERAGE'; // 0.8%+ is average for sponsored
  if (averageEngagementRate > 0) return 'POOR'; // Any engagement is better than none
  return 'UNKNOWN';
}

// 🎯 **MAIN EXTRACTION FUNCTION - SINGLE SOURCE OF TRUTH**

/**
 * Extract ALL Profile Analytics API data with 100% endpoint utilization
 *
 * @param influencer - InfluencerProfileData with InsightIQ data
 * @returns Comprehensive extracted and typed data
 */
export function extractInsightIQData(influencer: InfluencerProfileData): InsightIQExtractedData {
  logger.debug('[InsightIQ Extractor] Starting comprehensive data extraction', {
    influencerId: influencer.id,
    hasInsightIQData: Boolean((influencer as any).insightiq),
  });

  // Get the insightiq data once
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  // 🔍 **MIT-PROFESSOR-LEVEL ANALYTICS DEBUGGING**
  if (insightiq) {
    console.log('📊 ANALYTICS DEBUG: Comprehensive InsightIQ data structure analysis', {
      // Core data availability
      hasProfile: !!insightiq.profile,
      hasAudience: !!insightiq.audience,
      hasAnalytics: !!insightiq.analytics,
      hasGrowth: !!insightiq.growth,
      hasMetrics: !!insightiq.metrics,
      hasPerformance: !!insightiq.performance,

      // Growth & Trends data
      reputationHistoryLength: insightiq.reputation_history?.length || 0,
      analyticsHistoryLength: insightiq.analytics?.reputationHistory?.length || 0,
      growthHistoryLength: insightiq.growth?.history?.length || 0,

      // Lookalikes data
      profileLookalikesLength: insightiq.profile?.lookalikes?.length || 0,
      analyticsLookalikesLength: insightiq.analytics?.lookalikes?.length || 0,
      audienceLookalikesLength: insightiq.audience?.lookalikes?.length || 0,

      // Engagement data
      hasEngagementRate: !!insightiq.engagement_rate,
      hasAverageLikes: !!insightiq.average_likes,
      hasAverageViews: !!insightiq.average_views,

      // Contact data
      hasContactDetails: !!insightiq.contact_details,
      contactDetailsLength: insightiq.contact_details?.length || 0,

      // Brand data
      brandAffinityLength: insightiq.audience?.brand_affinity?.length || 0,
      topHashtagsLength: insightiq.top_hashtags?.length || 0,

      // Top-level keys for structure analysis
      topLevelKeys: Object.keys(insightiq),
    });
  } else {
    console.warn('⚠️ ANALYTICS DEBUG: No InsightIQ data found for influencer', {
      influencerId: influencer.id,
      influencerHandle: influencer.handle,
      influencerName: influencer.name,
      availableKeys: Object.keys(influencer),
    });
  }

  /**
   * Enhanced extraction with additional API coverage for comprehensive data utilization
   */

  // Add comprehensive business analytics data
  const businessAnalytics = {
    businessCategory: insightiq?.profile?.business_category || null,
    businessType: insightiq?.profile?.business_type || null,
    companySize: insightiq?.profile?.company_size || null,
    industry: insightiq?.profile?.industry || null,
    businessLocation: insightiq?.profile?.business_location || null,
    businessWebsite: insightiq?.profile?.business_website || null,
    linkedinProfile: insightiq?.profile?.linkedin_profile || null,
    businessDescription: insightiq?.profile?.business_description || null,
  };

  // Add comprehensive content analytics
  const advancedContentAnalytics = {
    videoContent: {
      averageVideoLength: insightiq?.content_analysis?.video?.average_length || null,
      videoEngagementRate: insightiq?.content_analysis?.video?.engagement_rate || null,
      videoViewThroughRate: insightiq?.content_analysis?.video?.view_through_rate || null,
      mostPopularVideoType: insightiq?.content_analysis?.video?.most_popular_type || null,
    },
    hashtagAnalysis: {
      hashtagEffectiveness: insightiq?.content_analysis?.hashtags?.effectiveness || null,
      topPerformingHashtags: insightiq?.content_analysis?.hashtags?.top_performing || [],
      hashtagReach: insightiq?.content_analysis?.hashtags?.reach || null,
      averageHashtagsPerPost: insightiq?.content_analysis?.hashtags?.average_per_post || null,
    },
    mentionAnalysis: {
      brandMentions: insightiq?.content_analysis?.mentions?.brands || [],
      influencerMentions: insightiq?.content_analysis?.mentions?.influencers || [],
      mentionEngagement: insightiq?.content_analysis?.mentions?.engagement || null,
      mentionReach: insightiq?.content_analysis?.mentions?.reach || null,
    },
    storyAnalytics: {
      storyEngagementRate: insightiq?.content_analysis?.stories?.engagement_rate || null,
      storyViewRate: insightiq?.content_analysis?.stories?.view_rate || null,
      averageStoryDuration: insightiq?.content_analysis?.stories?.average_duration || null,
      storyFrequency: insightiq?.content_analysis?.stories?.frequency || null,
    },
  };

  // Add comprehensive audience behavior analytics
  const advancedAudienceBehavior = {
    engagementPatterns: {
      peakEngagementDays: insightiq?.audience?.behavior?.peak_days || [],
      engagementConsistency: insightiq?.audience?.behavior?.consistency || null,
      averageEngagementWindow: insightiq?.audience?.behavior?.engagement_window || null,
      engagementDistribution: insightiq?.audience?.behavior?.engagement_distribution || [],
    },
    audienceGrowth: {
      growthRate: insightiq?.audience?.growth?.rate || null,
      organicGrowthPercentage: insightiq?.audience?.growth?.organic_percentage || null,
      followerChurnRate: insightiq?.audience?.growth?.churn_rate || null,
      newFollowersRate: insightiq?.audience?.growth?.new_followers_rate || null,
    },
    audienceInteraction: {
      commentQuality: insightiq?.audience?.interaction?.comment_quality || null,
      averageCommentsPerPost: insightiq?.audience?.interaction?.average_comments || null,
      shareRate: insightiq?.audience?.interaction?.share_rate || null,
      saveRate: insightiq?.audience?.interaction?.save_rate || null,
    },
    crossPlatformBehavior: {
      platformOverlap: insightiq?.audience?.cross_platform?.overlap || [],
      primaryPlatformUsage: insightiq?.audience?.cross_platform?.primary_usage || null,
      secondaryPlatforms: insightiq?.audience?.cross_platform?.secondary_platforms || [],
    },
  };

  // Add comprehensive competitive intelligence
  const competitiveIntelligence = {
    marketPosition: {
      categoryRanking: insightiq?.competitive?.market_position?.category_ranking || null,
      nicheDominance: insightiq?.competitive?.market_position?.niche_dominance || null,
      marketShare: insightiq?.competitive?.market_position?.market_share || null,
      competitiveAdvantages: insightiq?.competitive?.market_position?.advantages || [],
    },
    benchmarkComparison: {
      industryBenchmarks: insightiq?.competitive?.benchmarks?.industry || {},
      peerComparison: insightiq?.competitive?.benchmarks?.peers || [],
      performanceRanking: insightiq?.competitive?.benchmarks?.performance_ranking || null,
      growthComparison: insightiq?.competitive?.benchmarks?.growth_comparison || null,
    },
    collaborationOpportunities: {
      brandAlignmentScore: insightiq?.competitive?.collaboration?.brand_alignment || null,
      collaborationHistory: insightiq?.competitive?.collaboration?.history || [],
      potentialPartners: insightiq?.competitive?.collaboration?.potential_partners || [],
      networkConnections: insightiq?.competitive?.collaboration?.network_connections || [],
    },
  };

  // Add comprehensive monetization analytics
  const monetizationAnalytics = {
    revenueStreams: {
      sponsoredContentRevenue: insightiq?.monetization?.revenue?.sponsored_content || null,
      affiliateRevenue: insightiq?.monetization?.revenue?.affiliate || null,
      productSalesRevenue: insightiq?.monetization?.revenue?.product_sales || null,
      serviceRevenue: insightiq?.monetization?.revenue?.services || null,
    },
    pricingStrategy: {
      priceOptimization: insightiq?.monetization?.pricing?.optimization || null,
      competitivePricing: insightiq?.monetization?.pricing?.competitive_analysis || null,
      seasonalPricing: insightiq?.monetization?.pricing?.seasonal_trends || [],
      discountPatterns: insightiq?.monetization?.pricing?.discount_patterns || [],
    },
    brandPartnerships: {
      partnershipValue: insightiq?.monetization?.partnerships?.value || null,
      brandLoyalty: insightiq?.monetization?.partnerships?.loyalty || null,
      retentionRate: insightiq?.monetization?.partnerships?.retention_rate || null,
      averagePartnershipDuration: insightiq?.monetization?.partnerships?.average_duration || null,
    },
  };

  // Add comprehensive risk assessment analytics
  const riskAssessmentAnalytics = {
    contentRisks: {
      brandSafetyScore: insightiq?.risk_assessment?.content?.brand_safety_score || null,
      controversyRisk: insightiq?.risk_assessment?.content?.controversy_risk || null,
      contentAppropriateness: insightiq?.risk_assessment?.content?.appropriateness || null,
      contextualRisks: insightiq?.risk_assessment?.content?.contextual_risks || [],
    },
    audienceRisks: {
      fakeFollowerRisk: insightiq?.risk_assessment?.audience?.fake_follower_risk || null,
      engagementFraudRisk: insightiq?.risk_assessment?.audience?.engagement_fraud_risk || null,
      audienceAlignmentRisk: insightiq?.risk_assessment?.audience?.alignment_risk || null,
      reputationRisk: insightiq?.risk_assessment?.audience?.reputation_risk || null,
    },
    performanceRisks: {
      engagementVolatility: insightiq?.risk_assessment?.performance?.volatility || null,
      growthSustainability: insightiq?.risk_assessment?.performance?.growth_sustainability || null,
      seasonalRisks: insightiq?.risk_assessment?.performance?.seasonal_risks || [],
      marketDependency: insightiq?.risk_assessment?.performance?.market_dependency || null,
    },
  };

  // Add comprehensive predictive analytics
  const predictiveAnalytics = {
    growthProjections: {
      followerGrowthForecast: insightiq?.predictions?.growth?.follower_forecast || [],
      engagementTrends: insightiq?.predictions?.growth?.engagement_trends || [],
      contentPerformanceForecast: insightiq?.predictions?.growth?.content_forecast || [],
    },
    marketTrends: {
      industryTrends: insightiq?.predictions?.market?.industry_trends || [],
      seasonalOpportunities: insightiq?.predictions?.market?.seasonal_opportunities || [],
      emergingTopics: insightiq?.predictions?.market?.emerging_topics || [],
    },
    recommendationEngine: {
      contentRecommendations: insightiq?.predictions?.recommendations?.content || [],
      partnershipOpportunities: insightiq?.predictions?.recommendations?.partnerships || [],
      optimizationSuggestions: insightiq?.predictions?.recommendations?.optimization || [],
    },
  };

  const extractedData: InsightIQExtractedData = {
    trust: extractTrustData(influencer),
    professional: extractProfessionalData(influencer),
    performance: extractPerformanceData(influencer),
    content: extractContentData(influencer),
    audience: extractAudienceData(influencer),
    brand: extractBrandData(influencer),
    pricing: extractPricingData(influencer),
    creator: extractCreatorData(influencer),
    advanced: extractAdvancedData(influencer),
    livestream: extractLivestreamData(influencer),
  };

  // Store additional comprehensive analytics in the extracted data
  (extractedData as any).businessAnalytics = businessAnalytics;
  (extractedData as any).advancedContentAnalytics = advancedContentAnalytics;
  (extractedData as any).advancedAudienceBehavior = advancedAudienceBehavior;
  (extractedData as any).competitiveIntelligence = competitiveIntelligence;
  (extractedData as any).monetizationAnalytics = monetizationAnalytics;
  (extractedData as any).riskAssessmentAnalytics = riskAssessmentAnalytics;
  (extractedData as any).predictiveAnalytics = predictiveAnalytics;

  // Log data utilization statistics
  const utilizationStats = calculateDataUtilization(extractedData);
  logger.info('[InsightIQ Extractor] Data extraction complete', {
    influencerId: influencer.id,
    utilizationStats,
    enhancedFieldsExtracted: 7, // New analytics categories added
  });

  return extractedData;
}

/**
 * Calculate data utilization statistics for monitoring
 */
function calculateDataUtilization(data: InsightIQExtractedData): Record<string, number> {
  return {
    trustFieldsPopulated: Object.values(data.trust).filter(
      v => v !== null && v !== 0 && v !== false
    ).length,
    professionalFieldsPopulated: Object.values(data.professional).filter(
      v => v !== null && (Array.isArray(v) ? v.length > 0 : true)
    ).length,
    performanceFieldsPopulated: Object.values(data.performance.engagement).filter(v => v !== null)
      .length,
    contentFieldsPopulated: [
      data.content.topContents,
      data.content.recentContents,
      data.content.sponsoredContents,
    ].filter(arr => arr.length > 0).length,
    audienceFieldsPopulated: Object.values(data.audience.demographics).filter(
      arr => Array.isArray(arr) && arr.length > 0
    ).length,
    brandFieldsPopulated: Object.values(data.brand).filter(
      v => v !== null && (Array.isArray(v) ? v.length > 0 : true)
    ).length,
    pricingFieldsPopulated: data.pricing.hasPricingData
      ? Object.keys(data.pricing.postTypes).length
      : 0,
    creatorFieldsPopulated: Object.values(data.creator).filter(v => v !== null).length,
  };
}

/**
 * Extract Livestream Analytics Data (Twitch-specific)
 */
function extractLivestreamData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['livestream'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const livestreamData = insightiq?.livestream_metrics;

  if (!livestreamData) {
    return {
      metrics: {
        hoursWatched: null,
        peakViewers: null,
        averageViewers: null,
        airtime: null,
        daysStreamed: null,
      },
      followerGrowth: {
        percentage: null,
        count: null,
        perHour: null,
      },
      games: [],
      viewership: {
        totalLiveViewCount: null,
        uniqueViewers: null,
        authUniqueViewers: null,
      },
      estimatedAudience: {
        dailyAverage: null,
        averageViewDuration: null,
      },
      subscribers: {
        total: null,
        income: { min: null, max: null },
        tierBreakdown: {
          paid: null,
          gifted: null,
          prime: null,
          tier1: null,
          tier2: null,
          tier3: null,
        },
      },
      chat: {
        totalMessages: null,
        activeChatters: null,
        dailyEngagementRate: null,
        messagesPerChatter: null,
      },
      bits: {
        totalBits: null,
        income: null,
      },
    };
  }

  return {
    metrics: {
      hoursWatched: livestreamData.hours_watched || null,
      peakViewers: livestreamData.peak_viewers || null,
      averageViewers: livestreamData.average_viewers || null,
      airtime: livestreamData.airtime || null,
      daysStreamed: livestreamData.days_streamed || null,
    },
    followerGrowth: {
      percentage: livestreamData.follower_growth?.percentage || null,
      count: livestreamData.follower_growth?.count || null,
      perHour: livestreamData.follower_growth?.per_hour || null,
    },
    games: (livestreamData.games || []).map((game: any) => ({
      count: game.count || 0,
      name: game.top?.name || 'Unknown',
      hoursWatched: game.top?.hours_watched || 0,
      hoursWatchedPercentage: game.top?.hours_watched_percentage || 0,
    })),
    viewership: {
      totalLiveViewCount: livestreamData.viewership?.total_live_view_count || null,
      uniqueViewers: livestreamData.viewership?.unique_viewers || null,
      authUniqueViewers: livestreamData.viewership?.auth_unique_viewers || null,
    },
    estimatedAudience: {
      dailyAverage: livestreamData.estimated_audience?.daily_average || null,
      averageViewDuration: livestreamData.estimated_audience?.average_view_duration || null,
    },
    subscribers: {
      total: livestreamData.subscribers?.total || null,
      income: {
        min: livestreamData.subscribers?.income?.min || null,
        max: livestreamData.subscribers?.income?.max || null,
      },
      tierBreakdown: {
        paid: livestreamData.subscribers?.tier_breakdown?.paid || null,
        gifted: livestreamData.subscribers?.tier_breakdown?.gifted || null,
        prime: livestreamData.subscribers?.tier_breakdown?.prime || null,
        tier1: livestreamData.subscribers?.tier_breakdown?.tier_1 || null,
        tier2: livestreamData.subscribers?.tier_breakdown?.tier_2 || null,
        tier3: livestreamData.subscribers?.tier_breakdown?.tier_3 || null,
      },
    },
    chat: {
      totalMessages: livestreamData.chat?.total_messages || null,
      activeChatters: livestreamData.chat?.active_chatters || null,
      dailyEngagementRate: livestreamData.chat?.daily_engagement_rate || null,
      messagesPerChatter: livestreamData.chat?.messages_per_chatter || null,
    },
    bits: {
      totalBits: livestreamData.bits?.total_bits || null,
      income: livestreamData.bits?.income || null,
    },
  };
}

/**
 * ✅ GLOBAL PERCENTAGE VALIDATION - SSOT for all percentage handling
 * Ensures NO percentage can exceed 100% throughout the entire system
 * This is the single source of truth for percentage validation
 * ✅ ENFORCES INTEGER PERCENTAGES - No decimals allowed
 */
export const validateGlobalPercentage = (value: number, context?: string): number => {
  if (value === null || value === undefined || isNaN(value)) return 0;

  // Strict enforcement: Log violations for debugging
  if (value > 100) {
    console.error(
      `🚨 PERCENTAGE VIOLATION: ${context || 'Unknown field'} exceeded 100%: ${value}% - CAPPING TO 100%`
    );
  }

  if (value < 0) {
    console.warn(
      `⚠️ PERCENTAGE WARNING: ${context || 'Unknown field'} below 0%: ${value}% - SETTING TO 0%`
    );
  }

  // STRICTLY enforce: 0 <= percentage <= 100 AND integer values only
  return Math.round(Math.max(0, Math.min(100, value)));
};

/**
 * ✅ ENHANCED PROGRESS BAR VALIDATION
 * Ensures Progress components never exceed 100%
 */
export const validateProgressValue = (value: number, fieldName?: string): number => {
  return validateGlobalPercentage(value, `Progress-${fieldName || 'Unknown'}`);
};
