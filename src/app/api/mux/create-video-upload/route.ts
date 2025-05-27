import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { muxService } from '@/lib/muxService';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma'; // Uncommented
import { CreativeAssetType, CreativeAsset } from '@prisma/client'; // Import CreativeAsset type

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      logger.warn('[API /mux/create-video-upload] Unauthenticated access attempt.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find your internal user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { id: true }, // Only select the internal UUID id
    });

    if (!user) {
      logger.error(
        `[API /mux/create-video-upload] User not found in DB for clerkId: ${auth.userId}`
      );
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const internalUserId = user.id; // This is the User.id (UUID)

    const body = await req.json();
    const {
      fileName, // e.g., "my_cool_video.mp4"
      fileType, // e.g., "video/mp4" -> we'll map this to CreativeAssetType.video
      campaignWizardId, // NEW: ID (UUID string) from CampaignWizard
      corsOrigin, // Optional: for muxService
      description, // Optional: for CreativeAsset
    } = body;

    // Basic Input Validation
    if (!fileName || !campaignWizardId) {
      logger.warn(
        '[API /mux/create-video-upload] Missing fileName or campaignWizardId in request body.'
      );
      return NextResponse.json(
        { error: 'Missing required fields: fileName, campaignWizardId' },
        { status: 400 }
      );
    }

    logger.info(`[API /mux/create-video-upload] Received request for user: ${auth.userId}`, {
      fileName,
      fileType,
      campaignWizardId,
      corsOrigin,
    });

    // Use provided CORS origin or fallback to dynamically detected origin
    let effectiveCorsOrigin = corsOrigin;

    if (!effectiveCorsOrigin) {
      if (process.env.NODE_ENV === 'development') {
        // Dynamically detect the origin from the request
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        effectiveCorsOrigin = `${protocol}://${host}`;
      } else {
        effectiveCorsOrigin = '*';
      }
    }

    logger.info(`[API /mux/create-video-upload] Using CORS origin: ${effectiveCorsOrigin}`);

    const muxUploadData = await muxService.createDirectUploadUrl(effectiveCorsOrigin);

    // Create CreativeAsset record in the database
    const initialProcessingStatus = 'AWAITING_UPLOAD'; // Or PENDING_MUX_UPLOAD

    const creativeAsset: CreativeAsset = await prisma.creativeAsset.create({
      data: {
        name: fileName,
        type: CreativeAssetType.video, // Ensure this matches your enum value
        campaignWizardId: campaignWizardId as string, // NEW
        muxUploadId: muxUploadData.muxUploadId, // ***** STORE THE MUX UPLOAD ID *****
        muxAssetId: muxUploadData.muxAssetId, // This is Mux's asset ID if returned by createDirectUploadUrl (can be null initially)
        muxProcessingStatus: initialProcessingStatus,
        description: description || null,
        userId: internalUserId, // Link to the internal User ID (UUID)
        // url: null, // Explicitly set to null or let Prisma handle default if schema changes
        // fileSize, dimensions, format, duration will be updated later via webhook
      },
    });

    logger.info(
      `[API /mux/create-video-upload] Successfully created Mux upload URL and CreativeAsset (ID: ${creativeAsset.id}) for user: ${auth.userId}`,
      { muxUploadData }
    );

    // Return the Mux upload URL and the ID of the CreativeAsset created (or Mux asset ID)
    return NextResponse.json({
      uploadUrl: muxUploadData.uploadUrl,
      muxUploadId: muxUploadData.muxUploadId,
      muxAssetId: muxUploadData.muxAssetId,
      internalAssetId: creativeAsset.id, // Our database ID for the CreativeAsset
      userId: internalUserId, // Return the internalUserId used for creation
    });
  } catch (error: unknown) {
    logger.error('[API /mux/create-video-upload] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Mux client not initialized')) {
      return NextResponse.json({ error: 'Mux service not available' }, { status: 503 });
    }
    if (message.startsWith('Mux API Error:')) {
      return NextResponse.json({ error: message }, { status: 502 }); // Bad Gateway from upstream
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
