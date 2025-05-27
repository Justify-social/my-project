import { prisma } from '@/lib/prisma';

type NotificationType =
  | 'CAMPAIGN_SUBMITTED'
  | 'BRAND_LIFT_SUBMITTED'
  | 'BRAND_LIFT_REPORT_READY'
  | 'SYSTEM'
  | 'SUCCESS'
  | 'ERROR'
  | 'WARNING'
  | 'INFO';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  expiresAt?: Date;
}

/**
 * Core function to create a notification
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        metadata: params.metadata || null,
        actionUrl: params.actionUrl || null,
        expiresAt: params.expiresAt || null,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notification for campaign submission
 */
export async function notifyCampaignSubmitted(params: {
  userId: string;
  campaignName: string;
  campaignId?: string;
  submissionId?: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'CAMPAIGN_SUBMITTED',
    title: 'Campaign Submitted Successfully',
    message: `Your campaign "${params.campaignName}" has been submitted and is being reviewed by our team.`,
    metadata: {
      campaignId: params.campaignId,
      submissionId: params.submissionId,
    },
    actionUrl: params.submissionId
      ? `/campaigns/submissions/${params.submissionId}`
      : params.campaignId
        ? `/campaigns/${params.campaignId}`
        : '/campaigns',
  });
}

/**
 * Create notification for Brand Lift study submission
 */
export async function notifyBrandLiftSubmitted(params: {
  userId: string;
  studyName: string;
  studyId: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'BRAND_LIFT_SUBMITTED',
    title: 'Brand Lift Study Submitted',
    message: `Your Brand Lift study "${params.studyName}" has been submitted for approval.`,
    metadata: {
      studyId: params.studyId,
    },
    actionUrl: `/brand-lift/studies/${params.studyId}`,
  });
}

/**
 * Create notification for Brand Lift report ready
 */
export async function notifyBrandLiftReportReady(params: {
  userId: string;
  studyName: string;
  studyId: string;
  reportId?: string;
}) {
  return createNotification({
    userId: params.userId,
    type: 'BRAND_LIFT_REPORT_READY',
    title: 'Brand Lift Report Ready',
    message: `Your Brand Lift report for "${params.studyName}" is now available for download.`,
    metadata: {
      studyId: params.studyId,
      reportId: params.reportId,
    },
    actionUrl: params.reportId
      ? `/brand-lift/reports/${params.reportId}`
      : `/brand-lift/studies/${params.studyId}`,
  });
}

/**
 * Create success notification
 */
export async function notifySuccess(params: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: 'SUCCESS',
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    metadata: params.metadata,
  });
}

/**
 * Create error notification
 */
export async function notifyError(params: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: 'ERROR',
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    metadata: params.metadata,
  });
}

/**
 * Create warning notification
 */
export async function notifyWarning(params: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: 'WARNING',
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    metadata: params.metadata,
  });
}

/**
 * Create info notification
 */
export async function notifyInfo(params: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: 'INFO',
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    metadata: params.metadata,
  });
}

/**
 * Create system notification (for admin purposes)
 */
export async function notifySystem(params: {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}) {
  return createNotification({
    userId: params.userId,
    type: 'SYSTEM',
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    metadata: params.metadata,
    expiresAt: params.expiresAt,
  });
}

/**
 * Bulk create notifications for multiple users
 */
export async function bulkCreateNotifications(params: {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  expiresAt?: Date;
}) {
  const notifications = params.userIds.map(userId => ({
    userId,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata || null,
    actionUrl: params.actionUrl || null,
    expiresAt: params.expiresAt || null,
  }));

  try {
    const result = await prisma.notification.createMany({
      data: notifications,
    });

    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}
