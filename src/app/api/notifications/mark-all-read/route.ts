import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/mark-all-read - Mark all user notifications as read
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

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        status: 'UNREAD',
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      updated: result.count,
      message: `${result.count} notifications marked as read`,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
