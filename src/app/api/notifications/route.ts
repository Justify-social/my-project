import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Map Clerk user ID to internal database User ID
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    // Fallback: Auto-create user if they don't exist (Clerk webhook might not have triggered)
    if (!user) {
      console.log(`[Notifications API] User not found, auto-creating for clerkId: ${clerkUserId}`);

      try {
        // Create user with minimal required data
        user = await prisma.user.create({
          data: {
            clerkId: clerkUserId,
            email: `clerk-user-${clerkUserId}@temp.local`, // Temporary email, will be updated by webhook
            name: null,
          },
          select: { id: true },
        });

        console.log(`[Notifications API] Auto-created user for clerkId: ${clerkUserId}`);
      } catch (createError) {
        console.error(`[Notifications API] Failed to auto-create user:`, createError);
        return NextResponse.json({ error: 'User setup failed' }, { status: 500 });
      }
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter conditions using internal User ID
    const where: Record<string, unknown> = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Only show non-expired notifications
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.notification.count({ where });

    return NextResponse.json({
      notifications,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Map Clerk user ID to internal database User ID
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    // Fallback: Auto-create user if they don't exist (Clerk webhook might not have triggered)
    if (!user) {
      console.log(
        `[Notifications API POST] User not found, auto-creating for clerkId: ${clerkUserId}`
      );

      try {
        // Create user with minimal required data
        user = await prisma.user.create({
          data: {
            clerkId: clerkUserId,
            email: `clerk-user-${clerkUserId}@temp.local`, // Temporary email, will be updated by webhook
            name: null,
          },
          select: { id: true },
        });

        console.log(`[Notifications API POST] Auto-created user for clerkId: ${clerkUserId}`);
      } catch (createError) {
        console.error(`[Notifications API POST] Failed to auto-create user:`, createError);
        return NextResponse.json({ error: 'User setup failed' }, { status: 500 });
      }
    }

    const body = await request.json();
    const { type, title, message, metadata, actionUrl, expiresAt } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = [
      'CAMPAIGN_SUBMITTED',
      'BRAND_LIFT_SUBMITTED',
      'BRAND_LIFT_REPORT_READY',
      'SYSTEM',
      'SUCCESS',
      'ERROR',
      'WARNING',
      'INFO',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        metadata: metadata || null,
        actionUrl: actionUrl || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// DELETE /api/notifications - Bulk delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Map Clerk user ID to internal database User ID
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    // Fallback: Auto-create user if they don't exist (Clerk webhook might not have triggered)
    if (!user) {
      console.log(
        `[Notifications API DELETE] User not found, auto-creating for clerkId: ${clerkUserId}`
      );

      try {
        // Create user with minimal required data
        user = await prisma.user.create({
          data: {
            clerkId: clerkUserId,
            email: `clerk-user-${clerkUserId}@temp.local`, // Temporary email, will be updated by webhook
            name: null,
          },
          select: { id: true },
        });

        console.log(`[Notifications API DELETE] Auto-created user for clerkId: ${clerkUserId}`);
      } catch (createError) {
        console.error(`[Notifications API DELETE] Failed to auto-create user:`, createError);
        return NextResponse.json({ error: 'User setup failed' }, { status: 500 });
      }
    }

    const { searchParams } = new URL(request.url);
    const notificationIds = searchParams.get('ids')?.split(',') || [];

    if (notificationIds.length === 0) {
      return NextResponse.json({ error: 'No notification IDs provided' }, { status: 400 });
    }

    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId: user.id, // Ensure user can only delete their own notifications
      },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `${result.count} notifications deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
