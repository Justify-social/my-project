import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check which models are available on the prisma client
    const prismaKeys = Object.keys(prisma);

    // Get just those that are likely our models (exclude methods starting with $)
    const modelNames = prismaKeys.filter(key => !key.startsWith('$'));

    return NextResponse.json({
      success: true,
      availableModels: modelNames,
    });
  } catch (error) {
    console.error('Error getting model info:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
