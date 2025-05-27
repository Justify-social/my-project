import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { bulkCreateNotifications } from '@/lib/notifications';
import { z } from 'zod';

// Define the request schema
const BulkNotificationSchema = z.object({
  recipients: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['user', 'organization']),
    })
  ),
  type: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  actionUrl: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
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
      logger.warn('Non-admin attempted to create bulk notifications', {
        clerkUserId,
        metadataRole: sessionClaims?.['metadata.role'],
      });
      throw new ForbiddenError('Admin access required for bulk notifications.');
    }

    const body = await request.json();
    const validatedData = BulkNotificationSchema.parse(body);

    const { recipients, type, title, message, actionUrl, expiresAt } = validatedData;

    // Collect all user IDs from recipients
    const userIds: string[] = [];
    const client = await clerkClient();

    for (const recipient of recipients) {
      if (recipient.type === 'user') {
        userIds.push(recipient.id);
      } else if (recipient.type === 'organization') {
        try {
          // Fetch organization members
          const organizationMembershipList =
            await client.organizations.getOrganizationMembershipList({
              organizationId: recipient.id,
            });

          const orgUserIds = organizationMembershipList.data
            .map(membership => membership.publicUserData?.userId)
            .filter(Boolean) as string[];

          userIds.push(...orgUserIds);
        } catch (error) {
          logger.error(`Failed to fetch users for organization ${recipient.id}:`, {
            error: error instanceof Error ? error.message : String(error),
            organizationId: recipient.id,
          });
          // Continue with other recipients
        }
      }
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];

    if (uniqueUserIds.length === 0) {
      throw new BadRequestError('No valid users found in the selected recipients.');
    }

    // Create notifications for all users
    const result = await bulkCreateNotifications({
      userIds: uniqueUserIds,
      type: type as
        | 'CAMPAIGN_SUBMITTED'
        | 'BRAND_LIFT_SUBMITTED'
        | 'BRAND_LIFT_REPORT_READY'
        | 'SUCCESS'
        | 'ERROR'
        | 'WARNING'
        | 'INFO'
        | 'SYSTEM',
      title,
      message,
      actionUrl: actionUrl || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    logger.info(`Bulk notifications created successfully`, {
      recipientCount: recipients.length,
      userCount: uniqueUserIds.length,
      notificationCount: result.count,
      userId: clerkUserId,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} notifications created for ${uniqueUserIds.length} users`,
      recipientBreakdown: {
        totalRecipients: recipients.length,
        totalUsers: uniqueUserIds.length,
        notificationsCreated: result.count,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, request);
  }
}
