import { NextResponse } from 'next/server';

// Cache for UploadThing API responses (to avoid excessive API calls)
const UPLOADTHING_CACHE = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Additional cache for known good URL formats for each file
const FILE_URL_CACHE = new Map<string, { timestamp: number; url: string }>();

/**
 * Parse the UPLOADTHING_TOKEN to get appId and apiKey
 * This function has enhanced error handling and validation
 */
function parseUploadThingToken(): { appId: string; apiKey: string } | null {
  try {
    // Get token from environment
    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) {
      console.error('UPLOADTHING_TOKEN is not defined in environment variables');
      return null;
    }

    // For logging/debugging - don't log the full token
    console.log(`Token exists and is ${token.length} characters long`);

    // Check if token starts with 'sk_' (legacy format)
    if (token.startsWith('sk_')) {
      console.log('Using legacy API key format (sk_)');
      // For legacy format, extract app ID if available
      const appId = process.env.UPLOADTHING_APP_ID || 'oq854trbes';
      return {
        appId,
        apiKey: token,
      };
    }

    // Handle base64 token format
    try {
      // Attempt to decode base64
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      console.log('Successfully decoded token as base64');

      // Validate the decoded object has required fields
      if (!decoded.apiKey || !decoded.appId) {
        console.error(
          'Token decoded successfully but missing required fields:',
          Object.keys(decoded)
        );
        return null;
      }

      console.log(
        `Valid credentials found: appId=${decoded.appId}, apiKey=${decoded.apiKey.substring(0, 5)}...`
      );
      return {
        appId: decoded.appId,
        apiKey: decoded.apiKey,
      };
    } catch (decodeError) {
      // If base64 decode fails, try alternative formats
      console.error('Failed to decode token as base64:', decodeError);

      // Check if it might be a JSON string directly
      if (token.includes('"apiKey"') && token.includes('"appId"')) {
        try {
          const parsed = JSON.parse(token);
          if (parsed.apiKey && parsed.appId) {
            console.log('Parsed token as direct JSON');
            return {
              appId: parsed.appId,
              apiKey: parsed.apiKey,
            };
          }
        } catch (jsonError) {
          console.error('Failed to parse token as JSON:', jsonError);
        }
      }
    }

    // If we get here, we couldn't parse the token in any format
    console.error('Could not parse token in any known format');
    return null;
  } catch (error) {
    console.error('Error parsing UPLOADTHING_TOKEN:', error);
    return null;
  }
}

/**
 * Asset proxy endpoint to work around CORS restrictions
 * Fetches the asset from the original URL and serves it with permissive CORS headers
 */
export async function GET(request: Request) {
  return handleAssetProxy(request, false);
}

/**
 * Support HEAD requests for video resource detection
 */
export async function HEAD(request: Request) {
  return handleAssetProxy(request, true);
}

/**
 * Query the UploadThing API for file information
 */
async function queryUploadThingAPI(): Promise<any> {
  const cacheKey = 'uploadthing-files';
  const cached = UPLOADTHING_CACHE.get(cacheKey);

  // Return cached result if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached UploadThing API response');
    return cached.data;
  }

  try {
    console.log('Querying UploadThing API for files...');

    // Try to parse the token with enhanced error handling
    const credentials = parseUploadThingToken();
    if (!credentials) {
      console.error('Failed to get valid credentials from UPLOADTHING_TOKEN');

      // Try using legacy environment variables directly
      if (process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID) {
        console.log('Using legacy environment variables directly');

        // FIXED URL STRUCTURE: Use api.uploadthing.com with v1 path
        const url = `https://api.uploadthing.com/v1/files?apiKey=${process.env.UPLOADTHING_SECRET}`;

        console.log(
          `Trying legacy API endpoint: ${url.replace(process.env.UPLOADTHING_SECRET || '', '[REDACTED]')}`
        );

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Legacy auth returned ${data.files?.length || 0} files`);

          // Cache the response
          UPLOADTHING_CACHE.set(cacheKey, {
            timestamp: Date.now(),
            data,
          });

          return data;
        } else {
          const errorText = await response.text();
          console.error('Legacy auth failed:', errorText);
        }
      }

      throw new Error('No valid UploadThing credentials available');
    }

    // CRITICAL FIX: Use api.uploadthing.com domain with v1 path and correct parameter format
    console.log(`Using query parameters for API authentication`);

    // Construct URL with query parameters - use api.uploadthing.com and v1 path
    const apiUrl = `https://api.uploadthing.com/v1/files?apiKey=${credentials.apiKey}`;

    console.log(
      `Trying API endpoint with query parameters: ${apiUrl.replace(credentials.apiKey, '[REDACTED]')}`
    );
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`UploadThing API returned ${data.files?.length || 0} files`);

      // Cache the response
      UPLOADTHING_CACHE.set(cacheKey, {
        timestamp: Date.now(),
        data,
      });

      return data;
    } else {
      // Log response details for debugging
      const status = response.status;
      console.log(`API endpoint failed with status ${status}`);

      try {
        const errorText = await response.text();
        console.error('API error details:', errorText);

        // Try with admin endpoint as a fallback, using correct URL structure
        if (status === 400 || status === 401) {
          console.log('Trying admin endpoint with query parameters...');

          // Use the admin endpoint with correct domain and path
          const adminUrl = `https://api.uploadthing.com/v1/admin/files?apiKey=${credentials.apiKey}`;

          console.log(
            `Trying admin API endpoint: ${adminUrl.replace(credentials.apiKey, '[REDACTED]')}`
          );

          const adminResponse = await fetch(adminUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (adminResponse.ok) {
            const data = await adminResponse.json();
            console.log(`Admin API endpoint returned ${data.files?.length || 0} files`);

            // Cache the response
            UPLOADTHING_CACHE.set(cacheKey, {
              timestamp: Date.now(),
              data,
            });

            return data;
          } else {
            const adminErrorText = await adminResponse.text();
            console.error('Admin endpoint failed:', adminErrorText);
            throw new Error(`UploadThing API error: ${adminResponse.status} - ${adminErrorText}`);
          }
        }

        throw new Error(`UploadThing API error: ${status} - ${errorText}`);
      } catch (e) {
        throw new Error(`UploadThing API error: ${status}`);
      }
    }
  } catch (error) {
    console.error('Error querying UploadThing API:', error);
    throw error;
  }
}

/**
 * Find all potential file keys for a given requested file ID
 */
async function findUploadThingFileKeys(requestedFileId: string): Promise<string[]> {
  try {
    // First check if this is a local development mock file
    if (requestedFileId.includes('mock') || requestedFileId.includes('example')) {
      console.log('Using mock file key for development testing');
      return [requestedFileId]; // Just use as-is
    }

    // IMPORTANT: Don't immediately return empty array for newly uploaded files
    // Give the UploadThing API a chance to reflect the new upload
    console.log(`Searching for file keys matching: ${requestedFileId}`);

    // Try a direct fetch first before API query for newly uploaded files
    try {
      // For fresh uploads, try direct access first before API lookup
      const directUrls = [
        `https://oq854trbes.ufs.sh/f/${requestedFileId}`,
        `https://utfs.io/f/${requestedFileId}`,
      ];

      for (const url of directUrls) {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ Direct URL check successful for newly uploaded file: ${url}`);
          return [requestedFileId]; // File exists, return it directly
        }
      }
    } catch (directError) {
      console.log(
        'Direct URL check failed, falling back to API:',
        directError instanceof Error ? directError.message : String(directError)
      );
    }

    const apiResponse = await queryUploadThingAPI();
    if (!apiResponse?.files) {
      console.log('No files returned from API response');

      // CRITICAL FIX: Instead of returning empty array which marks file as deleted,
      // return the original requestedFileId for newly uploaded files that might not
      // be in the API response yet
      if (requestedFileId && requestedFileId.length > 10) {
        console.log(`Returning original file ID for possible new upload: ${requestedFileId}`);
        return [requestedFileId];
      }

      return [];
    }

    // Log number of files returned for debugging
    console.log(`Processing ${apiResponse.files.length} files from UploadThing API`);

    // Look for exact and partial matches
    const matches = apiResponse.files.filter((file: any) => {
      const fileKey = file.key || '';
      // Include both exact match and contains match for flexibility
      const isMatch = fileKey === requestedFileId || fileKey.includes(requestedFileId);
      if (isMatch) {
        console.log(`Found matching file key: ${fileKey} for requested ID: ${requestedFileId}`);
      }
      return isMatch;
    });

    const keys = matches.map((file: any) => file.key || '').filter(Boolean);
    console.log(`Found ${keys.length} matching file keys`);

    // If no keys found but we have a valid ID, still return the original ID
    // This handles the case where the file was just uploaded and isn't in the API yet
    if (keys.length === 0 && requestedFileId && requestedFileId.length > 10) {
      console.log(
        `No matches in API but returning original ID for possible new upload: ${requestedFileId}`
      );
      return [requestedFileId];
    }

    return keys;
  } catch (error) {
    console.error('Error finding file keys:', error);

    // CRITICAL FIX: Don't return empty array for errors, as this marks the file as deleted
    // Instead, return the original file ID to try direct access
    if (requestedFileId && requestedFileId.length > 10) {
      console.log(`Returning original file ID after error: ${requestedFileId}`);
      return [requestedFileId];
    }

    // Return empty array only if we have no usable ID
    return [];
  }
}

/**
 * Check if a URL format works for a given file key
 */
async function checkUrlFormat(urlFormat: string, fetchOptions: RequestInit): Promise<boolean> {
  try {
    console.log(`Trying UploadThing URL format: ${urlFormat}`);
    const response = await fetch(urlFormat, fetchOptions);

    if (response.ok) {
      console.log(`✅ Successful URL format: ${urlFormat}`);
      // Cache this successful URL format for future use
      const fileId = extractFileIdFromUrl(urlFormat);
      if (fileId) {
        FILE_URL_CACHE.set(fileId, {
          timestamp: Date.now(),
          url: urlFormat,
        });
      }
      return true;
    } else {
      console.log(`❌ Failed URL format (${response.status}): ${urlFormat}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ Error fetching: ${urlFormat}`, e instanceof Error ? e.message : String(e));
    return false;
  }
}

/**
 * Extract a file ID from a URL
 */
function extractFileIdFromUrl(url: string): string {
  if (url.includes('/f/')) {
    return url.split('/f/')[1].split('?')[0];
  } else if (url.includes('/files/')) {
    return url.split('/files/')[1].split('?')[0];
  }
  return '';
}

/**
 * Common handler for both GET and HEAD requests with intelligent fallbacks
 */
async function handleAssetProxy(request: Request, isHeadRequest = false) {
  const url = new URL(request.url);
  const assetUrl = url.searchParams.get('url');
  const fileId = url.searchParams.get('fileId');

  if (!assetUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  // Check if this is an UploadThing URL
  const isUploadThingUrl =
    assetUrl.includes('ufs.sh') || assetUrl.includes('uploadthing') || assetUrl.includes('utfs.io');

  // Extract file ID from URL if not passed directly
  let extractedFileId = fileId || '';
  if (!extractedFileId && isUploadThingUrl) {
    if (assetUrl.includes('/f/')) {
      extractedFileId = assetUrl.split('/f/')[1].split('?')[0];
    } else if (assetUrl.includes('/files/')) {
      extractedFileId = assetUrl.split('/files/')[1].split('?')[0];
    }
  }

  console.log(`Using UploadThing file ID: ${extractedFileId}`);

  try {
    // For UploadThing URLs, try all possible formats
    if (isUploadThingUrl && extractedFileId) {
      // CRITICAL FIX: For newly uploaded files, try direct access first
      // This bypasses the API lookup which might not have the file yet
      if (extractedFileId) {
        try {
          // Try direct access to the URL
          console.log(`Trying direct access to URL for newly uploaded file: ${assetUrl}`);
          const directResponse = await fetch(assetUrl, { method: 'HEAD' });

          if (directResponse.ok) {
            console.log(`✅ Direct URL access successful for: ${assetUrl}`);
            // File exists, return it directly
            return isHeadRequest ? new Response(null, { status: 200 }) : fetch(assetUrl);
          } else {
            console.log(`❌ Direct URL access failed with status ${directResponse.status}`);
          }
        } catch (directError) {
          console.log(
            `❌ Direct URL access error: ${directError instanceof Error ? directError.message : String(directError)}`
          );
        }
      }

      // Try to use cached URL first if available
      const cachedFormat = FILE_URL_CACHE.get(extractedFileId);
      if (cachedFormat && Date.now() - cachedFormat.timestamp < CACHE_TTL) {
        console.log(`Using cached URL format for ${extractedFileId}: ${cachedFormat.url}`);
        try {
          const response = await fetch(cachedFormat.url, { method: 'HEAD' });
          if (response.ok) {
            console.log(`✅ Cached URL format is still valid`);
            return isHeadRequest ? new Response(null, { status: 200 }) : fetch(cachedFormat.url);
          } else {
            console.log(`❌ Cached URL format is no longer valid, trying alternatives`);
          }
        } catch (error) {
          console.log(
            `❌ Error fetching cached URL: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      // Get credentials from token
      const credentials = parseUploadThingToken();
      if (!credentials) {
        console.error('Failed to get credentials for URL generation');

        // Try with direct URL without credentials
        try {
          console.log(`Trying direct access without credentials: ${assetUrl}`);
          const response = await fetch(assetUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log(`✅ Direct URL works without credentials: ${assetUrl}`);
            return isHeadRequest ? new Response(null, { status: 200 }) : fetch(assetUrl);
          } else {
            console.log(`❌ Direct URL failed with status: ${response.status}`);
          }
        } catch (error) {
          console.log(
            `❌ Direct URL failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        throw new Error('No valid credentials and direct URL failed');
      }

      // Get all potential file keys (including from the UploadThing API)
      const potentialFileKeys = await findUploadThingFileKeys(extractedFileId);
      console.log(`Found ${potentialFileKeys.length} potential file keys for UploadThing assets`);

      // CRITICAL FIX: Only mark as deleted if we explicitly confirmed file doesn't exist
      // Don't mark as deleted just because the file is not found in the API yet
      if (potentialFileKeys.length === 0) {
        // Before returning 410 Gone, do one final direct check
        try {
          const finalCheck = await fetch(assetUrl, { method: 'HEAD' });
          if (finalCheck.ok) {
            console.log(`✅ Final direct check succeeded for: ${assetUrl}`);
            return isHeadRequest ? new Response(null, { status: 200 }) : fetch(assetUrl);
          }
        } catch (e) {
          // Continue with 410 Gone if final check fails
        }

        console.log(
          `🗑️ File confirmed as permanently deleted after exhaustive checks: ${extractedFileId}`
        );
        return NextResponse.json(
          {
            error: 'File has been permanently deleted',
            url: assetUrl,
            fileId: extractedFileId,
            deleted: true,
          },
          {
            status: 410, // Gone - indicates resource no longer exists
            headers: {
              'X-File-Status': 'deleted',
              'Cache-Control': 'public, max-age=86400', // Cache this response
            },
          }
        );
      }

      // Try each file key with multiple URL formats
      for (const potentialKey of potentialFileKeys) {
        // Try different URL formats with the correct app ID
        const urlFormats = [
          `https://${credentials.appId}.ufs.sh/f/${potentialKey}`,
          `https://uploadthing.com/f/${potentialKey}`,
          `https://utfs.io/f/${potentialKey}`,
        ];

        console.log(
          `Trying ${urlFormats.length} different URL formats for file key: ${potentialKey}`
        );

        for (const url of urlFormats) {
          try {
            console.log(`Attempting URL: ${url}`);
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              console.log(`✅ Success with URL: ${url}`);

              // Cache this successful format
              FILE_URL_CACHE.set(extractedFileId, {
                timestamp: Date.now(),
                url,
              });

              // When successful, log if ID mismatch detected
              if (potentialKey !== extractedFileId) {
                console.log(
                  `⚠️ File ID mismatch: requested ${extractedFileId} but found ${potentialKey}`
                );
                console.log(
                  `💡 Consider updating your database records to use ${potentialKey} instead of ${extractedFileId}`
                );
              }

              // Forward the successful response
              return isHeadRequest ? new Response(null, { status: 200 }) : fetch(url);
            } else {
              console.log(`❌ Failed with status ${response.status} for URL: ${url}`);
            }
          } catch (error) {
            console.warn(`Failed to fetch ${url}:`, error);
            continue;
          }
        }
      }

      // As a last resort, try direct proxy if all else fails
      console.log(`All URL formats failed, attempting direct proxy of: ${assetUrl}`);
      try {
        const directResponse = await fetch(assetUrl, { method: isHeadRequest ? 'HEAD' : 'GET' });
        if (directResponse.ok) {
          console.log(`✅ Direct proxy successful`);
          return directResponse;
        } else {
          console.log(`❌ Direct proxy failed with status: ${directResponse.status}`);
        }
      } catch (error) {
        console.log(
          `❌ Direct proxy error: ${error instanceof Error ? error.message : String(error)}`
        );

        // CRITICAL FIX: Properly handle connection errors to prevent server crash
        // Return a 503 Service Unavailable instead of letting the error propagate
        return NextResponse.json(
          {
            error: 'Service temporarily unavailable',
            url: assetUrl,
            details: error instanceof Error ? error.message : 'Connection error',
            retry: true,
          },
          {
            status: 503,
            headers: {
              'Retry-After': '5', // Suggest client retry after 5 seconds
              'Cache-Control': 'no-store', // Don't cache error responses
            },
          }
        );
      }
    }

    // If we get here, none of the URLs worked
    console.log(`⛔ All attempts failed for file: ${extractedFileId}`);
    return NextResponse.json(
      {
        error: 'File not found after multiple attempts',
        url: assetUrl,
        fileId: extractedFileId,
        attempts: 'all_failed',
      },
      { status: 404 }
    );
  } catch (error) {
    // CRITICAL FIX: Catch all errors and return proper response instead of crashing
    console.error('Error in asset proxy:', error);

    // Return a structured error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        url: assetUrl || 'not_provided',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store', // Don't cache error responses
        },
      }
    );
  }
}
