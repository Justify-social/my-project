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
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

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
      logger.warn(
        `[InsightIQService] API Error: ${response.status} ${response.statusText} for ${url} - Body: ${errorBody}`
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
  const endpoint = '/v1/work-platforms?limit=1'; // Simple GET request
  try {
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
    logger.warn(
      `[getProfileUniqueId] Falling back to composite ID for handle: ${handle}. External ID missing.`,
      { profileData: { url: profile.url, handle: handle, platformId: platformId } }
    );
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
}

// --- Internal Search Function ---
// Renamed to avoid conflict, NOT exported
async function _searchInsightIQProfiles(
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

  // ** FIX: Try wrapping platform_username in an object **
  if (filters.platform_username) {
    // Based on error msg: "Input should be a valid dictionary or object"
    // This is speculative based on the error, API docs are unclear.
    // REVERTING this speculative fix as the core issue is endpoint usage
    requestBody.platform_username = filters.platform_username;
    // logger.warn('[searchInsightIQProfiles] Wrapping platform_username filter in object due to API error', { value: filters.platform_username });
  }

  logger.debug(`[searchInsightIQProfiles] Calling ${endpoint} with body:`, requestBody);

  try {
    const response = await axios.post<CreatorSearchResponse>(url, requestBody, {
      headers: {
        Authorization: getInsightIQBasicAuthHeader(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15000, // Add timeout
    });

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
    // locations: params.filters?.locations, // Requires mapping
  };
  // Call the INTERNAL search function
  return _searchInsightIQProfiles(apiParams);
}

// ** REVISED Function for DETAIL view - Uses /analytics endpoint **
export async function getSingleInsightIQProfileAnalytics(
  identifier: string // Can be external_id (preferred) or username:::platformId composite
  // Deprecate direct platformId argument if identifier contains it or is external_id
  // platformId?: string | null // Optional: Still accept for direct username/platform search if needed
): Promise<InsightIQProfile | null> {
  // Return the full InsightIQProfile now
  logger.info(`[InsightIQService] Fetching single profile analytics for identifier: ${identifier}`);

  // 1. Check if the identifier looks like an external_id (UUID or similar format expected for InsightIQ profile ID)
  // Simple UUID check for now. Refine based on actual external_id format.
  const looksLikeExternalId =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      identifier
    ) || !identifier.includes(':::'); // Assume non-composite IDs are external_ids for now

  if (looksLikeExternalId) {
    logger.info(
      `[InsightIQService] Identifier "${identifier}" appears to be an external_id. Fetching via GET /v1/profiles/{id}.`
    );
    try {
      const profile = await getInsightIQProfileById(identifier);
      if (profile) {
        logger.info(
          `[InsightIQService] Successfully fetched profile using external_id: ${identifier}`
        );
        return profile;
      } else {
        logger.warn(
          `[InsightIQService] Profile fetch using external_id "${identifier}" returned null. Might not exist or ID format mismatch.`
        );
        // Optionally fallback to search? For now, return null if direct fetch fails.
        return null;
      }
    } catch (error) {
      logger.error(
        `[InsightIQService] Error fetching profile with external_id ${identifier}:`,
        error
      );
      return null;
    }
  }

  // 2. If not an external_id, assume it's a composite key "username:::platformId"
  logger.info(
    `[InsightIQService] Identifier "${identifier}" appears to be a composite key. Falling back to search.`
  );
  const parts = identifier.split(':::');
  if (parts.length !== 2) {
    logger.error(
      `[InsightIQService] Invalid composite key format: "${identifier}". Expected "username:::platformId".`
    );
    return null;
  }
  const username = parts[0];
  const platformId = parts[1]; // This might be the unreliable work_platform_id

  if (!username || !platformId) {
    logger.error(
      `[InsightIQService] Invalid composite key parsed: username='${username}', platformId='${platformId}'`
    );
    return null;
  }

  logger.warn(
    `[InsightIQService] Searching using potentially unreliable composite key: username=${username}, platformId=${platformId}`
  );

  // Fallback: Use the internal search function with username and platformId
  // This still uses the potentially unreliable platformId from the search results.
  // This is a fallback and ideally should be avoided by ensuring external_id is always used.
  try {
    const searchParams: InfluencerSearchParams = {
      platform_username: username,
      work_platform_id: platformId,
      limit: 1, // We expect only one result
    };
    const searchResponse = await _searchInsightIQProfiles(searchParams);

    if (searchResponse?.data && searchResponse.data.length > 0) {
      if (searchResponse.data.length > 1) {
        logger.warn(
          `[InsightIQService] Search fallback found multiple profiles for ${username} / ${platformId}. Returning first result.`
        );
      }
      const foundProfile = searchResponse.data[0];
      // IMPORTANT: The search result (InsightIQSearchProfile) might lack fields present in InsightIQProfile.
      // We need the *full* profile. If the search result has an external_id, fetch the full profile using that.
      if (foundProfile.external_id) {
        logger.info(
          `[InsightIQService] Search fallback found profile with external_id ${foundProfile.external_id}. Fetching full profile.`
        );
        return getInsightIQProfileById(foundProfile.external_id);
      } else {
        // If search result *also* lacks external_id, we cannot get the full profile easily.
        logger.error(
          `[InsightIQService] Search fallback profile for ${username} / ${platformId} also lacks external_id. Cannot fetch full profile data.`
        );
        // Returning the partial search profile is incorrect as the return type is InsightIQProfile.
        // Return null or throw error? Returning null for now.
        return null;
      }
    } else {
      logger.warn(
        `[InsightIQService] Search fallback found no profile for ${username} / ${platformId}`
      );
      return null;
    }
  } catch (error) {
    logger.error(
      `[InsightIQService] Error during search fallback for ${username} / ${platformId}:`,
      error
    );
    return null;
  }
}

// Deprecate or remove the old search-based detail function if no longer needed
// export async function getSingleInsightIQProfileBySearch(...) { ... }

// TODO: Add other required functions based on analysis of InsightIQ usage and InsightIQ spec
// e.g., getInsightIQContents(accountId), etc.
