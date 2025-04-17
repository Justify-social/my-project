import { NextRequest, NextResponse } from 'next/server';

// TODO: Uncomment Phyllo credential checks and ensure they are set in the build environment.
/*
const PHYLLO_CLIENT_ID = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID;
const PHYLLO_SECRET = process.env.PHYLLO_SECRET || process.env.NEXT_PUBLIC_PHYLLO_SECRET;
if (!PHYLLO_CLIENT_ID || !PHYLLO_SECRET) {
  console.error('Build Error: Missing Phyllo credentials for SDK token. Temporarily disabling route.');
  // Handle in POST handler
  // throw new Error('Missing Phyllo credentials in environment variables');
}
const PHYLLO_AUTH = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString('base64');
*/

export async function POST(_req: NextRequest) {
  // Prefix unused req
  // TODO: Remove this block and uncomment the credential checks/API call below when re-enabling.
  console.error('Phyllo /sdk-token route temporarily disabled due to missing build credentials.');
  return NextResponse.json(
    { error: 'Phyllo SDK token generation is temporarily disabled.' },
    { status: 503 } // Service Unavailable
  );
  /*
    try {
      const PHYLLO_CLIENT_ID = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID;
      const PHYLLO_SECRET = process.env.PHYLLO_SECRET || process.env.NEXT_PUBLIC_PHYLLO_SECRET;
      if (!PHYLLO_CLIENT_ID || !PHYLLO_SECRET) {
        console.error('Runtime Error: Missing Phyllo credentials. Cannot get SDK token.');
        return NextResponse.json({ error: 'Phyllo configuration error' }, { status: 500 });
      }
      const PHYLLO_AUTH = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString('base64');
  
      const body = await _req.json();
      const { user_id } = body;
      if (!user_id) {
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      }
      // Request the SDK token from Phyllo
      const response = await fetch('https://api.staging.getphyllo.com/v1/sdk-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${PHYLLO_AUTH}`,
        },
        body: JSON.stringify({
          user_id,
          products: ['IDENTITY', 'ENGAGEMENT'],
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phyllo SDK token error:', errorText);
        throw new Error(`Token fetch failed: ${response.status}`);
      }
      const result = await response.json();
      return NextResponse.json(result);
    } catch (err) {
      console.error('Error fetching SDK token:', err);
      return NextResponse.json({ error: 'Failed to fetch SDK token' }, { status: 500 });
    }
  */
}
