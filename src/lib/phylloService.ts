import { logger } from '@/utils/logger'; // Assuming logger path

const PHYLLO_BASE_URL = process.env.PHYLLO_BASE_URL;
const PHYLLO_CLIENT_ID = process.env.PHYLLO_CLIENT_ID;
const PHYLLO_CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET;

// In-memory cache for the access token (improve with Redis/proper cache later)
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generates the Basic Auth header value.
 */
function getBasicAuthHeader(): string {
  if (!PHYLLO_CLIENT_ID || !PHYLLO_CLIENT_SECRET) {
    throw new Error('Phyllo Client ID or Secret is missing in environment variables.');
  }
  const credentials = `${PHYLLO_CLIENT_ID}:${PHYLLO_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Fetches a new Phyllo access token or returns a cached one.
 * Reference: https://docs.getphyllo.com/docs/api-reference/api/auth
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if valid
  if (cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    // Add 1-minute buffer
    logger.debug('[PhylloService] Using cached access token.');
    return cachedToken.token;
  }

  logger.info('[PhylloService] Fetching new Phyllo access token...');
  if (!PHYLLO_BASE_URL) {
    throw new Error('PHYLLO_BASE_URL environment variable is not set.');
  }

  try {
    const response = await fetch(`${PHYLLO_BASE_URL}/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getBasicAuthHeader(),
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: PHYLLO_CLIENT_ID,
        client_secret: PHYLLO_CLIENT_SECRET, // Secret in body as per docs
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch Phyllo token: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const data = await response.json();

    if (!data.access_token || !data.expires_in) {
      throw new Error('Invalid token response from Phyllo');
    }

    // Cache the new token with expiration (expires_in is in seconds)
    const expiresAt = now + data.expires_in * 1000;
    cachedToken = { token: data.access_token, expiresAt };
    logger.info('[PhylloService] Successfully fetched and cached new Phyllo token.');

    return data.access_token;
  } catch (error) {
    logger.error('[PhylloService] Error getting access token:', error);
    cachedToken = null; // Clear cache on error
    throw error; // Re-throw after logging
  }
}

/**
 * Makes an authenticated request to the Phyllo API.
 */
async function makePhylloRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!PHYLLO_BASE_URL) {
    throw new Error('PHYLLO_BASE_URL environment variable is not set.');
  }
  const url = `${PHYLLO_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  logger.debug(`[PhylloService] Making request to: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.warn(
        `[PhylloService] API Error: ${response.status} ${response.statusText} for ${url} - ${errorBody}`
      );
      // Throw a structured error maybe?
      throw new Error(`Phyllo API Error (${response.status}): ${errorBody}`);
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    logger.error(`[PhylloService] Failed request to ${url}:`, error);
    throw error;
  }
}

/**
 * Checks the status of the Phyllo API connection.
 * Calls the /v1/me endpoint as a basic health check.
 * Reference: https://docs.getphyllo.com/docs/api-reference/reference/get_me
 */
export async function checkPhylloConnection(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  logger.info('[PhylloService] Checking Phyllo API connection...');
  try {
    // The /v1/me endpoint requires a valid token but returns info about the API client itself
    const response = await makePhylloRequest<{ client_id: string; name: string }>('/v1/me');
    logger.info('[PhylloService] Phyllo API connection successful.', response);
    return { success: true, data: response };
  } catch (error: any) {
    logger.error('[PhylloService] Phyllo API connection check failed:', error);
    return { success: false, error: error.message || 'Failed to connect to Phyllo API' };
  }
}

// --- Specific Data Fetching Functions ---

/**
 * Fetches identity information for a Phyllo account.
 * This provides verification status.
 * Assumes we have a mapping between our internal influencer ID and a Phyllo Account ID.
 * Reference: https://docs.getphyllo.com/docs/api-reference/reference/getaccount
 *
 * @param accountId The Phyllo Account ID associated with the influencer.
 * @returns Phyllo Account object or null if not found/error.
 */
interface PhylloAccount {
  id: string;
  status: string; // e.g., "CONNECTED", "DISCONNECTED", "SESSION_EXPIRED"
  work_platform: {
    id: string;
    name: string;
    logo_url: string;
  };
  // ... other fields as needed ...
}

export async function getPhylloAccountIdentity(accountId: string): Promise<PhylloAccount | null> {
  if (!accountId) {
    logger.warn('[PhylloService] getPhylloAccountIdentity called with empty accountId.');
    return null;
  }
  logger.info(`[PhylloService] Fetching Phyllo account identity for accountId: ${accountId}`);
  try {
    // NOTE: Using GET /v1/accounts/{id} endpoint as per Phyllo docs for account details including status
    const response = await makePhylloRequest<PhylloAccount>(`/v1/accounts/${accountId}`);
    return response;
  } catch (error: any) {
    // Distinguish between 404 (Not Found) and other errors
    if (error.message?.includes('404')) {
      logger.warn(`[PhylloService] Phyllo account not found for accountId: ${accountId}`);
      return null;
    } else {
      logger.error(
        `[PhylloService] Error fetching Phyllo account identity for ${accountId}:`,
        error
      );
      // Depending on desired resilience, we might return null or re-throw
      return null; // Return null to avoid breaking the entire list fetch
    }
  }
}

// TODO: Implement getPhylloProfileAnalytics(accountId) - Needed for followers, demographics etc.
// Reference: https://docs.getphyllo.com/docs/api-reference/reference/getprofileanalytics

/**
 * Placeholder interface for the expected structure of the Profile Analytics API response.
 * NOTE: Verify exact field names and types against official Phyllo documentation.
 */
interface PhylloProfileAnalytics {
  id: string; // Profile ID
  reputation?: {
    follower_count?: number;
    following_count?: number;
    content_count?: number;
    // ... other reputation fields
  };
  audience?: {
    audience_live_location_distribution?: { country: string; percentage: number }[];
    audience_gender_distribution?: { gender: string; percentage: number }[];
    audience_age_distribution?: { age_range: string; percentage: number }[];
    // ... other audience fields like interests
  };
  engagement?: {
    engagement_rate?: number; // Overall engagement rate?
    average_likes?: number;
    average_comments?: number;
    // ... other engagement fields
  };
  profile?: {
    username?: string;
    full_name?: string;
    bio?: string; // May be called 'introduction' or similar
    image_url?: string;
    // ... other profile fields
  };
  // ... other top-level analytics fields
}

/**
 * Fetches profile analytics data for a Phyllo account.
 * Provides detailed demographics, engagement metrics, follower counts etc.
 * Assumes we have a mapping between our internal influencer ID and a Phyllo Account ID.
 *
 * @param accountId The Phyllo Account ID associated with the influencer.
 * @returns Phyllo Profile Analytics object or null if not found/error.
 */
export async function getPhylloProfileAnalytics(
  accountId: string
): Promise<PhylloProfileAnalytics | null> {
  if (!accountId) {
    logger.warn('[PhylloService] getPhylloProfileAnalytics called with empty accountId.');
    return null;
  }
  logger.info(`[PhylloService] Fetching Phyllo profile analytics for accountId: ${accountId}`);
  try {
    // NOTE: Endpoint likely requires account_id as query param, verify exact endpoint structure
    // Using /v1/profiles endpoint with account_id filter based on docs/common patterns
    // This might return an array, so we might need to adjust based on actual API
    const response = await makePhylloRequest<any>(`/v1/profiles?account_id=${accountId}`);

    // Check if the response is an array and take the first element if so
    // The actual Profile Analytics endpoint might be different, this is an assumption
    const analyticsData = Array.isArray(response?.data) ? response.data[0] : response;

    if (!analyticsData) {
      logger.warn(`[PhylloService] No profile analytics data found for accountId: ${accountId}`);
      return null;
    }

    // TODO: Validate the structure of analyticsData against PhylloProfileAnalytics more strictly?
    return analyticsData as PhylloProfileAnalytics;
  } catch (error: any) {
    // Distinguish between 404 (Not Found) and other errors
    if (error.message?.includes('404')) {
      logger.warn(`[PhylloService] Phyllo profile analytics not found for accountId: ${accountId}`);
      return null;
    } else {
      logger.error(
        `[PhylloService] Error fetching Phyllo profile analytics for ${accountId}:`,
        error
      );
      return null; // Return null to avoid breaking the entire fetch
    }
  }
}

// TODO: Consider function to map Phyllo User ID (from create-user) to Account ID(s)
// Reference: https://docs.getphyllo.com/docs/api-reference/reference/getaccounts

// Exporting the core request function might be useful for specific cases
// export { makePhylloRequest };
