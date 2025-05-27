import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
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

    const params = await paramsPromise;
    const notificationId = params.id;

    // Verify the notification belongs to the user and update it
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    if (notification.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Notification marked as read',
      id: notificationId,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}
