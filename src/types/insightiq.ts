/**
 * Types based on InsightIQ OpenAPI Specification (openapi.v1.yml)
 * Focusing initially on types needed for Profile and related entities.
 */

// From #/components/schemas/UserAttribute
export interface InsightIQUserAttribute {
  id: string; // uuid
  name: string;
}

// From #/components/schemas/WorkPlatformAttribute
export interface InsightIQWorkPlatformAttribute {
  id: string; // uuid
  name: string;
  logo_url: string; // uri
}

// From #/components/schemas/AccountAttribute
export interface InsightIQAccountAttribute {
  id: string; // uuid
  platform_username: string;
}

// From #/components/schemas/Profile - Reputation
export interface InsightIQProfileReputation {
  follower_count?: number | null;
  following_count?: number | null;
  subscriber_count?: number | null;
  paid_subscriber_count?: number | null;
  content_count?: number | null;
  content_group_count?: number | null;
  watch_time_in_hours?: number | null;
  average_open_rate?: number | null;
  average_click_rate?: number | null;
}

// From #/components/schemas/Profile - Email
export interface InsightIQProfileEmail {
  type: 'WORK' | 'OTHER' | 'HOME';
  email_id: string; // email format
}

// From #/components/schemas/Profile - Phone Number
export interface InsightIQProfilePhoneNumber {
  type: 'WORK' | 'OTHER' | 'HOME';
  phone_number: string;
}

// From #/components/schemas/Profile - Address
export interface InsightIQProfileAddress {
  type: 'HOME' | 'WORK' | 'OTHER';
  address: string;
}

// From #/components/schemas/DemographicsAttributes - Countries
export interface InsightIQDemographicsCountry {
  code: string; // 2-letter code
  value: number; // percentage
}

// From #/components/schemas/DemographicsAttributes - Cities
export interface InsightIQDemographicsCity {
  name: string;
  value: number; // percentage
}

// From #/components/schemas/DemographicsAttributes - GenderAge
export interface InsightIQDemographicsGenderAge {
  gender: 'MALE' | 'FEMALE' | 'OTHERS';
  age_range: string; // e.g., "13-18"
  value: number; // percentage
}

// From #/components/schemas/DemographicsAttributes (Main structure from Demographics schema)
export interface InsightIQDemographicsAttributes {
  countries?: InsightIQDemographicsCountry[] | null;
  cities?: InsightIQDemographicsCity[] | null;
  gender_age_distribution?: InsightIQDemographicsGenderAge[] | null;
  // Note: Other demographics like interests, languages, brand affinity exist in ProfileAnalytics response
}

// From #/components/schemas/Content - Engagement (subset relevant for summary/profile)
export interface InsightIQContentEngagement {
  like_count?: number | null;
  comment_count?: number | null;
  view_count?: number | null;
  share_count?: number | null;
  save_count?: number | null;
  impression_organic_count?: number | null;
  reach_organic_count?: number | null;
  // Simplified - omitting paid, email, story nav for now
}

// Main Type based on #/components/schemas/Profile (Expanded slightly)
export interface InsightIQProfile {
  id: string; // uuid
  created_at: string; // date-time
  updated_at: string; // date-time
  user: InsightIQUserAttribute;
  account: InsightIQAccountAttribute;
  work_platform: InsightIQWorkPlatformAttribute;
  platform_username: string | null;
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  nick_name?: string | null;
  url?: string | null; // uri
  introduction?: string | null; // Bio
  image_url?: string | null; // Avatar URL
  date_of_birth?: string | null;
  external_id?: string | null; // Platform's profile ID?
  platform_account_type?: string | null;
  category?: string | null;
  website?: string | null; // uri
  reputation?: InsightIQProfileReputation | null;
  emails?: InsightIQProfileEmail[] | null;
  phone_numbers?: InsightIQProfilePhoneNumber[] | null;
  addresses?: InsightIQProfileAddress[] | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED' | null;
  country?: string | null; // e.g., "US"
  platform_profile_name?: string | null; // Display name on platform
  platform_profile_id?: string | null; // Unique ID on platform
  platform_profile_published_at?: string | null; // date-time
  is_verified?: boolean | null;
  is_business?: boolean | null;
  // Add fields found in /search response
  engagement_rate?: number | null;
  creator_location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  // NOTE: Audience demographics might come from a separate endpoint like /v1/audience
  is_official_artist?: boolean | null;
}

// Type for the response of GET /v1/profiles/{id}
// Note: This might not contain full audience/engagement details per the spec.
export type InsightIQGetProfileResponse = InsightIQProfile;

// Type for the response of GET /v1/audience (Based on schema Demographics)
export interface InsightIQGetAudienceResponse extends InsightIQDemographicsAttributes {
  id: string; // uuid of the demographics report itself?
  created_at: string; // date-time
  updated_at: string; // date-time
  user: InsightIQUserAttribute;
  account: InsightIQAccountAttribute;
  work_platform: InsightIQWorkPlatformAttribute;
}

// Type for response of POST /v1/users
export interface InsightIQUserResponse {
  name: string;
  external_id: string;
  id: string; // uuid
  created_at: string; // date-time
  updated_at: string; // date-time
  status: 'ACTIVE' | 'INACTIVE';
}

// Type for request of POST /v1/users
export interface InsightIQUserRequest {
  name: string;
  external_id: string;
}

// Type for response of POST /v1/sdk-tokens
export interface InsightIQSDKTokenResponse {
  sdk_token: string;
  expires_at: string; // date-time
}

// Type for request of POST /v1/sdk-tokens
export interface InsightIQSDKTokenRequest {
  user_id: string; // InsightIQ User ID (UUID)
  products: string[]; // e.g., ["IDENTITY", "ENGAGEMENT"]
}

// Minimal type for GET /v1/work-platforms response (for health check)
export interface InsightIQWorkPlatformList {
  data: InsightIQWorkPlatformAttribute[];
  // metadata omitted for simplicity
}

// Explicit type for MarketplaceInfluencer including the relation
// Based on Prisma schema and generated types
import {
  MarketplaceInfluencer as PrismaMarketplaceInfluencer,
  InsightIQAccountLink as PrismaInsightIQAccountLink,
  Platform,
} from '@prisma/client';

export type MarketplaceInfluencerWithLinks = PrismaMarketplaceInfluencer & {
  insightiqAccountLinks: PrismaInsightIQAccountLink[];
};

// ADD This Interface for the /search endpoint response data structure
export interface InsightIQSearchProfile {
  external_id?: string | null;
  platform_username?: string | null;
  full_name?: string | null;
  url?: string | null;
  image_url?: string | null;
  follower_count?: number | null;
  subscriber_count?: number | null;
  work_platform?: { id: string; name: string; logo_url: string };
  introduction?: string | null;
  engagement_rate?: number | null;
  creator_location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  is_verified?: boolean | null;
  platform_account_type?: string | null;
  // Add other fields from CreatorProfileBasicDetails if needed...
}

// Interface for the audience object within CreatorProfileAnalyticsResponse
interface InsightIQAudienceAnalytics {
  ethnicities?: { name: string; value: number }[] | null;
  languages?: { code: string; value: number }[] | null;
  brand_affinity?: { name: string; value: number }[] | null;
  interests?: { name: string; value: number }[] | null;
  follower_types?: { name: string; value: number }[] | null; // e.g., REAL, SUSPICIOUS
  lookalikes?: InsightIQSearchProfile[] | null;
  credibility_score?: number | null;
  credibility_score_band?: { min?: number; max?: string; total_profile_count?: number }[] | null;
  significant_followers_percentage?: number | null;
  significant_followers?: InsightIQSearchProfile | null; // Or array?
  countries?: InsightIQDemographicsCountry[] | null;
  cities?: InsightIQDemographicsCity[] | null;
  gender_age_distribution?: InsightIQDemographicsGenderAge[] | null;
}

// Extend InsightIQProfile to include the audience object from analytics
// Note: This might overlap/conflict with fields already added from /search. Review carefully.
export interface InsightIQProfileWithAnalytics extends InsightIQProfile {
  // Fields potentially duplicated or richer in analytics response
  average_likes?: number | null;
  average_comments?: number | null;
  average_views?: number | null;
  average_reels_views?: number | null;
  // engagement_rate is already optional in InsightIQProfile
  content_count?: number | null;
  sponsored_posts_performance?: number | null;
  reputation_history?:
    | {
        month?: string | null;
        follower_count?: number | null;
        subscriber_count?: number | null;
        following_count?: number | null;
        average_likes?: number | null;
      }[]
    | null;
  location?: {
    // Note: OpenAPI shows location here, different from creator_location
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  top_hashtags?: { name: string }[] | null;
  top_mentions?: { name: string }[] | null;
  top_interests?: { name: string }[] | null;
  brand_affinity?: { name: string; value: number }[] | null; // Different structure?
  top_contents?: any[] | null; // Define CreatorContentBasicDetails later if needed
  recent_contents?: any[] | null;
  posts_hidden_likes_percentage_value?: number | null;
  sponsored_contents?: any[] | null;
  lookalikes?: InsightIQSearchProfile[] | null;
  contact_details?: { type?: string | null; value?: string | null }[] | null;
  // The crucial audience object
  audience?: InsightIQAudienceAnalytics | null;
}

// Type for the response of POST /v1/social/creators/profiles/analytics
export interface CreatorProfileAnalyticsResponse {
  id: string; // ID of the analytics report
  work_platform: InsightIQWorkPlatformAttribute;
  profile: InsightIQProfileWithAnalytics; // The nested profile object with audience data
  // Add other top-level fields like pricing if needed later
}

// Interface for a single Work Platform
