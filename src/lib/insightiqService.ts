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
  logger.info(`[InsightIQService] Fetching InsightIQ profile for profileId: ${profileId}`);
  const endpoint = `/v1/profiles/${profileId}`;
  try {
    const response = await makeInsightIQRequest<InsightIQGetProfileResponse>(endpoint);
    // TODO: Add validation using Zod maybe?
    return response;
  } catch (error: any) {
    // Distinguish between 404 (Not Found) and other errors
    if (error.message?.includes('(404)')) {
      logger.warn(`[InsightIQService] InsightIQ profile not found for profileId: ${profileId}`);
      return null;
    } else {
      logger.error(`[InsightIQService] Error fetching InsightIQ profile for ${profileId}:`, error);
      // Depending on desired resilience, we might return null or re-throw
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

/**
 * Fetches a list of profiles from InsightIQ with pagination.
 * Endpoint: GET /v1/profiles
 *
 * @param params Object containing limit and offset for pagination.
 * @returns The response containing a list of InsightIQ Profiles or null on error.
 */
// Define an inline type for the expected list response structure
interface InsightIQProfileListResponse {
  data: InsightIQProfile[];
  metadata?: {
    // Assuming metadata structure based on spec examples
    offset: number;
    limit: number;
    total?: number; // Make total optional as it might not always be present
    // Add other potential metadata fields if known
  };
}

export async function getInsightIQProfiles(params: {
  limit: number;
  offset: number;
}): Promise<InsightIQProfileListResponse | null> {
  // Use the inline type
  const { limit, offset } = params;
  logger.info(
    `[InsightIQService] Fetching InsightIQ profiles list with limit: ${limit}, offset: ${offset}`
  );
  // Construct query parameters
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const endpoint = `/v1/profiles?${queryParams.toString()}`;

  try {
    // Use the inline type for the expected response
    const response = await makeInsightIQRequest<InsightIQProfileListResponse>(endpoint);
    // TODO: Add validation using Zod maybe?
    if (!response?.data || !Array.isArray(response.data)) {
      logger.warn(
        '[InsightIQService] getInsightIQProfiles received unexpected data format.',
        response
      );
      return null; // Or throw an error depending on desired handling
    }
    return response;
  } catch (error: any) {
    logger.error(`[InsightIQService] Error fetching InsightIQ profiles list:`, error);
    // Depending on desired resilience, we might return null or re-throw
    return null; // Return null to avoid breaking downstream processes
  }
}

// TODO: Add other required functions based on analysis of InsightIQ usage and InsightIQ spec
// e.g., getInsightIQContents(accountId), etc.
