import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    // Check if user has admin permissions
    if (
      sessionClaims?.['metadata.role'] !== 'super_admin' &&
      sessionClaims?.['metadata.role'] !== 'admin'
    ) {
      throw new ForbiddenError('Admin access required for email activity.');
    }

    // TODO: Implement email event tracking system with Resend webhooks
    // For now, return empty array until email webhook system is implemented
    const activities: Array<{
      id: string;
      emailId: string;
      to: string;
      from: string;
      subject: string;
      status: string;
      timestamp: string;
      metadata: Record<string, unknown>;
    }> = [];

    logger.info('Email activity fetched', {
      userId: clerkUserId,
      activityCount: activities.length,
    });

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
