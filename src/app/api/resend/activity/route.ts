import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

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

    // Get real email activity from stored Resend webhook events
    const emailEvents = await prisma.stripeEvent.findMany({
      where: {
        type: {
          startsWith: 'email.',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to recent 100 events
      select: {
        id: true,
        type: true,
        error: true, // Using error field since it's the only JSON field
        createdAt: true,
      },
    });

    const activities = (
      emailEvents as Array<{
        id: string;
        type: string;
        error: Record<string, unknown> | null;
        createdAt: Date;
      }>
    ).map(event => {
      const eventData = event.error;
      const emailId = (eventData?.emailId as string) || 'unknown';
      const to = (eventData?.to as string) || 'unknown';
      const status = event.type.replace('email.', ''); // Remove 'email.' prefix

      return {
        id: event.id,
        emailId,
        to,
        from: 'hello@justify.social', // Default from address
        subject: 'Email Activity', // Could be enhanced to track actual subjects
        status,
        timestamp: event.createdAt.toISOString(),
        metadata: eventData,
      };
    });

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
