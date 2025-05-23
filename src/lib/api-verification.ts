/**
 * API Verification Utilities
 *
 * This file contains utilities for testing and verifying external API integrations
 * used in the Campaign Wizard. These utilities help ensure that APIs are functioning
 * correctly and provide helpful diagnostics when they are not.
 */

// SERVER-ONLY FILE
// Ensure this file is only imported in server-side code (API routes, Server Components, Server Actions)

import { prisma } from '@/lib/prisma'; // Import prisma client
import { serverConfig } from '@/config/server-config';
import { logger } from '@/utils/logger'; // Assuming logger is needed server-side
import Stripe from 'stripe';
import { algoliasearch } from 'algoliasearch';
import {
  checkInsightIQConnection,
  getInsightIQProfileById,
  getInsightIQAudience,
} from '@/lib/insightiqService';
import { Resend } from 'resend';

// Import types from the new shared file
import type { ApiVerificationResult, ApiErrorInfo } from './api-verification-types';
import { ApiErrorType } from './api-verification-types';

/**
 * Special function to check if a host is reachable without triggering CORS issues
 * This is used by the API verification functions to determine if an API is down or
 * if there's just a CORS issue when testing from the browser
 */
async function isHostReachable(
  hostname: string
): Promise<{ reachable: boolean; latency?: number }> {
  const startTime = Date.now();

  try {
    // Use a HEAD request which is lightweight
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const _response = await fetch(`https://${hostname}/`, {
      method: 'HEAD',
      mode: 'no-cors', // This prevents CORS errors but means we can't read the response
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    // With mode: 'no-cors', the response type is 'opaque' and we can't read status
    // But if we get here without an error, the host is likely reachable
    return { reachable: true, latency };
  } catch (error) {
    console.warn(`Host ${hostname} connectivity check failed:`, error);
    return { reachable: false };
  }
}

/**
 * Verify the IP Geolocation API
 * This function tests the IP Geolocation API to ensure it's working properly
 */
export async function verifyGeolocationApi(): Promise<ApiVerificationResult> {
  const apiName = 'IP Geolocation API';
  const primaryEndpoint = 'https://ipinfo.io/json';
  const fallbackEndpoint = 'https://ipapi.co/json/';

  try {
    console.info(`Testing ${apiName}`);

    const startTime = Date.now();

    // Check if API token exists in environment variables
    const hasApiToken = process.env.NEXT_PUBLIC_IPINFO_TOKEN !== undefined;

    if (!hasApiToken) {
      console.warn(`${apiName} verification warning: Missing API token, will use fallback service`);
    }

    // Try primary service if we have a token
    if (hasApiToken) {
      try {
        // Construct URL with API token
        const url = new URL(primaryEndpoint);
        url.searchParams.append('token', process.env.NEXT_PUBLIC_IPINFO_TOKEN || '');

        // Make an actual API call to the primary geolocation service
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url.toString(), {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        clearTimeout(timeoutId);

        const latency = Date.now() - startTime;
        const responseData = await response.json().catch(() => ({}));

        if (response.ok) {
          console.info(`${apiName} verification successful with primary service`, {
            latency,
            statusCode: response.status,
          });

          return {
            success: true,
            apiName,
            endpoint: primaryEndpoint,
            latency,
            data: {
              ip: responseData.ip,
              city: responseData.city,
              region: responseData.region,
              country: responseData.country,
              loc: responseData.loc,
              org: responseData.org,
              postal: responseData.postal,
              timezone: responseData.timezone,
            },
          };
        } else {
          console.warn(
            `Primary geolocation service failed with status ${response.status}, trying fallback`
          );
        }
      } catch (primaryError) {
        console.warn('Primary geolocation service error, trying fallback', primaryError);
      }
    }

    // If primary service failed or we don't have a token, try the fallback service
    console.info(`Testing ${apiName} with fallback service`);
    const fallbackStartTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(fallbackEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - fallbackStartTime;
      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        console.info(`${apiName} verification successful with fallback service`, {
          latency,
          statusCode: response.status,
        });

        return {
          success: true,
          apiName: `${apiName} (Fallback)`,
          endpoint: fallbackEndpoint,
          latency,
          data: {
            ip: responseData.ip,
            city: responseData.city,
            region: responseData.region,
            country: responseData.country_name,
            org: `${responseData.org || ''} ${responseData.asn || ''}`.trim(),
            timezone: responseData.timezone,
          },
        };
      } else {
        let errorType = ApiErrorType.UNKNOWN_ERROR;

        // Determine error type based on status code
        if (response.status === 401 || response.status === 403) {
          errorType = ApiErrorType.AUTHENTICATION_ERROR;
        } else if (response.status === 404) {
          errorType = ApiErrorType.NOT_FOUND_ERROR;
        } else if (response.status === 429) {
          errorType = ApiErrorType.RATE_LIMIT_ERROR;
        } else if (response.status >= 500) {
          errorType = ApiErrorType.SERVER_ERROR;
        } else if (response.status >= 400) {
          errorType = ApiErrorType.VALIDATION_ERROR;
        }

        const isRetryable =
          errorType !== ApiErrorType.VALIDATION_ERROR && errorType !== ApiErrorType.NOT_FOUND_ERROR;

        console.error(
          `${apiName} verification failed with HTTP ${response.status} (fallback service)`
        );

        return {
          success: false,
          apiName,
          endpoint: fallbackEndpoint,
          latency,
          error: {
            type: errorType,
            message: `API returned error status: ${response.status} ${response.statusText}`,
            details: responseData,
            isRetryable,
          },
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      let errorType = ApiErrorType.NETWORK_ERROR;
      let errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error';

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        errorType = ApiErrorType.TIMEOUT_ERROR;
        errorMessage = 'API request timed out after 5000ms';
      }

      console.error(
        `${apiName} verification failed with network error: ${errorMessage} (fallback service)`
      );

      return {
        success: false,
        apiName,
        endpoint: fallbackEndpoint,
        error: {
          type: errorType,
          message: errorMessage,
          details: fetchError,
          isRetryable: true,
        },
      };
    }
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`${apiName} verification failed with unexpected error: ${errorMessage}`);

    return {
      success: false,
      apiName,
      endpoint: fallbackEndpoint,
      error: {
        type: ApiErrorType.UNKNOWN_ERROR,
        message: errorMessage,
        details: error,
        isRetryable: false,
      },
    };
  }
}

/**
 * Verify the Exchange Rates API
 * This function tests the Exchange Rates API to ensure it's working properly
 */
export async function verifyExchangeRatesApi(): Promise<ApiVerificationResult> {
  const apiName = 'Exchange Rates API';
  const primaryEndpoint = 'https://api.exchangerate.host/latest';
  const fallbackEndpoint = 'https://open.er-api.com/v6/latest/USD';

  try {
    console.info(`Testing ${apiName}`);

    // Try primary API service first
    try {
      const startTime = Date.now();

      // Construct URL for the API call
      const url = new URL(primaryEndpoint);
      url.searchParams.append('base', 'USD');
      url.searchParams.append('symbols', 'EUR,GBP,CAD,JPY,AUD');

      // Make an actual API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.rates && Object.keys(responseData.rates).length > 0) {
        console.info(`${apiName} verification successful with primary service`, {
          latency,
          statusCode: response.status,
          ratesCount: Object.keys(responseData.rates).length,
        });

        return {
          success: true,
          apiName,
          endpoint: primaryEndpoint,
          latency,
          data: {
            base: responseData.base,
            date: responseData.date,
            rates: responseData.rates,
          },
        };
      } else {
        console.warn(
          `Primary exchange rates service failed or returned invalid data, trying fallback`
        );
      }
    } catch (primaryError) {
      console.warn('Primary exchange rates service error, trying fallback', primaryError);
    }

    // Try fallback service if primary fails
    console.info(`Testing ${apiName} with fallback service`);
    const fallbackStartTime = Date.now();

    // Make an actual API call to the fallback service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(fallbackEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - fallbackStartTime;
      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.rates && Object.keys(responseData.rates).length > 0) {
        console.info(`${apiName} verification successful with fallback service`, {
          latency,
          statusCode: response.status,
          ratesCount: Object.keys(responseData.rates).length,
        });

        return {
          success: true,
          apiName: `${apiName} (Fallback)`,
          endpoint: fallbackEndpoint,
          latency,
          data: {
            base: responseData.base_code || responseData.base,
            date: responseData.time_last_update_utc || responseData.date,
            rates: responseData.rates,
          },
        };
      } else {
        let errorType = ApiErrorType.UNKNOWN_ERROR;

        // Determine error type based on status code
        if (response.status === 401 || response.status === 403) {
          errorType = ApiErrorType.AUTHENTICATION_ERROR;
        } else if (response.status === 404) {
          errorType = ApiErrorType.NOT_FOUND_ERROR;
        } else if (response.status === 429) {
          errorType = ApiErrorType.RATE_LIMIT_ERROR;
        } else if (response.status >= 500) {
          errorType = ApiErrorType.SERVER_ERROR;
        } else if (response.status >= 400) {
          errorType = ApiErrorType.VALIDATION_ERROR;
        } else if (!responseData.rates || Object.keys(responseData.rates).length === 0) {
          errorType = ApiErrorType.VALIDATION_ERROR;
        }

        const isRetryable =
          errorType !== ApiErrorType.VALIDATION_ERROR && errorType !== ApiErrorType.NOT_FOUND_ERROR;

        console.error(
          `${apiName} verification failed with HTTP ${response.status} or invalid data (fallback service)`
        );

        return {
          success: false,
          apiName,
          endpoint: fallbackEndpoint,
          latency,
          error: {
            type: errorType,
            message: responseData.rates
              ? `API returned error status: ${response.status} ${response.statusText}`
              : 'API response missing expected rates data',
            details: responseData,
            isRetryable,
          },
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      let errorType = ApiErrorType.NETWORK_ERROR;
      let errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error';

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        errorType = ApiErrorType.TIMEOUT_ERROR;
        errorMessage = 'API request timed out after 5000ms';
      }

      console.error(
        `${apiName} verification failed with network error: ${errorMessage} (fallback service)`
      );

      return {
        success: false,
        apiName,
        endpoint: fallbackEndpoint,
        error: {
          type: errorType,
          message: errorMessage,
          details: fetchError,
          isRetryable: true,
        },
      };
    }
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`${apiName} verification failed with unexpected error: ${errorMessage}`);

    return {
      success: false,
      apiName,
      endpoint: fallbackEndpoint,
      error: {
        type: ApiErrorType.UNKNOWN_ERROR,
        message: errorMessage,
        details: error,
        isRetryable: false,
      },
    };
  }
}

/**
 * Verify the GIPHY API
 * This function tests the GIPHY API used for GIF search and integration
 */
export async function verifyGiphyApi(): Promise<ApiVerificationResult> {
  const apiName = 'GIPHY API';
  const endpoint = 'https://api.giphy.com/v1/gifs/search';
  const hostname = 'api.giphy.com';

  try {
    console.info(`Testing ${apiName}`);

    const hostCheck = await isHostReachable(hostname);

    if (!hostCheck.reachable) {
      console.error(`${apiName} host is unreachable`);
      return {
        success: false,
        apiName,
        endpoint,
        error: {
          type: ApiErrorType.NETWORK_ERROR,
          message: `Cannot connect to the API host (${hostname}). The service may be down or blocked by network policies.`,
          details: { hostname },
          isRetryable: true,
        },
      };
    }

    const hasApiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY !== undefined;

    if (!hasApiKey) {
      console.warn(`${apiName} verification warning: Missing API key`);

      return {
        success: false,
        apiName,
        endpoint,
        latency: hostCheck.latency,
        error: {
          type: ApiErrorType.AUTHENTICATION_ERROR,
          message: 'Missing GIPHY API key. Add NEXT_PUBLIC_GIPHY_API_KEY to environment variables.',
          details: null,
          isRetryable: true,
        },
      };
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';
      const url = new URL(endpoint);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('q', 'test');
      url.searchParams.append('limit', '1');

      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        console.info(`${apiName} verification successful`, {
          latency,
          statusCode: response.status,
        });

        return {
          success: true,
          apiName,
          endpoint,
          latency,
          data: {
            meta: responseData.meta,
            pagination: responseData.pagination,
            resultCount: responseData.data?.length || 0,
          },
        };
      } else {
        let errorType = ApiErrorType.UNKNOWN_ERROR;

        if (response.status === 401 || response.status === 403) {
          errorType = ApiErrorType.AUTHENTICATION_ERROR;
        } else if (response.status === 404) {
          errorType = ApiErrorType.NOT_FOUND_ERROR;
        } else if (response.status === 429) {
          errorType = ApiErrorType.RATE_LIMIT_ERROR;
        } else if (response.status >= 500) {
          errorType = ApiErrorType.SERVER_ERROR;
        } else if (response.status >= 400) {
          errorType = ApiErrorType.VALIDATION_ERROR;
        }

        console.error(`${apiName} verification failed with HTTP ${response.status}`);

        return {
          success: false,
          apiName,
          endpoint,
          latency,
          error: {
            type: errorType,
            message: `API returned error status: ${response.status} ${response.statusText}`,
            details: responseData,
            isRetryable: errorType !== ApiErrorType.VALIDATION_ERROR,
          },
        };
      }
    } catch {
      console.error(
        `${apiName} API call failed, likely due to CORS. Using host check result instead.`
      );

      return {
        success: true,
        apiName,
        endpoint,
        latency: hostCheck.latency,
        data: {
          status: 'API host is reachable',
          credentials_available: hasApiKey,
          note: 'Due to CORS restrictions, the complete API testing can only be done server-side. The host is reachable, which indicates the API is likely operational.',
        },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`${apiName} verification failed with unexpected error: ${errorMessage}`);

    return {
      success: false,
      apiName,
      endpoint,
      error: {
        type: ApiErrorType.UNKNOWN_ERROR,
        message: errorMessage,
        details: error,
        isRetryable: false,
      },
    };
  }
}

/**
 * Verify the InsightIQ API Connection and Core Endpoints
 * Checks basic connectivity and attempts calls to core profile/audience endpoints.
 */
export async function verifyInsightIQApi(): Promise<ApiVerificationResult> {
  const apiName = 'InsightIQ API';
  const baseCheckEndpoint = '/v1/work-platforms?limit=1';
  const profileEndpoint = '/v1/profiles/:id';
  const audienceEndpoint = '/v1/audience?account_id=:accountId';

  const results: { [key: string]: ApiVerificationResult } = {};
  let overallSuccess = true;
  let combinedError: ApiErrorInfo | undefined = undefined;

  // 1. Basic Connection Check (via work-platforms)
  logger.info(`[verifyInsightIQApi] Performing basic connection check...`);
  const connectionResult = await checkInsightIQConnection();
  results['connection'] = {
    apiName: `${apiName} - Connection Check`,
    endpoint: baseCheckEndpoint,
    success: connectionResult.success,
    data: connectionResult.data,
    error: connectionResult.error
      ? {
          type: connectionResult.error?.includes('credentials')
            ? ApiErrorType.AUTHENTICATION_ERROR
            : connectionResult.error?.includes('connect') ||
                connectionResult.error?.includes('Failed')
              ? ApiErrorType.NETWORK_ERROR
              : ApiErrorType.UNKNOWN_ERROR,
          message: connectionResult.error,
          isRetryable: !connectionResult.error?.includes('credentials'),
        }
      : undefined,
  };
  if (!connectionResult.success) {
    overallSuccess = false;
    combinedError = results['connection'].error;
    logger.error(`[verifyInsightIQApi] Basic connection check failed: ${connectionResult.error}`);
    // Stop further tests if basic connection/auth fails
    return {
      success: false,
      apiName,
      endpoint: baseCheckEndpoint, // Report the failing endpoint
      error: combinedError,
    };
  }

  // --- Test Core Data Endpoints (Profile & Audience) ---
  // Use a placeholder ID - expect 404, but other errors (401, 5xx) indicate problems
  const testProfileId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID
  const testAccountId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID

  interface ProfileCheckData {
    status?: string;
    profileId?: string | null;
    name?: string | null;
  }

  interface AudienceCheckData {
    status?: string;
    audienceId?: string | null;
    countryCount?: number;
  }

  // 2. Profile Check
  logger.info(`[verifyInsightIQApi] Testing Get Profile endpoint with ID: ${testProfileId}`);
  let profileResultData: ProfileCheckData | null = null;
  let profileSuccess = false;
  let profileError: ApiErrorInfo | undefined;
  const profileStartTime = Date.now();
  try {
    const profile = await getInsightIQProfileById(testProfileId);
    // If profile is null, it could be 404 (expected for dummy ID) or other error handled in service
    if (profile === null) {
      // Check if the error was specifically 404 (logged by service)
      // For verification purposes, treat expected 404 for dummy ID as success
      logger.warn(
        `[verifyInsightIQApi] Get Profile returned null (expected 404 for dummy ID ${testProfileId}). Treating as verification success.`
      );
      profileSuccess = true;
      profileResultData = { status: 'Not Found (Expected for Test ID)' };
    } else if (profile) {
      // If profile is found unexpectedly (e.g., if test ID actually exists)
      profileSuccess = true;
      profileResultData = { profileId: profile.id, name: profile.full_name }; // Sample relevant data
      logger.info(`[verifyInsightIQApi] Get Profile call successful for ID ${testProfileId}.`);
    } else {
      // Should not happen if service handles errors, but safety check
      throw new Error('Get Profile returned unexpected null/undefined without specific error.');
    }
  } catch (error: unknown) {
    logger.error(`[verifyInsightIQApi] Get Profile call failed:`, error);
    profileSuccess = false;
    profileError = {
      type:
        error instanceof Error && error.message?.includes('(401)') // Check if Error before accessing message
          ? ApiErrorType.AUTHENTICATION_ERROR
          : ApiErrorType.UNKNOWN_ERROR,
      message: `Get Profile failed: ${error instanceof Error ? error.message : String(error)}`, // Safe access
      isRetryable: false,
      details: error,
    };
  }
  const profileLatency = Date.now() - profileStartTime;
  results['profile'] = {
    apiName: `${apiName} - Get Profile`,
    endpoint: profileEndpoint,
    success: profileSuccess,
    error: profileError,
    latency: profileLatency,
    data: profileResultData,
  };
  if (!profileSuccess) {
    overallSuccess = false;
    combinedError = profileError;
  }

  // 3. Audience Check (only if profile check didn't fail authentication)
  if (!combinedError || combinedError.type !== ApiErrorType.AUTHENTICATION_ERROR) {
    logger.info(
      `[verifyInsightIQApi] Testing Get Audience endpoint with Account ID: ${testAccountId}`
    );
    let audienceSuccess = false;
    let audienceError: ApiErrorInfo | undefined;
    let audienceResultData: AudienceCheckData | null = null;
    const audienceStartTime = Date.now();
    try {
      const audience = await getInsightIQAudience(testAccountId);
      if (audience === null) {
        logger.warn(
          `[verifyInsightIQApi] Get Audience returned null (expected 404 for dummy ID ${testAccountId}). Treating as verification success.`
        );
        audienceSuccess = true;
        audienceResultData = { status: 'Not Found (Expected for Test ID)' };
      } else if (audience) {
        audienceSuccess = true;
        audienceResultData = { audienceId: audience.id, countryCount: audience.countries?.length };
        logger.info(
          `[verifyInsightIQApi] Get Audience call successful for Account ID ${testAccountId}.`
        );
      } else {
        throw new Error('Get Audience returned unexpected null/undefined without specific error.');
      }
    } catch (error: unknown) {
      logger.error(`[verifyInsightIQApi] Get Audience call failed:`, error);
      audienceSuccess = false;
      audienceError = {
        type:
          error instanceof Error && error.message?.includes('(401)') // Check if Error
            ? ApiErrorType.AUTHENTICATION_ERROR
            : ApiErrorType.UNKNOWN_ERROR,
        message: `Get Audience failed: ${error instanceof Error ? error.message : String(error)}`, // Safe access
        isRetryable: false,
        details: error,
      };
    }
    const audienceLatency = Date.now() - audienceStartTime;
    results['audience'] = {
      apiName: `${apiName} - Get Audience`,
      endpoint: audienceEndpoint,
      success: audienceSuccess,
      error: audienceError,
      latency: audienceLatency,
      data: audienceResultData,
    };
    if (!audienceSuccess) {
      overallSuccess = false;
      combinedError = audienceError;
    }
  }

  // --- Final Result ---
  logger.info(`[verifyInsightIQApi] Overall verification result: ${overallSuccess}`);
  return {
    success: overallSuccess,
    apiName,
    endpoint: `Multiple Endpoints Tested`, // Indicate multiple endpoints were hit
    data: results, // Return detailed results for each check
    error: overallSuccess ? undefined : combinedError, // Report first critical error if overall failed
  };
}

/**
 * Verify Database Connection (Server-Side Only)
 */
export async function verifyDatabaseConnectionServerSide(): Promise<ApiVerificationResult> {
  const apiName = 'Database Connection';
  const dbUrl = serverConfig.database.url;
  // const endpoint = dbUrl // REMOVED
  //   ? `postgres://...${dbUrl.substring(dbUrl.lastIndexOf('@'))}`
  //   : 'Database URL Missing';

  if (!dbUrl) {
    return {
      success: false,
      apiName,
      endpoint: 'Database URL Missing',
      error: {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Missing database URL in server configuration.',
        details: null,
        isRetryable: false, // Cannot retry if config missing
      },
    };
  }

  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    logger.info(`[Server Verify] ${apiName} verification successful.`);
    return {
      success: true,
      apiName,
      endpoint: 'Prisma Client Query',
      latency,
      data: { status: 'Connected and responsive' },
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    logger.error(`[Server Verify] ${apiName} verification failed:`, errorMessage);

    let errorType = ApiErrorType.UNKNOWN_ERROR;
    if (errorMessage.includes('authentication failed')) {
      errorType = ApiErrorType.AUTHENTICATION_ERROR;
    } else if (errorMessage.includes('timed out') || errorMessage.includes('timeout')) {
      errorType = ApiErrorType.TIMEOUT_ERROR;
    } else if (errorMessage.includes('host') || errorMessage.includes('connect')) {
      errorType = ApiErrorType.NETWORK_ERROR;
    }

    return {
      success: false,
      apiName,
      endpoint: 'Prisma Client Query',
      latency,
      error: {
        type: errorType,
        message: `Failed to execute test query: ${errorMessage}`,
        details: error,
        isRetryable:
          errorType === ApiErrorType.NETWORK_ERROR || errorType === ApiErrorType.TIMEOUT_ERROR,
      },
    };
  }
}

/**
 * SERVER-SIDE Verify the Stripe API
 * Attempts to list Stripe products to confirm API key validity.
 */
export async function verifyStripeApiServerSide(): Promise<ApiVerificationResult> {
  const apiName = 'Stripe API';
  const endpoint = 'https://api.stripe.com/v1/products'; // REVERTED: endpoint is used
  const secretKey = serverConfig.stripe.secretKey;

  if (!secretKey) {
    return {
      success: false,
      apiName,
      endpoint: endpoint, // Use endpoint
      error: {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Missing Stripe API secret key in server configuration.',
        details: null,
        isRetryable: false,
      },
    };
  }

  const startTime = Date.now();
  try {
    logger.info(`[Server Verify] Testing ${apiName}`);
    const stripe = new Stripe(secretKey, { apiVersion: '2025-04-30.basil' }); // Use the specific apiVersion required by the installed Stripe library

    // Make a simple read call, e.g., list products with a limit of 1
    const productList = await stripe.products.list({ limit: 1 });
    const latency = Date.now() - startTime;

    console.info(`[Server Verify] ${apiName} verification successful`, {
      latency,
      productsFound: productList.data.length,
    });

    return {
      success: true,
      apiName,
      endpoint: endpoint,
      latency,
      data: {
        status: 'Authenticated & Connected',
        testMode: secretKey.startsWith('sk_test_'),
        productsFound: productList.data.length,
      },
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    let errorType = ApiErrorType.UNKNOWN_ERROR;
    let message = 'An unknown error occurred while verifying Stripe.';
    let details: unknown = error;

    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      errorType = ApiErrorType.AUTHENTICATION_ERROR;
      message = 'Stripe authentication failed. Check your secret key.';
      details = { stripeErrorCode: error.code, message: error.message };
    } else if (error instanceof Stripe.errors.StripeRateLimitError) {
      errorType = ApiErrorType.RATE_LIMIT_ERROR;
      message = 'Stripe rate limit exceeded.';
      details = { stripeErrorCode: error.code, message: error.message };
    } else if (error instanceof Stripe.errors.StripeAPIError) {
      // General API errors (5xx)
      errorType = ApiErrorType.SERVER_ERROR;
      message = `Stripe API error: ${error.message}`;
      details = {
        stripeErrorCode: error.code,
        statusCode: error.statusCode,
        message: error.message,
      };
    } else if (error instanceof Stripe.errors.StripeConnectionError) {
      errorType = ApiErrorType.NETWORK_ERROR;
      message = `Stripe connection error: ${error.message}`;
      details = { message: error.message };
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error(`[Server Verify] ${apiName} verification failed:`, message);

    return {
      success: false,
      apiName,
      endpoint: endpoint,
      latency,
      error: {
        type: errorType,
        message: message,
        details: details,
        isRetryable: errorType !== ApiErrorType.AUTHENTICATION_ERROR,
      },
    };
  }
}

/**
 * SERVER-SIDE Verify the Cint Exchange API
 * Attempts to list business units using configured credentials.
 */
export async function verifyCintExchangeApiServerSide(): Promise<ApiVerificationResult> {
  const apiName = 'Cint Exchange API';
  // Corrected endpoints based on Cint Developer Portal Documentation
  const authUrl = 'https://auth.lucidhq.com/oauth/token'; // Corrected Auth URL
  const apiBaseUrl = 'https://api.cint.com/v1'; // Base URL from OpenAPI spec seems correct for resource calls
  const testResourceEndpoint = `${apiBaseUrl}/accounts`; // Use /accounts for testing

  const clientId = serverConfig.cint.clientId;
  const clientSecret = serverConfig.cint.clientSecret;
  const audience = 'https://api.luc.id'; // Audience specified in docs

  // Check for necessary OAuth credentials
  if (!clientId || !clientSecret) {
    logger.warn(`[Server Verify] ${apiName} - Missing OAuth Client ID or Secret`);
    return {
      success: false,
      apiName,
      endpoint: authUrl, // Point to the auth URL as the point of failure
      error: {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Missing Cint Client ID or Secret in server configuration.',
        details: 'Check server-config.ts and ensure CINT_CLIENT_ID and CINT_CLIENT_SECRET are set.',
        isRetryable: false,
      },
    };
  }

  const startTime = Date.now();
  let authToken = '';
  const authMethod = 'OAuth Client Credentials';

  // --- Step 1: Authenticate and get Token ---
  logger.info(`[Server Verify] Attempting ${authMethod} for Cint authentication via ${authUrl}.`);
  const tokenStartTime = Date.now();
  try {
    // Use application/json content type as per documentation example
    const tokenController = new AbortController();
    const tokenTimeoutId = setTimeout(() => tokenController.abort(), 8000);

    // --- Debug Logging START ---
    logger.info(
      `[Server Verify] Cint - Using Client ID: ${clientId ? clientId.substring(0, 4) + '...' : 'MISSING'}`
    ); // Log partial ID for security
    logger.info(
      `[Server Verify] Cint - Client Secret Loaded: ${clientSecret ? 'Yes (length: ' + clientSecret.length + ')' : 'NO'}`
    );
    // --- Debug Logging END ---

    // Prepare request body as JSON to match documentation example
    const requestBody = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      lucid_scopes: 'app:api',
      audience: audience,
    };

    // +++ START NEW LOGGING +++
    logger.info(
      `[Server Verify] Cint - DEBUG: Using Client ID (start): ${clientId?.substring(0, 4)}`
    );
    logger.info(`[Server Verify] Cint - DEBUG: Client Secret length: ${clientSecret?.length}`);
    const requestBodyString = JSON.stringify(requestBody);
    logger.info(
      `[Server Verify] Cint - DEBUG: Stringified Request Body: ${requestBodyString.replace(clientSecret, 'REDACTED')}`
    );
    // +++ END NEW LOGGING +++

    logger.info(
      `[Server Verify] Cint - Request Body: ${JSON.stringify(requestBody, (key, value) => (key === 'client_secret' ? 'REDACTED' : value))}`
    );

    const headers = {
      'Content-Type': 'application/json',
      'Cint-API-Version': '2025-02-17',
    };

    logger.info(`[Server Verify] Cint - Request Headers: ${JSON.stringify(headers)}`);

    const tokenResponse = await fetch(authUrl, {
      method: 'POST',
      signal: tokenController.signal,
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    clearTimeout(tokenTimeoutId);
    const tokenLatency = Date.now() - tokenStartTime;

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      logger.error(
        `[Server Verify] Cint OAuth token request failed with status ${tokenResponse.status}`,
        errorData
      );
      return {
        success: false,
        apiName,
        endpoint: authUrl,
        latency: tokenLatency,
        error: {
          type: ApiErrorType.AUTHENTICATION_ERROR,
          message: `Failed to obtain Cint OAuth token: ${tokenResponse.status} ${tokenResponse.statusText}`,
          details: errorData,
          isRetryable: false,
        },
      };
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      logger.error('[Server Verify] Cint OAuth token response missing access_token', tokenData);
      return {
        success: false,
        apiName,
        endpoint: authUrl,
        latency: tokenLatency,
        error: {
          type: ApiErrorType.VALIDATION_ERROR,
          message: 'Cint OAuth token response did not contain an access_token.',
          details: tokenData,
          isRetryable: true,
        },
      };
    }

    authToken = `Bearer ${tokenData.access_token}`;
    logger.info(`[Server Verify] Successfully obtained Cint OAuth token (took ${tokenLatency}ms).`);
  } catch (tokenFetchError) {
    const tokenLatency = Date.now() - tokenStartTime;
    let errorType = ApiErrorType.NETWORK_ERROR;
    let errorMessage =
      tokenFetchError instanceof Error
        ? tokenFetchError.message
        : 'Unknown network error during token fetch';

    if (tokenFetchError instanceof Error && tokenFetchError.name === 'AbortError') {
      errorType = ApiErrorType.TIMEOUT_ERROR;
      errorMessage = 'Cint OAuth token request timed out after 8000ms';
    }

    logger.error(`[Server Verify] Cint OAuth token fetch failed: ${errorMessage}`, tokenFetchError);
    if (tokenFetchError instanceof Error) {
      logger.error('[Server Verify] Cint Fetch Error Details:', {
        name: tokenFetchError.name,
        message: tokenFetchError.message,
        cause: (tokenFetchError as { cause?: unknown }).cause, // Safer access to cause
      });
    }
    return {
      success: false,
      apiName,
      endpoint: authUrl,
      latency: tokenLatency > 0 ? tokenLatency : undefined,
      error: {
        type: errorType,
        message: errorMessage,
        details: tokenFetchError,
        isRetryable: true,
      },
    };
  }

  // --- Step 2: Make a Test API Call with the Token ---
  logger.info(`[Server Verify] Testing ${apiName} resource endpoint: ${testResourceEndpoint}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(testResourceEndpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const totalLatency = Date.now() - startTime; // Use overall start time for total latency
    const responseData = await response.json().catch(() => ({}));

    if (response.ok) {
      // Determine actual number of accounts returned, checking for common response structures
      let recordCount: number | undefined = undefined;
      if (Array.isArray(responseData)) {
        recordCount = responseData.length;
      } else if (Array.isArray(responseData.data)) {
        recordCount = responseData.data.length;
      } else if (Array.isArray(responseData.accounts)) {
        // Check specific structure from OpenAPI spec
        recordCount = responseData.accounts.length;
      }

      logger.info(`[Server Verify] ${apiName} resource verification successful`, {
        latency: totalLatency,
        authMethod,
        statusCode: response.status,
        recordCount: recordCount,
      });
      return {
        success: true,
        apiName,
        endpoint: testResourceEndpoint, // Report the resource endpoint tested
        latency: totalLatency,
        data: {
          status: `Authenticated via ${authMethod}. ${response.statusText}`,
          accountCount: recordCount, // Report count if found
          // Optionally include sample data if needed, be mindful of size/sensitivity
          // firstAccountId: recordCount && recordCount > 0 ? responseData?.accounts?.[0]?.id : undefined,
        },
      };
    } else {
      // Handle API resource call errors
      let errorType = ApiErrorType.UNKNOWN_ERROR;
      if (response.status === 401 || response.status === 403) {
        // 401 could mean token expired or incorrect, 403 might be permissions
        errorType = ApiErrorType.AUTHENTICATION_ERROR;
      } else if (response.status === 404) {
        errorType = ApiErrorType.NOT_FOUND_ERROR;
      } else if (response.status >= 500) {
        errorType = ApiErrorType.SERVER_ERROR;
      }
      const isRetryable = [ApiErrorType.SERVER_ERROR].includes(errorType);
      logger.error(
        `[Server Verify] ${apiName} resource verification failed with HTTP ${response.status}`
      );
      return {
        success: false,
        apiName,
        endpoint: testResourceEndpoint,
        latency: totalLatency,
        error: {
          type: errorType,
          message: `API resource call failed: ${response.status} ${response.statusText}`,
          details: responseData,
          isRetryable,
        },
      };
    }
  } catch (fetchError) {
    // Handle fetch errors for the resource call
    const totalLatency = Date.now() - startTime;
    let errorType = ApiErrorType.NETWORK_ERROR;
    let errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
    let isRetryable = true;

    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      errorType = ApiErrorType.TIMEOUT_ERROR;
      errorMessage = 'API resource request timed out after 10000ms';
      isRetryable = true;
    }
    logger.error(
      `[Server Verify] ${apiName} verification failed with network/fetch error on resource call:`,
      errorMessage
    );
    return {
      success: false,
      apiName,
      endpoint: testResourceEndpoint, // Report resource endpoint as failing point
      latency: totalLatency > 0 ? totalLatency : undefined,
      error: {
        type: errorType,
        message: errorMessage,
        details: fetchError,
        isRetryable,
      },
    };
  }
}

/**
 * SERVER-SIDE Verify the Algolia Search API
 * Attempts to connect and potentially perform a basic index status check.
 */
export async function verifyAlgoliaApiServerSide(): Promise<ApiVerificationResult> {
  const apiName = 'Algolia Search API';
  const appId = serverConfig.algolia.appId;
  const apiKey = serverConfig.algolia.apiKey; // Search-Only Key
  const endpoint = `${appId}-dsn.algolia.net`; // General endpoint pattern

  if (!appId || !apiKey) {
    return {
      success: false,
      apiName,
      endpoint,
      error: {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Missing Algolia credentials in server configuration.',
        details:
          'Check server-config.ts and ensure NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_API_KEY are set.',
        isRetryable: false,
      },
    };
  }

  const startTime = Date.now();
  try {
    console.info(`[Server Verify] Testing ${apiName} with App ID: ${appId}`);

    // Initialize Algolia client
    const client = algoliasearch(appId, apiKey);

    // Perform a simple operation, like listing indices or checking status
    // Listing indices is a good general check
    // Note: Requires listIndexes ACL permission on the API key used.
    // If using the Search-Only key, this check might fail with an auth error.
    // Consider using client.search() for a single index if listIndices fails.
    const listIndicesResult = await client.listIndices();

    const latency = Date.now() - startTime;

    console.info(`[Server Verify] ${apiName} verification successful`, {
      latency,
      indicesCount: listIndicesResult.items.length,
    });

    return {
      success: true,
      apiName,
      endpoint: endpoint, // Use the generated dsn hostname
      latency,
      data: {
        status: 'Connected & Responsive',
        indicesCount: listIndicesResult.items.length,
        // Optionally list first few index names if needed
        // indices: listIndicesResult.items.slice(0, 5).map(idx => idx.name),
      },
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    let errorType = ApiErrorType.UNKNOWN_ERROR;
    let message = 'An unknown error occurred while verifying Algolia.';
    let details: unknown = error;

    // Basic error type mapping for Algolia client errors
    if (error instanceof Error) {
      message = error.message;
      if (
        message.includes('credentials') ||
        message.includes('Unauthorized') ||
        message.includes('401') ||
        message.includes('403')
      ) {
        errorType = ApiErrorType.AUTHENTICATION_ERROR;
      } else if (message.includes('connect') || message.includes('NetworkError')) {
        errorType = ApiErrorType.NETWORK_ERROR;
      } else if (message.includes('timeout')) {
        errorType = ApiErrorType.TIMEOUT_ERROR;
      }
      // Add more specific Algolia error checks if needed
      details = { errorMessage: message, stack: error.stack };
    }

    console.error(`[Server Verify] ${apiName} verification failed:`, message);

    return {
      success: false,
      apiName,
      endpoint: endpoint,
      latency,
      error: {
        type: errorType,
        message: message,
        details: details,
        isRetryable: [
          ApiErrorType.NETWORK_ERROR,
          ApiErrorType.TIMEOUT_ERROR,
          ApiErrorType.SERVER_ERROR,
        ].includes(errorType),
      },
    };
  }
}

/**
 * SERVER-SIDE Verify the Mux API
 * Attempts to list assets using Token ID and Secret.
 */
export async function verifyMuxApiServerSide(): Promise<ApiVerificationResult> {
  const apiName = 'Mux API';
  const baseUrl = 'https://api.mux.com';
  const testEndpoint = `${baseUrl}/video/v1/assets`;

  const tokenId = serverConfig.mux.tokenId;
  const tokenSecret = serverConfig.mux.tokenSecret;

  if (!tokenId || !tokenSecret) {
    return {
      success: false,
      apiName,
      endpoint: testEndpoint,
      error: {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Missing Mux Token ID or Token Secret in server configuration.',
        details: 'Check server-config.ts and ensure MUX_TOKEN_ID and MUX_TOKEN_SECRET are set.',
        isRetryable: false,
      },
    };
  }

  const startTime = Date.now();
  try {
    logger.info(`[Server Verify] Testing ${apiName} endpoint: ${testEndpoint}`);

    const encodedCredentials = Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64');
    const headers = {
      Authorization: `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const url = new URL(testEndpoint);
    url.searchParams.append('limit', '1'); // Limit results for efficiency

    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: headers,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    const responseData = await response.json().catch(() => ({}));

    if (response.ok) {
      logger.info(`[Server Verify] ${apiName} verification successful`, {
        latency,
        statusCode: response.status,
        recordCount: Array.isArray(responseData.data) ? responseData.data.length : undefined,
      });
      return {
        success: true,
        apiName,
        endpoint: testEndpoint,
        latency,
        data: {
          status: response.statusText,
          recordCount: Array.isArray(responseData.data) ? responseData.data.length : undefined,
          firstRecordId:
            Array.isArray(responseData.data) && responseData.data[0]?.id
              ? responseData.data[0].id
              : undefined,
        },
      };
    } else {
      let errorType = ApiErrorType.UNKNOWN_ERROR;
      if (response.status === 401) {
        // Mux uses 401 for auth errors
        errorType = ApiErrorType.AUTHENTICATION_ERROR;
      } else if (response.status >= 500) {
        errorType = ApiErrorType.SERVER_ERROR;
      } else if (response.status === 404) {
        errorType = ApiErrorType.NOT_FOUND_ERROR;
      } else if (response.status === 429) {
        errorType = ApiErrorType.RATE_LIMIT_ERROR;
      }

      const isRetryable = [ApiErrorType.SERVER_ERROR, ApiErrorType.RATE_LIMIT_ERROR].includes(
        errorType
      );

      logger.error(`[Server Verify] ${apiName} verification failed with HTTP ${response.status}`);
      return {
        success: false,
        apiName,
        endpoint: testEndpoint,
        latency,
        error: {
          type: errorType,
          message: `API returned error status: ${response.status} ${response.statusText}`,
          details: responseData,
          isRetryable,
        },
      };
    }
  } catch (fetchError) {
    const latency = Date.now() - startTime;
    let errorType = ApiErrorType.NETWORK_ERROR;
    let errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown network error';
    let isRetryable = true;

    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      errorType = ApiErrorType.TIMEOUT_ERROR;
      errorMessage = 'API request timed out after 10000ms';
      isRetryable = true;
    }
    logger.error(
      `[Server Verify] ${apiName} verification failed with network/fetch error:`,
      errorMessage
    );
    return {
      success: false,
      apiName,
      endpoint: testEndpoint,
      latency: latency > 0 ? latency : undefined,
      error: {
        type: errorType,
        message: errorMessage,
        details: fetchError,
        isRetryable,
      },
    };
  }
}

/**
 * SERVER-SIDE Verify the Resend API
 * Attempts to list sending domains to confirm API key validity.
 */
export async function verifyResendApi(): Promise<ApiVerificationResult> {
  const apiName = 'Resend API';
  const endpoint = 'resend.domains.list()'; // Conceptual endpoint for logging
  const apiKey = process.env.RESEND_SECRET;

  if (!apiKey) {
    return {
      success: false,
      apiName,
      endpoint,
      error: {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: 'Missing Resend API Key (RESEND_SECRET) in environment variables.',
        details: 'Please set RESEND_SECRET in your .env file.',
        isRetryable: false,
      },
    };
  }

  const startTime = Date.now();
  try {
    logger.info(`[Server Verify] Testing ${apiName}`);
    const resend = new Resend(apiKey);
    const { data: domainsResponseData, error: resendError } = await resend.domains.list();
    const latency = Date.now() - startTime;

    if (resendError) {
      logger.error(`[Server Verify] ${apiName} verification failed: Resend API error`, resendError);
      const isValidationError = resendError.name === 'validation_error';
      return {
        success: false,
        apiName,
        endpoint,
        latency,
        error: {
          type: isValidationError ? ApiErrorType.VALIDATION_ERROR : ApiErrorType.SERVER_ERROR,
          message: `Resend API returned an error: ${resendError.message}`,
          details: resendError,
          isRetryable: !isValidationError,
        },
      };
    }

    // If there was no error, domainsResponseData contains the object { data: Domain[] }
    // or it could be null if the API behaves unexpectedly without an error object.
    const domainList = domainsResponseData?.data || [];

    logger.info(`[Server Verify] ${apiName} verification successful`, {
      latency,
      domainCount: domainList.length,
    });
    return {
      success: true,
      apiName,
      endpoint,
      latency,
      data: {
        status: 'Authenticated & Connected',
        verifiedDomains: domainList.map(d => d.name),
        domainCount: domainList.length,
      },
    };
  } catch (error: unknown) {
    const latency = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown Resend verification error';
    logger.error(`[Server Verify] ${apiName} verification failed:`, errorMessage, error);
    return {
      success: false,
      apiName,
      endpoint,
      latency: latency > 0 ? latency : undefined,
      error: {
        type: ApiErrorType.UNKNOWN_ERROR, // Use a valid ApiErrorType member
        message: errorMessage,
        details: error,
        isRetryable: true,
      },
    };
  }
}

export default {
  verifyDatabaseConnectionServerSide,
  verifyInsightIQApi,
  verifyStripeApiServerSide,
  verifyCintExchangeApiServerSide,
  verifyGeolocationApi,
  verifyExchangeRatesApi,
  verifyGiphyApi,
  verifyAlgoliaApiServerSide,
  verifyMuxApiServerSide,
  verifyResendApi,
};
