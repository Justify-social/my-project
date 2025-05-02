import { logger } from '@/utils/logger';
import { serverConfig } from '@/config/server-config'; // Import server config
// Import the new types
import {
  InsightIQGetProfileResponse,
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

// --- Add Necessary Type Definitions Inline ---

// Define an inline type for the expected list response structure for GET /v1/profiles
interface InsightIQProfileListResponse {
  data: InsightIQProfile[];
  metadata?: {
    offset: number;
    limit: number;
    total?: number;
  };
}

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
      } catch (e) {
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
  } catch (error: any) {
    // Distinguish between 404 (Not Found) and other errors
    if (error.message?.includes('(404)')) {
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
  data?: any;
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
  } catch (error: any) {
    logger.error('[InsightIQService] InsightIQ API connection check failed:', error);
    // Use the original error handling logic that relies on makeInsightIQRequest's error
    const errorMessage = error?.message?.includes('InsightIQ API Error')
      ? error.message // Pass specific API error
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
  } catch (error: any) {
    if (error.message?.includes('(404)')) {
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
// Prioritizes external_id, falls back to handle:::work_platform_id
export const getProfileUniqueId = (profile: InsightIQSearchProfile | InsightIQProfile): string => {
  // Prioritize external_id if it exists (should be the stable platform profile ID)
  if (profile.external_id) {
    return profile.external_id;
  }

  // Fallback: Construct composite key from platform_username and work_platform.id
  // This is less reliable if work_platform.id from search is inconsistent.
  const handle = profile.platform_username ?? (profile.url ? profile.url.split('/').pop() : null);
  const platformId = profile.work_platform?.id;

  if (handle && platformId) {
    // Using ::: as a separator to make parsing easier later if needed
    return `${handle}:::${platformId}`;
  }

  // If neither external_id nor handle+platformId is available
  logger.error(
    `[getProfileUniqueId] Profile lacks usable unique identifier (external_id or handle+platformId)`,
    {
      profileData: {
        id: 'id' in profile ? profile.id : undefined, // Check if 'id' exists
        url: profile.url,
        external_id: profile.external_id,
        platform_username: profile.platform_username,
        work_platform_id: profile.work_platform?.id,
      },
    }
  );
  // Throwing error because we cannot reliably link/fetch without an ID
  throw new Error(
    'Profile lacks required identifiers (external_id or derivable handle+platformId)'
  );
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

  const requestBody: any = {
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
  } catch (error: any) {
    logger.error(`[searchInsightIQProfiles] Error: ${error.message}`, {
      errorData: error?.response?.data,
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

// ** EXPORTED Function for DETAIL view - Refactored for SSOT **
// Renaming to fetchDetailedProfile and accepting platformId
export async function fetchDetailedProfile(
  handle: string,
  platformId: string // Accept the potentially unreliable platformId initially
): Promise<InsightIQProfileWithAnalytics | null> {
  // Return the extended profile type
  logger.info(
    `[InsightIQService] Fetching detailed profile for handle: ${handle}, initial platformId: ${platformId}`
  );

  // 1. Perform intermediate search by handle to find reliable IDs
  let reliablePlatformId: string | null = null;
  let reliableExternalId: string | null = null;

  logger.info(
    `[InsightIQService] Performing intermediate search by handle '${handle}' to find reliable IDs.`
  );
  try {
    const searchParams: InfluencerSearchParams = { platform_username: handle, limit: 5 };
    // Use the EXPORTED search function
    const intermediateSearchResponse = await searchInsightIQProfilesByParams(searchParams);

    if (intermediateSearchResponse?.data && intermediateSearchResponse.data.length > 0) {
      const matchingProfile = intermediateSearchResponse.data.find(
        p => p.platform_username?.toLowerCase() === handle?.toLowerCase()
      );
      if (matchingProfile) {
        reliableExternalId = matchingProfile.external_id ?? null;
        reliablePlatformId = matchingProfile.work_platform?.id ?? null;
        logger.info(
          `[InsightIQService] Intermediate search found match for handle '${handle}'. ExternalID: ${reliableExternalId}, PlatformID: ${reliablePlatformId}`
        );
      } else {
        logger.warn(
          `[InsightIQService] Intermediate search completed, but no exact handle match found for '${handle}' in results.`
        );
        if (intermediateSearchResponse.data.length === 1) {
          logger.warn(
            `[InsightIQService] Using first result from intermediate search as potential match.`
          );
          reliableExternalId = intermediateSearchResponse.data[0].external_id ?? null;
          reliablePlatformId = intermediateSearchResponse.data[0].work_platform?.id ?? null;
        }
      }
    } else {
      logger.warn(
        `[InsightIQService] Intermediate search by handle '${handle}' returned no results.`
      );
    }
  } catch (searchError) {
    logger.error(
      `[InsightIQService] Error during intermediate search for handle '${handle}':`,
      searchError
    );
  }

  // 2. Determine the platformId to use for the /analytics call
  const platformIdToUse = reliablePlatformId ?? platformId; // Prefer reliable ID, fallback to initial one
  if (!reliablePlatformId) {
    logger.warn(`[InsightIQService] Using potentially unreliable platformId: ${platformIdToUse}`);
  }

  // 3. Final Fetch Strategy: Prioritize POST /analytics
  logger.info(
    `[InsightIQService] Attempting fetch via POST /analytics using handle '${handle}' and platformId '${platformIdToUse}'`
  );
  const profileFromAnalytics = await callAnalyticsEndpoint(handle, platformIdToUse);

  if (profileFromAnalytics) {
    // Validate handle match if needed
    if (profileFromAnalytics.platform_username?.toLowerCase() !== handle.toLowerCase()) {
      logger.error(
        `CRITICAL MISMATCH: Requested handle ${handle} but /analytics returned ${profileFromAnalytics.platform_username}`
      );
      // If mismatch occurs even with potentially corrected platformId, something is wrong upstream or with API
      return null;
    }
    logger.info(`[InsightIQService] Successfully fetched via /analytics for handle ${handle}`);
    return profileFromAnalytics;
  }

  // 4. Fallback: If analytics failed, AND we have a reliable externalId, try GET /profiles
  logger.warn(`[InsightIQService] POST /analytics failed for handle ${handle}.`);
  if (reliableExternalId) {
    logger.warn(
      `[InsightIQService] Falling back to GET /profiles/${reliableExternalId} (may lack audience data).`
    );
    try {
      const profile = await getInsightIQProfileById(reliableExternalId);
      if (profile) {
        // Check handle match here too for safety
        if (profile.platform_username?.toLowerCase() !== handle.toLowerCase()) {
          logger.error(
            `CRITICAL MISMATCH: GET /profiles/${reliableExternalId} returned handle ${profile.platform_username} instead of requested ${handle}`
          );
          return null;
        }
        logger.info(
          `[InsightIQService] Successfully fetched via fallback GET /profiles/${reliableExternalId}`
        );
        return profile as InsightIQProfileWithAnalytics; // Cast, accepting audience might be missing
      } else {
        logger.error(`[InsightIQService] Fallback GET /profiles/${reliableExternalId} failed.`);
        return null;
      }
    } catch (error) {
      logger.error(
        `[InsightIQService] Error during fallback GET /profiles/${reliableExternalId}:`,
        error
      );
      return null;
    }
  }

  // 5. If all methods failed:
  logger.error(`[InsightIQService] All fetch methods failed for handle '${handle}'.`);
  return null;
}

// Helper function to call the /analytics endpoint
async function callAnalyticsEndpoint(
  handle: string,
  platformId: string
): Promise<InsightIQProfileWithAnalytics | null> {
  logger.info(
    `[InsightIQService] Calling POST /analytics using handle '${handle}' and platformId '${platformId}'`
  );
  const endpoint = '/v1/social/creators/profiles/analytics';
  const requestBody = {
    identifier: handle,
    work_platform_id: platformId,
  };
  try {
    const response = await makeInsightIQRequest<CreatorProfileAnalyticsResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    if (response?.profile) {
      logger.info(
        `[InsightIQService] Successfully fetched profile via POST /analytics for handle: ${handle}`
      );
      // Optional: Add handle validation here if needed
      return response.profile;
    } else {
      logger.warn(`[InsightIQService] POST /analytics for handle ${handle} returned null profile.`);
      return null;
    }
  } catch (error: any) {
    logger.error(
      `[InsightIQService] Error fetching profile via POST /analytics for handle ${handle}:`,
      error
    );
    return null;
  }
}

// TODO: Add other required functions based on analysis of InsightIQ usage and InsightIQ spec
// e.g., getInsightIQContents(accountId), etc.
