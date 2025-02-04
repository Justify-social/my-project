// src/app/api/brand-health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    sentiment: 'Positive',
    score: 85,
    trend: 'up'
  });
}
