import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/utils/logger';

// *** Remove explicit dotenv loading ***
// import dotenv from 'dotenv';
// dotenv.config({ path: '.env' });
// *************************************

// Import verification FUNCTIONS from the server-only file
import {
  verifyInsightIQApi,
  verifyStripeApiServerSide,
  verifyCintExchangeApiServerSide,
  verifyUploadthingApiServerSide,
  verifyDatabaseConnectionServerSide,
  verifyGeolocationApi,
  verifyExchangeRatesApi,
  verifyGiphyApi,
  verifyAlgoliaApiServerSide,
  verifyMuxApiServerSide,
  verifySendGridApiServerSide,
} from '@/lib/api-verification';

// Import shared TYPES/ENUMS from the client-safe file
import type { ApiVerificationResult } from '@/lib/api-verification-types';
import { ApiErrorType } from '@/lib/api-verification-types';

// Schema now allows apiName to be optional or 'all'
const ApiNameSchema = z.object({
  apiName: z.string().min(1).optional(),
});

// List of all verification functions to run for 'Test All'
const ALL_API_VERIFIERS = [
  { name: 'insightiq', func: verifyInsightIQApi }, // Updated name and function
  { name: 'stripe', func: verifyStripeApiServerSide },
  { name: 'cint', func: verifyCintExchangeApiServerSide },
  { name: 'uploadthing', func: verifyUploadthingApiServerSide },
  { name: 'database', func: verifyDatabaseConnectionServerSide },
  { name: 'geolocation', func: verifyGeolocationApi },
  { name: 'exchange', func: verifyExchangeRatesApi },
  { name: 'giphy', func: verifyGiphyApi },
  { name: 'algolia', func: verifyAlgoliaApiServerSide },
  { name: 'mux', func: verifyMuxApiServerSide },
  { name: 'sendgrid', func: verifySendGridApiServerSide },
];

export async function POST(request: NextRequest) {
  logger.info('[API /debug/verify-api] POST request received');

  let apiNameToTest: string | undefined;
  try {
    // Allow empty body for 'test all'
    const body = await request.json().catch(() => ({}));
    const validationResult = ApiNameSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn(
        '[API /debug/verify-api] Invalid request body:',
        validationResult.error.flatten()
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }
    apiNameToTest = validationResult.data.apiName;
  } catch (error) {
    // This catch might not be needed if .catch() is used above
    logger.error('[API /debug/verify-api] Error parsing request body:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    let results: ApiVerificationResult[];

    if (apiNameToTest && apiNameToTest !== 'all') {
      // Test a single API
      logger.info(`[API /debug/verify-api] Request to verify SINGLE API: ${apiNameToTest}`);
      const verifier = ALL_API_VERIFIERS.find(v => v.name === apiNameToTest);
      if (!verifier) {
        logger.warn(`[API /debug/verify-api] Unknown API requested: ${apiNameToTest}`);
        return NextResponse.json(
          { success: false, error: `Unknown API: ${apiNameToTest}` },
          { status: 400 }
        );
      }
      const singleResult = await verifier.func();
      results = [singleResult];
    } else {
      // Test ALL APIs
      logger.info(`[API /debug/verify-api] Request to verify ALL APIs.`);
      const promises = ALL_API_VERIFIERS.map(v => v.func());
      const settledResults = await Promise.allSettled(promises);

      results = settledResults.map((settledResult, index) => {
        const verifier = ALL_API_VERIFIERS[index];
        if (settledResult.status === 'fulfilled') {
          return settledResult.value;
        } else {
          // Handle unexpected errors during verification function execution
          const message =
            settledResult.reason instanceof Error
              ? settledResult.reason.message
              : 'Verification function failed';
          logger.error(
            `[API /debug/verify-api] Uncaught error verifying ${verifier.name}:`,
            settledResult.reason
          );
          return {
            success: false,
            apiName: verifier.name.charAt(0).toUpperCase() + verifier.name.slice(1) + ' API', // Format name
            endpoint: 'unknown',
            error: {
              type: ApiErrorType.UNKNOWN_ERROR,
              message: message,
              details: settledResult.reason,
              isRetryable: true, // Assume retryable for unexpected errors
            },
          };
        }
      });
    }

    logger.info(
      `[API /debug/verify-api] Verification complete. Returning ${results.length} results.`
    );
    return NextResponse.json({ success: true, data: results });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown internal error during API verification process';
    logger.error(`[API /debug/verify-api] Unexpected error during verification process:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to run API verification', details: message },
      { status: 500 }
    );
  }
}
