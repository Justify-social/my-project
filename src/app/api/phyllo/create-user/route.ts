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
}
