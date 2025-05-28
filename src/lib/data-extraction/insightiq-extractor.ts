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
      isPlatformVerified: boolean;
      isBusinessAccount: boolean;
      isOfficialArtist: boolean;
      accountAge: number | null; // Days since creation
      accountCreationDate: string | null;
      profileCompleteness: number | null;
    };
    location: {
      city: string | null;
      state: string | null;
      country: string | null;
      timezone: string | null;
      coordinates: { lat: number; lng: number } | null;
    };
    category: string | null;
    biography: {
      length: number | null;
      language: string | null;
      hasLinks: boolean;
      hasHashtags: boolean;
      mentionsCount: number;
    };
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
}

// 🧮 **CORE EXTRACTION FUNCTIONS**

/**
 * Extract Trust & Authenticity Data - High Priority Analysis
 */
function extractTrustData(influencer: InfluencerProfileData): InsightIQExtractedData['trust'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const audienceData = insightiq?.audience;

  // InsightIQ credibility score - check if it's already 0-100 or 0-1
  const rawCredibilityScore = audienceData?.credibility_score || 0;
  const credibilityScore =
    rawCredibilityScore > 1
      ? Math.round(rawCredibilityScore) // Already percentage (73)
      : Math.round(rawCredibilityScore * 100); // Decimal (0.73 -> 73)

  const followerTypes = (audienceData?.follower_types || []).map((type: any) => ({
    name: type.name,
    value: type.value, // Keep as raw value for now
    category: getFollowerTypeCategory(type.name),
  }));

  // InsightIQ significant followers percentage - check format
  const rawSignificantPercentage = audienceData?.significant_followers_percentage || 0;
  const significantFollowersPercentage =
    rawSignificantPercentage > 1
      ? Math.round(rawSignificantPercentage) // Already percentage
      : Math.round(rawSignificantPercentage * 100); // Decimal to percentage

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
    ? Math.round(
        realFollowersData.value > 1 ? realFollowersData.value : realFollowersData.value * 100
      )
    : 0;
  const suspiciousFollowersPercentage = suspiciousFollowersData
    ? Math.round(
        suspiciousFollowersData.value > 1
          ? suspiciousFollowersData.value
          : suspiciousFollowersData.value * 100
      )
    : 0;
  const qualityFollowersPercentage = qualityFollowersData
    ? Math.round(
        qualityFollowersData.value > 1
          ? qualityFollowersData.value
          : qualityFollowersData.value * 100
      )
    : 0;
  const massFollowersPercentage = massFollowersData
    ? Math.round(
        massFollowersData.value > 1 ? massFollowersData.value : massFollowersData.value * 100
      )
    : 0;
  const influencerFollowersPercentage = influencerFollowersData
    ? Math.round(
        influencerFollowersData.value > 1
          ? influencerFollowersData.value
          : influencerFollowersData.value * 100
      )
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

/**
 * Extract Professional Intelligence Data - Background Checks
 */
function extractProfessionalData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['professional'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;

  // Contact details from multiple sources
  const contactDetails = (insightiq?.contact_details || []).map((contact: any) => ({
    type: contact.type,
    value: contact.value,
    category: categorizeContactType(contact.type),
  }));

  // Enhanced email extraction from multiple sources
  const emails: Array<{ type: string; email: string; isPrimary: boolean; verified: boolean }> = [];

  // 1. From profile.emails array
  (insightiq?.profile?.emails || []).forEach((email: any, index: number) => {
    emails.push({
      type: email.type || 'PROFILE',
      email: email.email_id || email.email,
      isPrimary: email.type === 'WORK' || email.isPrimary || index === 0,
      verified: email.verified || false,
    });
  });

  // 2. From contacts.email (direct contact)
  if (insightiq?.contacts?.email && !emails.find(e => e.email === insightiq.contacts.email)) {
    emails.push({
      type: 'CONTACT',
      email: insightiq.contacts.email,
      isPrimary: emails.length === 0,
      verified: false,
    });
  }

  // 3. From influencer.contactEmail (legacy field)
  if (influencer.contactEmail && !emails.find(e => e.email === influencer.contactEmail)) {
    emails.push({
      type: 'LEGACY',
      email: influencer.contactEmail,
      isPrimary: emails.length === 0,
      verified: false,
    });
  }

  // 4. From contact_details array
  contactDetails.forEach((contact: { type: string; value: string; category: string }) => {
    if (contact.category === 'email' && !emails.find(e => e.email === contact.value)) {
      emails.push({
        type: contact.type || 'EXTRACTED',
        email: contact.value,
        isPrimary: emails.length === 0,
        verified: false,
      });
    }
  });

  // Enhanced phone number extraction from multiple sources
  const phoneNumbers: Array<{ type: string; number: string; country?: string; verified: boolean }> =
    [];

  // 1. From profile.phone_numbers array
  (insightiq?.profile?.phone_numbers || []).forEach((phone: any) => {
    phoneNumbers.push({
      type: phone.type || 'PROFILE',
      number: phone.phone_number || phone.number,
      country: phone.country_code || phone.country,
      verified: phone.verified || false,
    });
  });

  // 2. From contacts.phone (direct contact)
  if (
    insightiq?.contacts?.phone &&
    !phoneNumbers.find(p => p.number === insightiq.contacts.phone)
  ) {
    phoneNumbers.push({
      type: 'CONTACT',
      number: insightiq.contacts.phone,
      country: insightiq.contacts.phone_country || undefined,
      verified: false,
    });
  }

  // 3. From contact_details array
  contactDetails.forEach((contact: { type: string; value: string; category: string }) => {
    if (contact.category === 'phone' && !phoneNumbers.find(p => p.number === contact.value)) {
      phoneNumbers.push({
        type: contact.type || 'EXTRACTED',
        number: contact.value,
        country: undefined,
        verified: false,
      });
    }
  });

  // Enhanced website extraction from multiple sources
  let website =
    influencer.website || insightiq?.contacts?.website || insightiq?.profile?.website || null;

  // Check contact_details for website
  const websiteContact = contactDetails.find(
    (contact: { type: string; value: string; category: string }) => contact.category === 'website'
  );
  if (websiteContact && !website) {
    website = websiteContact.value;
  }

  // Addresses
  const addresses = (insightiq?.profile?.addresses || []).map((address: any) => ({
    type: address.type || 'ADDRESS',
    address:
      address.address_line_1 || address.full_address || address.address || 'Address Available',
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postal_code || address.zip_code,
  }));

  // Enhanced social profiles extraction
  const socialProfiles: Array<{
    platform: string;
    url: string;
    username: string;
    verified: boolean;
  }> = [];

  // 1. From profile.social_profiles array
  (insightiq?.profile?.social_profiles || []).forEach((profile: any) => {
    socialProfiles.push({
      platform: profile.platform,
      url: profile.url,
      username: profile.username,
      verified: profile.verified || false,
    });
  });

  // 2. From contact_details array
  contactDetails.forEach((contact: { type: string; value: string; category: string }) => {
    if (contact.category === 'social' && !socialProfiles.find(p => p.url === contact.value)) {
      const platform = extractPlatformFromUrl(contact.value) || contact.type;
      const username = extractUsernameFromUrl(contact.value) || 'Profile Available';
      socialProfiles.push({
        platform,
        url: contact.value,
        username,
        verified: false,
      });
    }
  });

  // Account type determination with enhanced logic
  const accountType = determineAccountType(insightiq?.profile);

  // Verification status
  const verificationStatus = {
    isPlatformVerified: influencer.isVerified || false,
    isBusinessAccount:
      influencer.isBusinessAccount || insightiq?.profile?.is_business_account || false,
    isOfficialArtist: insightiq?.profile?.is_official_artist || false,
    accountAge: calculateAccountAge(insightiq?.profile?.platform_profile_published_at),
    accountCreationDate: insightiq?.profile?.platform_profile_published_at || null,
    profileCompleteness:
      insightiq?.profile?.profile_completeness ||
      calculateProfileCompleteness({
        emails: emails.length,
        phones: phoneNumbers.length,
        website: Boolean(website),
        bio: Boolean(influencer.bio),
        avatar: Boolean(influencer.avatarUrl),
      }),
  };

  // Enhanced location data
  const location = {
    city:
      insightiq?.demographics?.location?.city ||
      insightiq?.location?.city ||
      insightiq?.profile?.location?.city ||
      null,
    state:
      insightiq?.demographics?.location?.state ||
      insightiq?.location?.state ||
      insightiq?.profile?.location?.state ||
      null,
    country:
      insightiq?.demographics?.location?.country ||
      insightiq?.location?.country ||
      insightiq?.profile?.location?.country ||
      influencer.primaryAudienceLocation ||
      null,
    timezone: insightiq?.demographics?.location?.timezone || insightiq?.profile?.timezone || null,
    coordinates:
      insightiq?.demographics?.location?.coordinates || insightiq?.location?.coordinates
        ? {
            lat:
              insightiq?.demographics?.location?.coordinates?.lat ||
              insightiq?.location?.coordinates?.lat,
            lng:
              insightiq?.demographics?.location?.coordinates?.lng ||
              insightiq?.location?.coordinates?.lng,
          }
        : null,
  };

  // Biography analysis
  const biography = {
    length: influencer.bio?.length || null,
    language: insightiq?.profile?.bio_language || insightiq?.demographics?.language || null,
    hasLinks: Boolean(influencer.bio?.includes('http') || influencer.bio?.includes('www.')),
    hasHashtags: Boolean(influencer.bio?.includes('#')),
    mentionsCount: (influencer.bio?.match(/@\w+/g) || []).length,
  };

  return {
    contactDetails,
    emails,
    phoneNumbers,
    addresses,
    website,
    socialProfiles,
    accountType,
    verificationStatus,
    location,
    category: influencer.category ?? null,
    biography,
  };
}

// Helper functions for enhanced contact extraction
function extractPlatformFromUrl(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('instagram')) return 'Instagram';
  if (urlLower.includes('twitter') || urlLower.includes('x.com')) return 'Twitter/X';
  if (urlLower.includes('linkedin')) return 'LinkedIn';
  if (urlLower.includes('tiktok')) return 'TikTok';
  if (urlLower.includes('youtube')) return 'YouTube';
  if (urlLower.includes('facebook')) return 'Facebook';
  return 'Social Media';
}

function extractUsernameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(s => s.length > 0);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch {
    return null;
  }
}

function calculateProfileCompleteness(data: {
  emails: number;
  phones: number;
  website: boolean;
  bio: boolean;
  avatar: boolean;
}): number {
  let score = 0;
  const maxScore = 5;

  if (data.emails > 0) score += 1;
  if (data.phones > 0) score += 1;
  if (data.website) score += 1;
  if (data.bio) score += 1;
  if (data.avatar) score += 1;

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
    rate: influencer.engagementRate ?? null,
    averageLikes: insightiq?.average_likes || insightiq?.engagement?.averageLikes || null,
    averageComments: insightiq?.average_comments || insightiq?.engagement?.averageComments || null,
    averageViews: insightiq?.average_views || insightiq?.engagement?.averageViews || null,
    averageReelsViews:
      insightiq?.average_reels_views || insightiq?.engagement?.averageReelsViews || null,
    averageShares: insightiq?.average_shares || insightiq?.engagement?.averageShares || null,
    averageSaves: insightiq?.average_saves || insightiq?.engagement?.averageSaves || null,
    likesToCommentsRatio: insightiq?.engagement?.likes_to_comments_ratio || null,
    peakEngagementHours: insightiq?.engagement?.peak_hours || [],
    engagementTrend: insightiq?.engagement?.trend || ('UNKNOWN' as const),
  };

  const sponsored = {
    performance: insightiq?.sponsored_posts_performance || null,
    postsCount: insightiq?.sponsored_contents?.length || null,
    totalSponsoredContent:
      insightiq?.sponsored_contents?.reduce(
        (total: number, content: any) => total + (content.performance || 0),
        0
      ) || null,
    sponsoredEngagementAverage:
      insightiq?.sponsored_contents?.length > 0
        ? insightiq.sponsored_contents.reduce(
            (total: number, content: any) => total + (content.performance || 0),
            0
          ) / insightiq.sponsored_contents.length
        : null,
    organicComparison: {
      sponsoredEngagement: null, // Calculate from sponsored content data
      organicEngagement: null, // Calculate from organic content data
      ratio: null, // Calculate ratio
      performance: 'UNKNOWN' as const,
    },
    brandCollaborations: insightiq?.brand_collaborations || [],
  };

  const reputation = {
    followerCount: influencer.followersCount,
    followingCount: insightiq?.profile?.reputation?.following_count || null,
    subscriberCount: insightiq?.profile?.reputation?.subscriber_count || null,
    contentCount: insightiq?.content_count || insightiq?.content?.contentCount || null,
    totalPostsCount: insightiq?.profile?.total_posts || null,
    averagePostFrequency: insightiq?.profile?.average_post_frequency || null,
    followerToFollowingRatio:
      influencer.followersCount && insightiq?.profile?.reputation?.following_count
        ? Math.round(
            (influencer.followersCount / insightiq.profile.reputation.following_count) * 100
          ) / 100
        : null,
    postToFollowerRatio:
      insightiq?.profile?.total_posts && influencer.followersCount
        ? Math.round((insightiq.profile.total_posts / influencer.followersCount) * 10000) / 10000
        : null,
  };

  const trends = {
    reputationHistory:
      insightiq?.analytics?.reputationHistory || insightiq?.reputation_history || [],
    engagementRateHistogram:
      insightiq?.engagement?.engagementRateHistogram || insightiq?.engagement_rate_histogram || [],
    growthMetrics: {
      followerGrowthRate: insightiq?.growth_metrics?.follower_growth_rate || null,
      engagementGrowthRate: insightiq?.growth_metrics?.engagement_growth_rate || null,
      contentGrowthRate: insightiq?.growth_metrics?.content_growth_rate || null,
    },
    seasonalTrends: insightiq?.seasonal_trends || [],
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
        caption: content.caption,
        likes: content.likes || 0,
        comments: content.comments || 0,
        shares: content.shares,
        date: content.date || '',
        performance: content.performance || 0,
        isSponsored: content.is_sponsored || false,
      })
    ),
    recentContents: (insightiq?.recent_contents || insightiq?.content?.recentContents || []).map(
      (content: any) => ({
        id: content.id || '',
        type: content.type || 'post',
        url: content.url,
        caption: content.caption,
        likes: content.likes || 0,
        comments: content.comments || 0,
        date: content.date || '',
        hashtags: content.hashtags || [],
        mentions: content.mentions || [],
      })
    ),
    sponsoredContents: (
      insightiq?.sponsored_contents ||
      insightiq?.content?.sponsoredContents ||
      []
    ).map((content: any) => ({
      id: content.id || '',
      brandName: content.brand_name || 'Unknown',
      type: content.type || 'post',
      performance: content.performance || 0,
      date: content.date || '',
      disclosureType: content.disclosure_type || 'unknown',
    })),
    contentAnalysis,
    strategy,
    qualityMetrics,
  };
}

/**
 * Extract Audience Intelligence Data
 */
function extractAudienceData(
  influencer: InfluencerProfileData
): InsightIQExtractedData['audience'] {
  const insightiq = (influencer as InfluencerProfileData & { insightiq?: any }).insightiq;
  const audienceData = insightiq?.audience;

  // Helper function to normalize percentage values
  const normalizePercentage = (value: number): number => {
    // If value is greater than 1, assume it's already a percentage (26.0 = 26%)
    // If value is less than or equal to 1, assume it's a decimal (0.26 = 26%)
    return value > 1 ? value / 100 : value;
  };

  const demographics = {
    countries: (audienceData?.countries || []).map((country: any, index: number) => ({
      code: country.code,
      name: country.name,
      value: normalizePercentage(country.value || 0),
      rank: index + 1,
    })),
    cities: (audienceData?.cities || []).map((city: any, index: number) => ({
      name: city.name,
      value: normalizePercentage(city.value || 0),
      country: city.country,
      rank: index + 1,
    })),
    genderAgeDistribution: (audienceData?.gender_age_distribution || []).map((item: any) => ({
      gender: item.gender,
      ageRange: item.ageRange,
      value: normalizePercentage(item.value || 0),
      interests: item.interests || [],
    })),
    ethnicities: (audienceData?.ethnicities || []).map((ethnicity: any) => ({
      name: ethnicity.name,
      value: normalizePercentage(ethnicity.value || 0),
      region: ethnicity.region,
    })),
    languages: (audienceData?.languages || []).map((language: any, index: number) => ({
      code: language.code,
      name: language.name,
      value: normalizePercentage(language.value || 0),
      primary: index === 0,
    })),
    occupations: (audienceData?.occupations || []).map((occupation: any) => ({
      name: occupation.name,
      value: normalizePercentage(occupation.value || 0),
      industry: occupation.industry,
    })),
    incomeDistribution: (audienceData?.income_distribution || []).map((income: any) => ({
      range: income.range,
      percentage: normalizePercentage(income.percentage || 0),
    })),
    educationLevels: (audienceData?.education_levels || []).map((education: any) => ({
      level: education.level,
      percentage: normalizePercentage(education.percentage || 0),
    })),
  };

  const likers = {
    significantLikersPercentage:
      audienceData?.audienceLikers?.significant_likers_percentage || null,
    credibilityScore: audienceData?.audienceLikers?.credibility_score || null,
    significantLikers: (audienceData?.audienceLikers?.significant_likers || []).map(
      (liker: any) => ({
        platformUsername: liker.platformUsername,
        imageUrl: liker.imageUrl,
        isVerified: liker.isVerified,
        followerCount: liker.followerCount,
        influence: liker.influence || ('MEDIUM' as const),
        niche: liker.niche,
      })
    ),
    countries: (audienceData?.audienceLikers?.countries || []).map((country: any) => ({
      code: country.code,
      value: normalizePercentage(country.value || 0),
    })),
    averageEngagementOfLikers: audienceData?.audienceLikers?.average_engagement || null,
    likerGrowthRate: audienceData?.audienceLikers?.growth_rate || null,
  };

  const behavior = {
    peakActivityHours: audienceData?.behavior?.peak_activity_hours || [],
    deviceUsage: (audienceData?.behavior?.device_usage || []).map((device: any) => ({
      device: device.device,
      percentage: normalizePercentage(device.percentage || 0),
    })),
    platformCrossover: (audienceData?.behavior?.platform_crossover || []).map((platform: any) => ({
      platform: platform.platform,
      percentage: normalizePercentage(platform.percentage || 0),
    })),
    shoppingBehavior: {
      onlineShopping: audienceData?.behavior?.shopping_behavior?.online_shopping || null,
      brandLoyalty: audienceData?.behavior?.shopping_behavior?.brand_loyalty || null,
      purchaseInfluence: audienceData?.behavior?.shopping_behavior?.purchase_influence || null,
    },
  };

  return {
    demographics,
    interests: (audienceData?.interests || []).map((interest: any) => ({
      name: interest.name,
      value: normalizePercentage(interest.value || 0),
      category: interest.category,
      trendingScore: interest.trending_score,
    })),
    brandAffinity: (audienceData?.brand_affinity || []).map((brand: any) => ({
      name: brand.name,
      value: normalizePercentage(brand.value || 0),
      category: brand.category,
      logoUrl: brand.logoUrl,
      industry: brand.industry,
      priceRange: brand.price_range,
    })),
    credibilityBand: (audienceData?.credibility_score_band || []).map(
      (band: any, index: number) => ({
        min: band.min,
        max: band.max,
        totalProfileCount: band.totalProfileCount,
        percentile:
          band.percentile ||
          ((index + 1) / (audienceData?.credibility_score_band?.length || 1)) * 100,
      })
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

  return {
    lookalikes: (insightiq?.analytics?.lookalikes || insightiq?.lookalikes || []).map(
      (lookalike: any) => ({
        ...lookalike,
        niche: lookalike.niche,
        collaborationPotential: lookalike.collaboration_potential || ('MEDIUM' as const),
      })
    ),
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

function categorizeContactType(type: string): 'email' | 'phone' | 'social' | 'website' | 'other' {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('email')) return 'email';
  if (lowerType.includes('phone') || lowerType.includes('mobile')) return 'phone';
  if (
    lowerType.includes('twitter') ||
    lowerType.includes('instagram') ||
    lowerType.includes('social')
  )
    return 'social';
  if (lowerType.includes('website') || lowerType.includes('url') || lowerType.includes('link'))
    return 'website';
  return 'other';
}

function determineAccountType(profileData: any): 'PERSONAL' | 'CREATOR' | 'BUSINESS' | 'UNKNOWN' {
  if (profileData?.platform_account_type === 'BUSINESS' || profileData?.is_business) {
    return 'BUSINESS';
  }
  if (profileData?.category || profileData?.is_official_artist) {
    return 'CREATOR';
  }
  if (profileData?.platform_account_type === 'PERSONAL') {
    return 'PERSONAL';
  }
  return 'UNKNOWN';
}

function calculateAccountAge(createdAt: string | null | undefined): number | null {
  if (!createdAt) return null;
  const createdDate = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
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
