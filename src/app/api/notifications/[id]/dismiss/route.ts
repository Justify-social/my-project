import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/[id]/dismiss - Dismiss notification
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;

    // Verify the notification belongs to the user and update it
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: 'DISMISSED',
        dismissedAt: new Date(),
      },
    });

    if (notification.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Notification dismissed',
      id: notificationId,
    });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    return NextResponse.json({ error: 'Failed to dismiss notification' }, { status: 500 });
  }
}
