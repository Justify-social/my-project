import { NextRequest, NextResponse } from 'next/server';

const PHYLLO_CLIENT_ID = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID;
const PHYLLO_SECRET = process.env.PHYLLO_SECRET || process.env.NEXT_PUBLIC_PHYLLO_SECRET;
if (!PHYLLO_CLIENT_ID || !PHYLLO_SECRET) {
  throw new Error('Missing Phyllo credentials in environment variables');
}
const PHYLLO_AUTH = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString('base64');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
}
