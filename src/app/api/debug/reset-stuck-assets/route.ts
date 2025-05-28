import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated This endpoint has been consolidated into /api/debug/mux
 * Redirects to the new SSOT endpoint for consistency
 */
export async function POST(req: NextRequest) {
  // Forward the request to the new consolidated endpoint
  const body = await req.json().catch(() => ({}));

  const newRequest = new Request(`${req.nextUrl.origin}/api/debug/mux`, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({
      action: 'resetStuckAssets',
      ...body,
    }),
  });

  const response = await fetch(newRequest);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
