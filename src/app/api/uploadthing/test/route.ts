import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

// Parse the UPLOADTHING_TOKEN to get appId and apiKey
function parseUploadThingToken(): { appId: string; apiKey: string } | null {
  try {
    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) return null;
    
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return {
      appId: decoded.appId,
      apiKey: decoded.apiKey
    };
  } catch (error) {
    console.error('Error parsing UPLOADTHING_TOKEN:', error);
    return null;
  }
}

const utapi = new UTApi();

export async function GET() {
  try {
    // Parse token to check validity
    const credentials = parseUploadThingToken();
    console.log("Parsed credentials:", credentials ? "Valid" : "Invalid");
    
    // Check if we can access UploadThing API
    let apiStatus = 'unknown';
    let filesCount = 0;
    
    try {
      // Try to list some files to check if the API is working
      const result = await utapi.listFiles({
        limit: 10,
      });
      
      apiStatus = 'connected';
      filesCount = result.files.length;
      console.log(`UploadThing API returned ${filesCount} files`);
    } catch (apiError) {
      console.error('API check failed:', apiError);
      apiStatus = 'error';
    }
    
    return NextResponse.json({
      success: true,
      message: 'UploadThing test endpoint',
      apiStatus,
      filesCount,
      credentials: credentials ? { 
        appId: credentials.appId,
        // Don't return the actual API key for security
        apiKeyValid: !!credentials.apiKey
      } : null,
      env: {
        // Safely check if the environment variable exists (without showing the actual value)
        UPLOADTHING_TOKEN: !!process.env.UPLOADTHING_TOKEN,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Error testing UploadThing configuration:', error);
    return NextResponse.json({
      success: false,
      message: 'Error testing UploadThing configuration',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 