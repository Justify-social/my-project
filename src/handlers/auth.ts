import { NextRequest, NextResponse } from 'next/server';

/**
 * Improved route handler for auth0 flow
 * Uses proper async/await pattern for params
 */
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ auth0: string }> }
) {
  try {
    // Correctly await the params
    const { auth0 } = await params;
    
    // Now use auth0 as a string safely
    console.log(`Processing auth request for action: ${auth0}`);
    
    // Example conditional logic based on auth0 param
    switch (auth0) {
      case 'login':
        return NextResponse.json({ success: true, action: 'login' });
      case 'logout':
        return NextResponse.json({ success: true, action: 'logout' });
      case 'callback':
        return NextResponse.json({ success: true, action: 'callback' });
      default:
        return NextResponse.json({ success: false, error: 'Unknown auth action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing auth request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process auth request' },
      { status: 500 }
    );
  }
} 