import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { auth0: string } }
) {
  try {
    // Wait for params to be available
    const auth0Param = await params.auth0;
    
    // Your auth logic here...
    
    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }), 
      { status: 500 }
    );
  }
} 