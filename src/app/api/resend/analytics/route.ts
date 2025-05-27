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
      throw new ForbiddenError('Admin access required for email analytics.');
    }

    // Calculate real analytics from stored Resend webhook events
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    const emailEvents = await prisma.stripeEvent.findMany({
      where: {
        type: {
          startsWith: 'email.',
        },
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        type: true,
        error: true, // Using error field since it's the only JSON field
      },
    });

    // Calculate statistics
    const stats = {
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
    };

    // Track unique emails by ID to avoid counting duplicates
    const emailsByStatus = new Map<string, Set<string>>();

    (emailEvents as Array<{ type: string; error: Record<string, unknown> | null }>).forEach(
      event => {
        const eventData = event.error;
        const emailId = (eventData?.emailId as string) || 'unknown';
        const status = event.type.replace('email.', ''); // Remove 'email.' prefix

        if (!emailsByStatus.has(emailId)) {
          emailsByStatus.set(emailId, new Set());
        }
        emailsByStatus.get(emailId)!.add(status);
      }
    );

    // Count unique emails by status
    emailsByStatus.forEach(statuses => {
      if (statuses.has('sent')) stats.totalSent++;
      if (statuses.has('delivered')) stats.delivered++;
      if (statuses.has('opened')) stats.opened++;
      if (statuses.has('clicked')) stats.clicked++;
      if (statuses.has('bounced')) stats.bounced++;
      if (statuses.has('complained')) stats.complained++;
    });

    const analytics = {
      ...stats,
      deliveryRate: stats.totalSent > 0 ? Math.round((stats.delivered / stats.totalSent) * 100) : 0,
      openRate: stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0,
      clickRate: stats.opened > 0 ? Math.round((stats.clicked / stats.opened) * 100) : 0,
      bounceRate: stats.totalSent > 0 ? Math.round((stats.bounced / stats.totalSent) * 100) : 0,
      complaintRate:
        stats.totalSent > 0 ? Math.round((stats.complained / stats.totalSent) * 100) : 0,
    };

    logger.info('Email analytics fetched', {
      userId: clerkUserId,
      analytics: {
        totalSent: analytics.totalSent,
        deliveryRate: analytics.deliveryRate,
        openRate: analytics.openRate,
        clickRate: analytics.clickRate,
      },
    });

    return NextResponse.json(analytics);
  } catch (error) {
    return handleApiError(error, request);
  }
}
