import { logger } from '@/utils/logger';
import { serverConfig } from '@/config/server-config'; // Import server config
// Import the new types
import {
  InsightIQGetProfileResponse as _InsightIQGetProfileResponse,
  InsightIQProfile,
  InsightIQWorkPlatformList,
  InsightIQUserResponse,
  InsightIQUserRequest,
  InsightIQSDKTokenResponse,
  InsightIQSDKTokenRequest,
  InsightIQGetAudienceResponse,
  // InsightIQProfileList, // Type doesn't seem to exist, will define inline for now
} from '@/types/insightiq';
import { PlatformEnum } from '@/types/enums'; // Import PlatformEnum
// Import the new utility function
import { getInsightIQWorkPlatformId } from './insightiqUtils';
import axios from 'axios'; // Using axios as suggested by Grok for easier handling
// Remove the ApiErrorType import if no longer needed elsewhere after revert
// import { ApiErrorType } from '@/lib/api-verification';
import { Platform } from '@prisma/client';

// --- Add Necessary Type Definitions Inline ---

// Define a type for the filters accepted by getInsightIQProfiles
// This should align with the filters parsed in the API route
interface InsightIQProfileFilters {
  platforms?: PlatformEnum[];
  follower_count?: { min?: number; max?: number };
  is_verified?: boolean;
  locations?: string[]; // e.g., ['US', 'CA']
  // Add other potential filters based on CreatorSearchRequest schema if needed
  searchTerm?: string;
}

// Define a type matching the relevant fields from the CreatorSearchResponse data array
// Based on Grok's analysis and openapi.v1.yml
interface InsightIQSearchProfile {
  external_id?: string | null; // Platform's unique ID for the profile (Primary SSOT)
  platform_username?: string | null; // Handle/Username
  full_name?: string | null;
  url?: string | null;
  image_url?: string | null;
  follower_count?: number | null;
  subscriber_count?: number | null;
  work_platform?: { id: string; name: string; logo_url: string };
  introduction?: string | null; // Bio
  engagement_rate?: number | null;
  creator_location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
  } | null;
  is_verified?: boolean | null;
  platform_account_type?: string | null;
  // Add other fields as needed from the search response...
}

// Define the expected structure for the full /search response
interface CreatorSearchResponse {
  data: InsightIQSearchProfile[];
  metadata?: {
    offset: number;
    limit: number;
    total?: number; // May not be returned by /search
  };
}

// Define the extended profile type
interface InsightIQProfileWithAnalytics extends InsightIQProfile {
  // Add any additional fields needed for the extended profile
}

// Define the expected structure for the analytics response
interface CreatorProfileAnalyticsResponse {
  profile: InsightIQProfileWithAnalytics;
}

// --- Define Mock InsightIQ Profile Data (for Sandbox fallback) ---
// Corrected structure based on cleaned InsightIQProfile type
const mockInsightIQProfile = {
  // Fields from InsightIQProfile (Base)
  id: 'mock-insightiq-id-789',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user: { id: 'mock-user-uuid', name: 'Mock User' },
  account: { id: 'mock-account-uuid', platform_username: 'sandbox_dummy_user' },
  work_platform: {
    id: '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
    name: 'Instagram',
    logo_url: 'https://cdn.insightiq.ai/platforms_logo/logos/logo_instagram.png',
  },
  platform_username: 'sandbox_dummy_user',
  full_name: 'Sandbox Dummy User',
  first_name: 'Sandbox',
  last_name: 'Dummy',
  nick_name: null,
  url: 'https://www.instagram.com/sandbox_dummy_user',
  introduction: 'This is mock data returned because the Sandbox /analytics endpoint failed.',
  image_url: 'https://via.placeholder.com/150/808080/FFFFFF?text=Sandbox+Dummy',
  date_of_birth: null,
  external_id: 'mock-platform-id-sandbox',
  platform_account_type: 'CREATOR',
  category: 'Mock Data',
  website: null,
  // Use nested reputation structure
  reputation: {
    follower_count: 123456,
    // Add other optional reputation fields as null if needed
    following_count: null,
    subscriber_count: null,
    // etc.
  },
  emails: [{ email_id: 'mock@sandbox.invalid', type: 'OTHER' }],
  phone_numbers: null,
  addresses: null,
  gender: null,
  country: null,
  platform_profile_name: 'Sandbox Dummy User',
  platform_profile_id: 'mock-platform-id-sandbox',
  platform_profile_published_at: null,
  is_verified: true,
  is_business: false,
  engagement_rate: 0.01,
  creator_location: null,
  // follower_count: 123456, // Removed top-level duplicate
  is_official_artist: false,

  // Fields specific to InsightIQProfileWithAnalytics extension (should now be valid)
  average_likes: 1234,
  average_comments: 56,
  average_views: null,
  average_reels_views: null,
  content_count: 100,
  sponsored_posts_performance: null,
  reputation_history: null,
  location: null,
  top_hashtags: null,
  top_mentions: null,
  top_interests: null,
  brand_affinity: null,
  top_contents: null,
  recent_contents: null,
  posts_hidden_likes_percentage_value: null,
  sponsored_contents: null,
  lookalikes: null,
  contact_details: null,
  audience: null,
} as InsightIQProfileWithAnalytics;
// --- End Mock Data ---

// --- TODO: WEBHOOK DEPENDENCY NOTE ---
// The data fetched via direct API calls (e.g., getInsightIQProfileById)
// represents a snapshot at the time of the call. InsightIQ uses webhooks
// to notify about asynchronous updates (profile changes, new content, etc.).
// A webhook handler (`/api/webhooks/insightiq`) is needed to process these
// updates and keep the application data fresh. Without it, data displayed
// to the user may become stale.

/**
 * Generates the Basic Auth header value for InsightIQ.
 */
function getInsightIQBasicAuthHeader(): string {
  const clientId = serverConfig.insightiq.clientId;
  const clientSecret = serverConfig.insightiq.clientSecret;

  if (!clientId || !clientSecret) {
    // This check is slightly redundant due to the top-level check, but good practice
    throw new Error('InsightIQ Client ID or Secret is missing in server configuration.');
  }
  logger.info(
    `[InsightIQService] Using Client ID: ${clientId.substring(0, 8)}... for authentication`
  );
  logger.info(
    `[InsightIQService] Client Secret loaded, first 4 chars (hashed for security): ${clientSecret.substring(0, 4).replace(/./g, '*')}... , length: ${clientSecret.length}`
  );
  const credentials = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Simple delay function.
 * @param ms Milliseconds to wait.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes an authenticated request to the InsightIQ API.
 * Handles Basic Authentication and Rate Limiting (429 with Retry-After).
 */
export async function makeInsightIQRequest<T>(
  endpoint: string, // e.g., '/v1/identity/profiles'
  options: RequestInit = {},
  retries = 3 // Number of retries for rate limiting
): Promise<T> {
  const baseUrl = serverConfig.insightiq.baseUrl;
  if (!baseUrl) {
    // Should be caught by serverConfig loading, but good safety check
    throw new Error('InsightIQ Base URL is not configured.');
  }
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    Authorization: getInsightIQBasicAuthHeader(),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  logger.debug(`[InsightIQService] Making request to: ${options.method || 'GET'} ${url}`);

  try {
    // **** ADD EXTREME DEBUG LOGGING (REMOVE AFTER TESTING) ****
    const fetchOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    console.log('[EXTREME DEBUG] Fetch Headers:', JSON.stringify(fetchOptions.headers));
    // **** END EXTREME DEBUG LOGGING ****

    const response = await fetch(url, fetchOptions); // Use the constructed options

    // Log the request-id header if present
    const requestId = response.headers.get('request-id');
    if (requestId) {
      logger.debug(`[InsightIQService] Received request-id: ${requestId} for ${url}`);
    }

    // Handle Rate Limiting (429)
    if (response.status === 429) {
      if (retries > 0) {
        const retryAfterSeconds = parseInt(response.headers.get('Retry-After') || '1', 10);
        const waitMs = retryAfterSeconds * 1000;
        logger.warn(
          `[InsightIQService] Rate limit hit for ${url}. Retrying after ${retryAfterSeconds} seconds. Retries left: ${retries - 1}`
        );
        await delay(waitMs);
        return makeInsightIQRequest<T>(endpoint, options, retries - 1); // Retry the request
      } else {
        logger.error(`[InsightIQService] Rate limit hit for ${url}. No retries left.`);
        throw new Error(`InsightIQ API Rate Limit Exceeded after multiple retries.`);
      }
    }

    if (!response.ok) {
      // Attempt to parse error body for more details
      let errorBody = await response.text();
      try {
        const jsonError = JSON.parse(errorBody);
        // If JSON, stringify for better logging, otherwise use raw text
        errorBody = JSON.stringify(jsonError, null, 2);
      } catch {
        // Ignore if parsing fails, keep raw text
      }
      // Log request-id with error
      logger.warn(
        `[InsightIQService] API Error: ${response.status} ${response.statusText} for ${url} - RequestID: ${requestId || 'N/A'} - Body: ${errorBody}`
      );
      // Consider creating a custom error class for better handling downstream
      throw new Error(
        `InsightIQ API Error (${response.status}): ${response.statusText}. See logs for details.`
      );
    }

    // Handle cases where response might be empty (e.g., 202 Accepted, 204 No Content)
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null as T;
    }
    // Handle 202 Accepted for async jobs
    if (response.status === 202) {
      // The body might contain job details, parse it
      const data = await response.json();
      logger.info(`[InsightIQService] Received 202 Accepted for job: ${data?.id}`);
      return data as T; // Return job details
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    // Log network errors or errors during processing
    logger.error(`[InsightIQService] Failed request to ${url}:`, error);
    // Re-throw the original error or a new generic one
    throw error instanceof Error ? error : new Error('InsightIQ Service request failed.');
  }
}

// --- Implemented API Functions ---

/**
 * Fetches a profile by its InsightIQ Profile ID.
 * Endpoint: GET /v1/profiles/{id}
 *
 * @param profileId The unique ID for the InsightIQ profile.
 * @returns The InsightIQ Profile object or null if not found/error.
 */
export async function getInsightIQProfileById(profileId: string): Promise<InsightIQProfile | null> {
  if (!profileId) {
    logger.warn('[InsightIQService] getInsightIQProfileById called with empty profileId.');
    return null;
  }
  // Check if profileId looks like a UUID (InsightIQ standard ID format)
  // Simple check, might need refinement based on actual ID formats
  const looksLikeUuid =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(profileId);
  if (!looksLikeUuid) {
    logger.warn(
      `[InsightIQService] getInsightIQProfileById called with potentially invalid ID format: ${profileId}. Attempting fetch anyway.`
    );
    // Decide whether to return null or attempt fetch. Attempting fetch for now.
    // return null;
  }

  logger.info(`[InsightIQService] Fetching InsightIQ profile via GET /v1/profiles/${profileId}`);
  const endpoint = `/v1/profiles/${profileId}`;
  try {
    // Use makeInsightIQRequest to fetch the single profile
    const profileResponse = await makeInsightIQRequest<InsightIQProfile>(endpoint, {
      method: 'GET',
    });
    // Log the raw response from GET /v1/profiles/{id}
    logger.debug('[getInsightIQProfileById] Raw response:', { responseData: profileResponse });
    return profileResponse; // Return the fetched profile directly
  } catch (error: unknown) {
    // Distinguish between 404 (Not Found) and other errors
    if ((error as Error).message?.includes('(404)')) {
      logger.warn(
        `[InsightIQService] InsightIQ profile not found via GET /v1/profiles/${profileId}`
      );
      return null;
    } else {
      logger.error(
        `[InsightIQService] Error fetching InsightIQ profile ${profileId} via GET /v1/profiles:`,
        error
      );
      return null; // Return null to avoid breaking downstream processes
    }
  }
}

/**
 * Checks the status of the InsightIQ API connection.
 * Attempts to list work platforms as a basic health check.
 * Endpoint: GET /v1/work-platforms
 */
export async function checkInsightIQConnection(): Promise<{
  success: boolean;
  data?: { platformCount: number };
  error?: string;
}> {
  logger.info('[InsightIQService] Checking InsightIQ API connection...');
  // Ensure endpoint is clean and does not contain comments
  const endpoint = '/v1/work-platforms?limit=1'; // Re-ensure this is the correct, clean path
  try {
    // Revert back to using makeInsightIQRequest
    const response = await makeInsightIQRequest<InsightIQWorkPlatformList>(endpoint);

    // Check if data array exists and has items (or is empty, which is still success)
    const success = !!response && Array.isArray(response.data);
    if (success) {
      logger.info('[InsightIQService] InsightIQ API connection check successful.');
      return { success: true, data: { platformCount: response.data.length } };
    } else {
      logger.warn(
        '[InsightIQService] InsightIQ API connection check returned unexpected data format.',
        response
      );
      return { success: false, error: 'Unexpected response format from health check endpoint.' };
    }
  } catch (error: unknown) {
    logger.error('[InsightIQService] InsightIQ API connection check failed:', error);
    // Use the original error handling logic that relies on makeInsightIQRequest's error
    const errorMessage = (error as { message?: string })?.message?.includes('InsightIQ API Error')
      ? (error as { message: string }).message // Cast to a more specific type
      : 'Failed to connect to InsightIQ API. Check credentials and base URL.';
    return { success: false, error: errorMessage };
  }
}

// --- Implemented API Functions (Updated Placeholders) ---

/**
 * Creates a user entity within InsightIQ if necessary for connection flow.
 * Endpoint: POST /v1/users
 *
 * @param userData Data matching InsightIQUserRequest schema { name: string, external_id: string }
 * @returns InsightIQUserResponse or null on error
 */
export async function createInsightIQUser(
  userData: InsightIQUserRequest
): Promise<InsightIQUserResponse | null> {
  logger.info('[InsightIQService] Attempting to create InsightIQ user...');
  const endpoint = '/v1/users';
  try {
    const response = await makeInsightIQRequest<InsightIQUserResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  } catch (error) {
    logger.error('Error creating InsightIQ user:', error);
    return null;
  }
}

/**
 * Generates configuration/token needed to initialize InsightIQ Connect SDK/Flow.
 * Endpoint: POST /v1/sdk-tokens
 *
 * @param tokenRequestData Data matching InsightIQSDKTokenRequest schema { user_id: string, products: string[] }
 * @returns InsightIQSDKTokenResponse or null on error
 */
export async function getInsightIQSdkConfig(
  tokenRequestData: InsightIQSDKTokenRequest
): Promise<InsightIQSDKTokenResponse | null> {
  logger.warn(
    '[InsightIQService] getInsightIQSdkConfig - Ensure required products are correctly defined.'
  );
  const endpoint = '/v1/sdk-tokens'; // Assuming endpoint based on spec
  try {
    const response = await makeInsightIQRequest<InsightIQSDKTokenResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(tokenRequestData),
    });
    return response;
  } catch (error) {
    logger.error('Error getting InsightIQ SDK config:', error);
    return null;
  }
}

// --- Placeholder Specific API Functions (Blocked by Docs) ---

/**
 * Placeholder: Fetches audience demographics for an InsightIQ account.
 * Endpoint: GET /v1/audience?account_id={accountId}
 *
 * @param accountId The InsightIQ Account ID (UUID)
 * @returns InsightIQGetAudienceResponse or null on error
 */
export async function getInsightIQAudience(
  accountId: string
): Promise<InsightIQGetAudienceResponse | null> {
  logger.warn(
    '[InsightIQService] getInsightIQAudience - Implementation pending full review/testing.'
  );
  const endpoint = `/v1/audience?account_id=${accountId}`; // Based on spec
  try {
    const response = await makeInsightIQRequest<InsightIQGetAudienceResponse>(endpoint);
    return response;
  } catch (error: unknown) {
    if ((error as Error).message?.includes('(404)')) {
      logger.warn(
        `[InsightIQService] InsightIQ audience data not found for accountId: ${accountId}`
      );
      return null;
    } else {
      logger.error(`Error fetching InsightIQ audience data for ${accountId}:`, error);
      return null;
    }
  }
}

// --- Helper to get the unique ID (EXPORTED) ---
// Returns the most stable unique identifier available for linking/fetching.
// Prioritizes external_id, falls back to handle:::work_platform_id, then creates fallback IDs for sandbox
export const getProfileUniqueId = (profile: InsightIQSearchProfile | InsightIQProfile): string => {
  // Prioritize external_id if it exists and is not empty (should be the stable platform profile ID)
  if (profile.external_id && profile.external_id.trim() !== '') {
    return profile.external_id;
  }

  // Fallback: Construct composite key from platform_username and work_platform.id
  const handle = profile.platform_username ?? (profile.url ? profile.url.split('/').pop() : null);
  const platformId = profile.work_platform?.id;

  if (handle && platformId) {
    // Using ::: as a separator to make parsing easier later if needed
    return `${handle}:::${platformId}`;
  }

  // SANDBOX FALLBACK: If neither external_id nor handle+platformId is available
  // Create a fallback identifier for sandbox testing
  if (handle) {
    // Use handle with a default platform identifier for sandbox
    const defaultPlatformId = '9bb8913b-ddd9-430b-a66a-d74d846e6c66'; // Instagram default for sandbox
    logger.warn(`[getProfileUniqueId] Using sandbox fallback identifier for handle: ${handle}`, {
      reason: 'Missing external_id and work_platform.id',
      fallbackId: `${handle}:::${defaultPlatformId}`,
    });
    return `${handle}:::${defaultPlatformId}`;
  }

  // Last resort: Use URL or create a unique identifier based on available data
  if (profile.url) {
    const urlHandle = profile.url.split('/').pop();
    if (urlHandle) {
      const fallbackId = `${urlHandle}:::sandbox-fallback`;
      logger.warn(`[getProfileUniqueId] Using URL-based fallback identifier: ${fallbackId}`, {
        url: profile.url,
        reason: 'Missing all primary identifiers',
      });
      return fallbackId;
    }
  }

  // Ultimate fallback: Create a pseudo-random identifier for sandbox
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const fallbackId = `sandbox-profile-${timestamp}-${randomId}`;

  logger.warn(
    `[getProfileUniqueId] Creating random fallback identifier for sandbox: ${fallbackId}`,
    {
      profileData: {
        id: 'id' in profile ? profile.id : undefined,
        url: profile.url,
        external_id: profile.external_id,
        platform_username: profile.platform_username,
        work_platform_id: profile.work_platform?.id,
      },
      reason: 'No usable identifiers found - this is expected in sandbox mode',
    }
  );

  return fallbackId;
};

// --- Types ---
// Search parameters expected by our service
interface InfluencerSearchParams {
  limit?: number;
  offset?: number;
  work_platform_id?: string;
  min_followers?: number;
  max_followers?: number;
  locations?: string[]; // Assuming country codes/names
  is_verified?: boolean;
  platform_username?: string; // For detail fetch
  external_id?: string; // For detail fetch
  searchTerm?: string;
}

// --- Internal Search Function ---
// Renamed and EXPORTED for use by service layer
export async function searchInsightIQProfilesByParams(
  params: InfluencerSearchParams
): Promise<CreatorSearchResponse | null> {
  const { limit = 100, offset = 0, ...filters } = params;
  const baseUrl = serverConfig.insightiq.baseUrl;
  const endpoint = '/v1/social/creators/profiles/search';
  const url = `${baseUrl}${endpoint}`;

  const requestBody: Record<string, unknown> = {
    limit: limit,
    offset: offset,
    sort_by: { field: 'FOLLOWER_COUNT', order: 'DESCENDING' }, // Always include sort_by
  };

  // Map provided filters
  if (filters.min_followers || filters.max_followers) {
    requestBody.follower_count = { min: filters.min_followers, max: filters.max_followers };
  }
  if (filters.is_verified !== undefined) requestBody.is_verified = filters.is_verified;
  if (filters.external_id) {
    requestBody.external_id = filters.external_id;
  }
  if (filters.work_platform_id) {
    requestBody.work_platform_id = filters.work_platform_id;
    logger.debug(
      `[searchInsightIQProfiles] Using provided work_platform_id: ${filters.work_platform_id}`
    );
  } else {
    // Default to Instagram if no platform ID provided in filters
    const defaultPlatformUuid = getInsightIQWorkPlatformId(PlatformEnum.Instagram);
    if (defaultPlatformUuid) {
      requestBody.work_platform_id = defaultPlatformUuid;
      logger.debug(
        `[searchInsightIQProfiles] No platform filter applied, defaulting work_platform_id to Instagram: ${defaultPlatformUuid}`
      );
    } else {
      logger.error(
        '[searchInsightIQProfiles] Could not get default platform UUID for Instagram! Search might fail.'
      );
      // Consider throwing an error or returning null if default is essential
    }
  }

  // Map searchTerm if present
  if (filters.searchTerm) {
    // ONLY map to description_keywords for general text search
    const searchTermLower = filters.searchTerm.toLowerCase();
    requestBody.description_keywords = [searchTermLower];
    logger.debug(
      `[searchInsightIQProfiles] Adding description_keywords filter (lowercased):`,
      requestBody.description_keywords
    );
  }

  // Handle explicit platform_username filter if needed for other use cases (like detail fetch intermediate search)
  // This should NOT be used for the general marketplace search term now.
  if (filters.platform_username) {
    // This case might still be needed if the intermediate search in fetchDetailedProfile relies on it.
    // Let's keep it for that specific scenario but ensure it's not triggered by the general searchTerm.
    if (!filters.searchTerm) {
      // Only apply if searchTerm isn't already setting it (which it isn't anymore)
      // Ensure this specific username filter is also lowercased if InsightIQ might be case-sensitive
      requestBody.platform_username = { value: filters.platform_username.toLowerCase() };
      logger.debug(
        `[searchInsightIQProfiles] Applying specific platform_username filter (lowercased):`,
        requestBody.platform_username
      );
    }
  }

  logger.debug(`[searchInsightIQProfiles] Calling ${endpoint} with FINAL body:`, requestBody);

  try {
    const response = await axios.post<CreatorSearchResponse>(url, requestBody, {
      headers: {
        Authorization: getInsightIQBasicAuthHeader(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15000, // Add timeout
    });

    // Add detailed logging for the first profile in the response (using INFO level)
    if (response?.data?.data && response.data.data.length > 0) {
      logger.info(
        '[searchInsightIQProfiles] First profile raw data from response:',
        response.data.data[0]
      );
    }

    logger.debug(`[searchInsightIQProfiles] Raw response:`, response.data);

    // Basic validation
    if (!response?.data?.data || !Array.isArray(response.data.data)) {
      logger.warn('[searchInsightIQProfiles] Received unexpected data format.', response.data);
      return null;
    }
    return response.data;
  } catch (error: unknown) {
    logger.error(`[searchInsightIQProfiles] Error: ${(error as Error).message}`, {
      errorData: (error as { response?: { data?: unknown } })?.response?.data,
    });
    // Throw specific error types if needed, otherwise return null or rethrow
    // Returning null for now to allow service layer to handle
    return null;
  }
}

// --- Exported API Functions ---

// Exported function for LIST view - Calls internal search
export async function getInsightIQProfiles(params: {
  limit: number;
  offset: number;
  filters?: InsightIQProfileFilters;
}): Promise<CreatorSearchResponse | null> {
  // Map application filters to API filters
  const apiParams: InfluencerSearchParams = {
    limit: params.limit,
    offset: params.offset,
    work_platform_id: params.filters?.platforms
      ? (getInsightIQWorkPlatformId(params.filters.platforms[0]) ?? undefined)
      : undefined,
    min_followers: params.filters?.follower_count?.min,
    max_followers: params.filters?.follower_count?.max,
    is_verified: params.filters?.is_verified,
    locations: params.filters?.locations,
    searchTerm: params.filters?.searchTerm,
  };
  // Call the INTERNAL search function
  return searchInsightIQProfilesByParams(apiParams);
}

// --- Refined fetchDetailedProfile to be the primary source for profile data including avatar ---
export async function fetchDetailedProfile(
  handle: string,
  platform: Platform // Use Prisma Platform enum directly
): Promise<InsightIQProfileWithAnalytics | null> {
  const platformEnum = mapPrismaPlatformToEnum(platform);
  if (!platformEnum) {
    return null;
  }

  const workPlatformId = getInsightIQWorkPlatformId(platformEnum);
  if (!workPlatformId) {
    logger.error(
      `[InsightIQService] Could not get InsightIQ work_platform_id for PlatformEnum: ${platformEnum} (derived from Prisma Platform: ${platform}) for handle: ${handle}`
    );
    return null;
  }

  logger.info(
    `[InsightIQService] Fetching detailed profile via /analytics for handle: ${handle}, Platform: ${platformEnum} (InsightIQ ID: ${workPlatformId})`
  );

  const endpoint = '/v1/social/creators/profiles/analytics';
  const requestBody = {
    identifier: handle,
    work_platform_id: workPlatformId,
  };

  try {
    // Use makeInsightIQRequest to call the /analytics endpoint
    const analyticsResponse = await makeInsightIQRequest<CreatorProfileAnalyticsResponse>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    if (!analyticsResponse || !analyticsResponse.profile) {
      logger.warn(
        `[InsightIQService] /analytics endpoint returned no profile data for handle: ${handle}, platformId: ${workPlatformId}`,
        { response: analyticsResponse }
      );
      // Fallback to mock data ONLY if in SANDBOX and analytics fails
      if (serverConfig.insightiq.baseUrl?.includes('sandbox')) {
        logger.warn(
          `[InsightIQService] Sandbox mode: Falling back to mock profile data for ${handle} due to analytics failure.`
        );
        return mockInsightIQProfile; // Ensure mockInsightIQProfile is correctly typed as InsightIQProfileWithAnalytics
      }
      return null;
    }

    // Log the raw profile data from the analytics response
    logger.debug(
      `[InsightIQService] Raw profile from /analytics for ${handle}:`,
      analyticsResponse.profile
    );

    // Validate that the returned profile matches the requested handle (case-insensitive)
    const returnedHandle = analyticsResponse.profile.platform_username?.toLowerCase();
    const requestedHandleLower = handle.toLowerCase();

    if (returnedHandle && returnedHandle !== requestedHandleLower) {
      const isSandbox = serverConfig.insightiq.baseUrl?.includes('sandbox');
      const mismatchMessage = `CRITICAL MISMATCH: Requested handle ${requestedHandleLower} but /analytics returned ${returnedHandle}`;
      if (isSandbox) {
        logger.warn(`[Sandbox Mode] ${mismatchMessage}. Proceeding with received data.`);
        // In sandbox mode, accept the mismatch but ensure work_platform is properly set
      } else {
        logger.error(
          `[Non-Sandbox Mode] ${mismatchMessage}. Returning null as data integrity is compromised.`
        );
        return null;
      }
    }

    // SANDBOX FIX: Ensure work_platform.id is available for the getProfileUniqueId function
    let profile = analyticsResponse.profile as InsightIQProfileWithAnalytics;

    // If work_platform.id is missing, add it for sandbox compatibility
    if (!profile.work_platform?.id && serverConfig.insightiq.baseUrl?.includes('sandbox')) {
      logger.warn(
        `[Sandbox Mode] work_platform.id is missing from profile response. Adding fallback platform ID: ${workPlatformId}`
      );
      profile = {
        ...profile,
        work_platform: {
          id: workPlatformId,
          name:
            profile.work_platform?.name ||
            getInsightIQWorkPlatformName(platformEnum) ||
            'Instagram',
          logo_url:
            profile.work_platform?.logo_url ||
            'https://cdn.insightiq.ai/platforms_logo/logos/logo_instagram.png',
        },
      };
    }

    return profile;
  } catch (error: unknown) {
    logger.error(
      `[InsightIQService] Error calling /analytics for handle ${handle}, platformId ${workPlatformId}:`,
      error
    );
    // Fallback to mock data ONLY if in SANDBOX and analytics fails
    if (serverConfig.insightiq.baseUrl?.includes('sandbox')) {
      logger.warn(
        `[InsightIQService] Sandbox mode: Falling back to mock profile data for ${handle} due to analytics call error.`
      );
      return mockInsightIQProfile;
    }
    return null;
  }
}

// Helper function to get platform name for fallback
function getInsightIQWorkPlatformName(platformEnum: PlatformEnum): string | null {
  switch (platformEnum) {
    case PlatformEnum.Instagram:
      return 'Instagram';
    case PlatformEnum.TikTok:
      return 'TikTok';
    case PlatformEnum.YouTube:
      return 'YouTube';
    default:
      return null;
  }
}

// Helper function to map Prisma Platform to PlatformEnum
const mapPrismaPlatformToEnum = (prismaPlatform: Platform): PlatformEnum | null => {
  switch (prismaPlatform) {
    case Platform.INSTAGRAM:
      return PlatformEnum.Instagram;
    case Platform.TIKTOK:
      return PlatformEnum.TikTok;
    case Platform.YOUTUBE:
      return PlatformEnum.YouTube;
    // Cases for FACEBOOK, TWITCH, PINTEREST, LINKEDIN removed as they are not in Prisma Platform enum
    default:
      logger.warn(
        `[InsightIQService] Unmapped Prisma Platform: ${prismaPlatform}. This platform is not currently supported for InsightIQ profile image lookup.`
      );
      // It's important to return null or handle this case, as `platformEnum` is used later.
      // For an unhandled prismaPlatform, getInsightIQWorkPlatformId would likely also return null.
      return null;
  }
};

// TODO: Add other required functions based on analysis of InsightIQ usage and InsightIQ spec
// e.g., getInsightIQContents(accountId), etc.

// Make sure this function is exported
export async function submitSocialProfileScreeningRequest(
  profileUrl: string,
  workPlatformId: string
): Promise<{ jobId: string | null; error?: string }> {
  logger.info(
    `[InsightIQService] Submitting social profile screening for URL: ${profileUrl}, Platform ID: ${workPlatformId}`
  );
  const endpoint = '/v1/safety/social-profile-screening';
  const requestBody = {
    profile_url: profileUrl,
    work_platform_id: workPlatformId,
    // flagging_criteria_id: "YOUR_CRITERIA_ID", // Optional: Add if using custom criteria
  };

  try {
    // Use makeInsightIQRequest which handles auth, errors, retries
    const response = await makeInsightIQRequest<{ id: string; status: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Check response format and status (expecting 202 Accepted with job ID)
    if (response && response.id && response.status === 'IN_PROGRESS') {
      logger.info(`[InsightIQService] Screening request accepted. Job ID: ${response.id}`);
      return { jobId: response.id };
    } else {
      logger.error(
        '[InsightIQService] Unexpected response format or status from screening submission:',
        response
      );
      return { jobId: null, error: 'Unexpected response from InsightIQ' };
    }
  } catch (error: unknown) {
    logger.error(`[InsightIQService] Error submitting screening request for ${profileUrl}:`, error);
    return { jobId: null, error: (error as Error).message || 'Failed to submit screening request' };
  }
}

// Actual implementation would involve calling InsightIQ APIs.
// This is a placeholder service.

// Ensure the service is exported correctly with the refined fetchDetailedProfile
export const insightIQService = {
  fetchDetailedProfile,
  getInsightIQProfileById,
  checkInsightIQConnection,
  createInsightIQUser,
  getInsightIQSdkConfig,
  getInsightIQAudience,
  searchInsightIQProfilesByParams,
  getInsightIQProfiles,
  submitSocialProfileScreeningRequest,
};
