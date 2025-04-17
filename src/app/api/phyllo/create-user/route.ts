import { NextRequest, NextResponse } from 'next/server';

// TODO: Uncomment Phyllo credential checks and ensure they are set in the build environment.
/*
const PHYLLO_CLIENT_ID = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID;
const PHYLLO_SECRET = process.env.PHYLLO_SECRET || process.env.NEXT_PUBLIC_PHYLLO_SECRET;
if (!PHYLLO_CLIENT_ID || !PHYLLO_SECRET) {
  console.error('Build Error: Missing Phyllo credentials in environment variables. Temporarily disabling route.');
  // We can't throw here at module level easily in a way that allows build but disables route, 
  // so we'll handle it in the POST handler for now.
  // throw new Error('Missing Phyllo credentials in environment variables');
}
const PHYLLO_AUTH = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString('base64');
*/

export async function POST(_req: NextRequest) {
  // Prefix unused req
  // TODO: Remove this block and uncomment the credential checks/API call below when re-enabling.
  console.error('Phyllo /create-user route temporarily disabled due to missing build credentials.');
  return NextResponse.json(
    { error: 'Phyllo user creation is temporarily disabled.' },
    { status: 503 } // Service Unavailable
  );
  /*
    try {
      const PHYLLO_CLIENT_ID = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID;
      const PHYLLO_SECRET = process.env.PHYLLO_SECRET || process.env.NEXT_PUBLIC_PHYLLO_SECRET;
      if (!PHYLLO_CLIENT_ID || !PHYLLO_SECRET) {
        console.error('Runtime Error: Missing Phyllo credentials. Cannot create user.');
        return NextResponse.json({ error: 'Phyllo configuration error' }, { status: 500 });
      }
      const PHYLLO_AUTH = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString('base64');
  
      const body = await _req.json(); // Use prefixed _req
      const { external_id, name } = body;
      if (!external_id || !name) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }
      const response = await fetch('https://api.staging.getphyllo.com/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${PHYLLO_AUTH}`,
        },
        body: JSON.stringify({ name, external_id }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phyllo user creation error:', errorText);
        throw new Error(`Phyllo user creation failed: ${response.status}`);
      }
      const result = await response.json();
      return NextResponse.json(result);
    } catch (err) {
      console.error('Failed to create Phyllo user:', err);
      return NextResponse.json({ error: 'Failed to create Phyllo user' }, { status: 500 });
    }
  */
}
