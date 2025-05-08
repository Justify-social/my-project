import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // Use default import
import { logger } from '@/utils/logger';
import { z } from 'zod';

const nameSchema = z.string().min(1, { message: 'Campaign name cannot be empty.' });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  logger.info(`[API] Checking campaign name existence for: "${name}"`);

  const validationResult = nameSchema.safeParse(name);
  if (!validationResult.success) {
    logger.warn('[API] Invalid campaign name for check:', validationResult.error.flatten());
    return NextResponse.json(
      { success: false, error: 'Invalid campaign name provided.' },
      { status: 400 }
    );
  }

  try {
    const count = await db.campaignWizard.count({
      where: {
        name: {
          equals: validationResult.data,
          mode: 'insensitive', // Case-insensitive check
        },
      },
    });

    const exists = count > 0;
    logger.info(
      `[API] Campaign name "${validationResult.data}" ${exists ? 'exists' : 'does not exist'}.`
    );

    return NextResponse.json({ success: true, exists: exists });
  } catch (error) {
    logger.error('[API] Error checking campaign name existence:', error);
    return NextResponse.json(
      { success: false, error: 'Database error checking campaign name.' },
      { status: 500 }
    );
  }
}
