import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // Use default import
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server'; // Import auth

// Optional: Add dynamic export if needed, though GET requests are often dynamic by default
// export const dynamic = 'force-dynamic';

const nameSchema = z.string().min(1, { message: 'Campaign name cannot be empty.' });

export async function GET(request: NextRequest) {
  // 1. Authenticate the user
  const authResult = await auth(); // Await auth()
  const { userId: clerkUserId } = authResult; // Destructure from awaited result
  if (!clerkUserId) {
    // Return unauthorized if no user is found - name check requires auth
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Find Internal User ID
  let internalUser;
  try {
    internalUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
  } catch (dbError) {
    logger.error('[API Check Name] Error fetching internal user ID:', dbError);
    return NextResponse.json(
      { success: false, error: 'Server error verifying user.' },
      { status: 500 }
    );
  }

  if (!internalUser || !internalUser.id) {
    logger.warn(`[API Check Name] No internal user found for clerkId: ${clerkUserId}`);
    // Consider if this should be 404 or potentially a different error if user must exist
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }
  const internalUserId = internalUser.id;

  // 3. Validate the name parameter
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const excludeId = searchParams.get('excludeId'); // Get optional excludeId

  logger.info(
    `[API Check Name] Checking for name: "${name}" for user: ${internalUserId}${excludeId ? ', excluding ID: ' + excludeId : ''}`
  );

  const validationResult = nameSchema.safeParse(name);
  if (!validationResult.success) {
    logger.warn('[API Check Name] Invalid campaign name:', validationResult.error.flatten());
    return NextResponse.json(
      { success: false, error: 'Invalid campaign name provided.' },
      { status: 400 }
    );
  }

  // 4. Perform the unique check scoped to the user
  try {
    const whereClause: any = {
      userId: internalUserId, // Filter by the correct internal user ID
      name: {
        equals: validationResult.data,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const count = await db.campaignWizard.count({
      where: whereClause,
    });

    const exists = count > 0;
    logger.info(
      `[API Check Name] Name "${validationResult.data}" ${exists ? 'exists' : 'does not exist'} for user ${internalUserId}.`
    );

    return NextResponse.json({ success: true, exists: exists });
  } catch (error) {
    logger.error('[API Check Name] Error during database check:', error);
    return NextResponse.json(
      { success: false, error: 'Database error checking campaign name.' },
      { status: 500 }
    );
  }
}
