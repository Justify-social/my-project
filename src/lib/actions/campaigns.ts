import { logger } from '@/utils/logger';

/**
 * Checks if a campaign name already exists for the currently authenticated user.
 * IMPORTANT: This function is designed to be called from client-side code
 * (like Zod refine) that triggers API routes, or potentially Server Actions.
 * It relies on the fetch call automatically including authentication cookies.
 *
 * @param name The campaign name to check.
 * @returns Promise<boolean> - True if the name exists, false otherwise.
 * @throws Error if the API call fails or returns an unexpected format.
 */
export async function checkCampaignNameExists(name: string): Promise<boolean> {
  if (!name || name.trim().length === 0) {
    return false; // Don't check empty names
  }

  try {
    // Revert to relative URL, assuming client-side execution
    const apiUrl = `/api/campaigns/check-name?name=${encodeURIComponent(name)}`;
    logger.info(`[checkCampaignNameExists] Checking URL: ${apiUrl}`);

    // We rely on the browser (or Server Action context) to send auth cookies.
    // The API route itself handles the authentication verification.
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Include credentials if fetching from client-side in different subdomains/ports
        // credentials: 'include', // Usually not needed for same-origin API calls
      },
      // Add cache: 'no-store' to ensure fresh data if needed,
      // especially if called multiple times quickly during validation.
      cache: 'no-store',
    });

    if (!response.ok) {
      // Attempt to parse error details, but throw generic error if parsing fails
      let errorMsg = `API error checking name: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch (parseError) {
        /* ignore */
      }

      // Handle specific auth errors if needed (though API should handle internally)
      if (response.status === 401) {
        logger.warn('[checkCampaignNameExists] Received 401 from API');
        // Decide how to handle auth errors - rethrow? return specific status?
        // For Zod refine, throwing often works best.
        throw new Error('Authentication required to check name.');
      }

      throw new Error(errorMsg);
    }

    const result = await response.json();

    if (typeof result.exists !== 'boolean') {
      throw new Error('Invalid response format from check-name API.');
    }

    return result.exists;
  } catch (error) {
    logger.error('[checkCampaignNameExists] Failed to check campaign name:', error);
    // Let the caller (Zod refine) handle this error
    throw error;
  }
}
