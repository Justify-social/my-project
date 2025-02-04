import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalInfluencers: 5,
    averageEngagement: 7.5,
  });
}
