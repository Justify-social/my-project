import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/bulk-dismiss - Dismiss multiple notifications
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(request);

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Map Clerk user ID to internal database User ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: 'Invalid notification IDs provided' }, { status: 400 });
    }

    // Update multiple notifications as dismissed
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id,
      },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
      },
    });

    return NextResponse.json({
      updated: result.count,
      message: `${result.count} notifications dismissed`,
    });
  } catch (error) {
    console.error('Error dismissing notifications:', error);
    return NextResponse.json({ error: 'Failed to dismiss notifications' }, { status: 500 });
  }
}
