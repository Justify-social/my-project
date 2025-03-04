import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function GET() {
  try {
    // Check if we can access UploadThing API
    let apiStatus = 'unknown';
    let fileRoutes: any = null;
    
    try {
      // Try to list some files to check if the API is working
      // This will fail safely if there are no files or if the API is not configured
      const files = await utapi.listFiles({
        limit: 1,
      });
      
      apiStatus = 'connected';
      fileRoutes = files;
    } catch (apiError) {
      console.warn('API check failed, but continuing:', apiError);
      apiStatus = 'error';
    }
    
    return NextResponse.json({
      success: true,
      message: 'UploadThing test endpoint',
      apiStatus,
      fileRoutes,
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