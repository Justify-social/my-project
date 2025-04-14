import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

// Parse the UPLOADTHING_TOKEN to get appId and apiKey
function parseUploadThingToken(): { appId: string; apiKey: string; tokenFormat: string } | null {
  try {
    // Get token from environment
    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) {
      console.error('UPLOADTHING_TOKEN is not defined in environment variables');
      return null;
    }

    // Check if token starts with 'sk_' (legacy format)
    if (token.startsWith('sk_')) {
      console.log('Using legacy API key format (sk_)');
      // For legacy format, extract app ID if available
      const appId = process.env.UPLOADTHING_APP_ID || 'oq854trbes';
      return {
        appId,
        apiKey: token,
        tokenFormat: 'legacy_sk',
      };
    }

    // Handle base64 token format
    try {
      // Attempt to decode base64
      const base64Str = Buffer.from(token, 'base64').toString();
      const decoded = JSON.parse(base64Str);

      // Validate the decoded object has required fields
      if (!decoded.apiKey || !decoded.appId) {
        console.error(
          'Token decoded successfully but missing required fields:',
          Object.keys(decoded)
        );
        return null;
      }

      return {
        appId: decoded.appId,
        apiKey: decoded.apiKey,
        tokenFormat: 'base64_json',
      };
    } catch (decodeError) {
      // If base64 decode fails, try alternative formats
      console.error('Failed to decode token as base64:', decodeError);

      // Check if it might be a JSON string directly
      if (token.includes('"apiKey"') && token.includes('"appId"')) {
        try {
          const parsed = JSON.parse(token);
          if (parsed.apiKey && parsed.appId) {
            return {
              appId: parsed.appId,
              apiKey: parsed.apiKey,
              tokenFormat: 'direct_json',
            };
          }
        } catch (jsonError) {
          console.error('Failed to parse token as JSON:', jsonError);
        }
      }
    }

    // If we get here, we couldn't parse the token in any format
    return null;
  } catch (error) {
    console.error('Error parsing UPLOADTHING_TOKEN:', error);
    return null;
  }
}

/**
 * Test different authorization formats to see which one works
 */
async function testAuthorizationFormats(credentials: { appId: string; apiKey: string }): Promise<{
  success: boolean;
  workingFormat?: string;
  errors: Record<string, string>;
}> {
  const formats = [
    { name: 'bearer', header: `Bearer ${credentials.apiKey}` },
    { name: 'direct_sk', header: credentials.apiKey },
    { name: 'direct_bearer', header: `Bearer ${credentials.apiKey.replace(/^sk_/, '')}` },
  ];

  const errors: Record<string, string> = {};

  for (const format of formats) {
    try {
      const response = await fetch('https://uploadthing.com/api/files', {
        method: 'GET',
        headers: {
          Authorization: format.header,
          'Content-Type': 'application/json',
          'X-Uploadthing-App-Id': credentials.appId,
        },
      });

      if (response.ok) {
        return {
          success: true,
          workingFormat: format.name,
          errors,
        };
      } else {
        const errorText = await response.text();
        errors[format.name] = `Status ${response.status}: ${errorText.substring(0, 100)}`;
      }
    } catch (error) {
      errors[format.name] = error instanceof Error ? error.message : String(error);
    }
  }

  return { success: false, errors };
}

export async function GET() {
  try {
    // Initialize the UTApi
    const utapi = new UTApi();

    // Parse the token with our utility
    const credentials = parseUploadThingToken();

    // Test different auth formats
    const authTest = credentials
      ? await testAuthorizationFormats(credentials)
      : { success: false, errors: { token_parse: 'Failed to parse token' } };

    // Environment variable check
    const envCheck = {
      UPLOADTHING_TOKEN: !!process.env.UPLOADTHING_TOKEN,
      UPLOADTHING_TOKEN_LENGTH: process.env.UPLOADTHING_TOKEN?.length || 0,
      UPLOADTHING_APP_ID: !!process.env.UPLOADTHING_APP_ID,
      UPLOADTHING_SECRET: !!process.env.UPLOADTHING_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Test UTApi directly
    let apiTest: { success: boolean; message: string; error: string | null };
    try {
      const files = await utapi.listFiles({ limit: 5 });
      apiTest = {
        success: true,
        message: `UTApi returned ${files.files.length} files`,
        error: null,
      };
    } catch (error) {
      apiTest = {
        success: false,
        message: 'UTApi call failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      token: credentials
        ? {
            parsed: true,
            appId: credentials.appId,
            apiKeyFormat: credentials.apiKey.startsWith('sk_') ? 'sk_format' : 'non_sk_format',
            apiKeyLength: credentials.apiKey.length,
            tokenFormat: credentials.tokenFormat,
          }
        : {
            parsed: false,
            error: 'Could not parse token',
          },
      authTest,
      apiTest,
      message: 'This diagnostic endpoint helps debug UploadThing authentication issues',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error running diagnostics',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
