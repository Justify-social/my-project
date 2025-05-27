/**
 * Example usage of the notification system for common scenarios
 *
 * This file demonstrates how to integrate notifications into your
 * campaign submissions, brand lift workflows, and other key user actions.
 */

import {
  notifyCampaignSubmitted,
  notifyBrandLiftSubmitted,
  notifyBrandLiftReportReady,
  notifySuccess,
  notifyError,
  notifyWarning,
} from '@/lib/notifications';

// ==========================================
// 1. CAMPAIGN SUBMISSION NOTIFICATIONS
// ==========================================

/**
 * Example: After a campaign is successfully submitted
 * Add this to your campaign submission handler
 */
export async function handleCampaignSubmission(
  userId: string,
  campaignData: Record<string, unknown>
) {
  try {
    // Your existing campaign submission logic here
    const submission = await submitCampaignToDatabase(campaignData);

    // Send notification to user
    await notifyCampaignSubmitted({
      userId: userId,
      campaignName: campaignData.name as string,
      campaignId: campaignData.id as string,
      submissionId: submission.id,
    });

    return { success: true, submission };
  } catch (error) {
    // Notify user of error
    await notifyError({
      userId: userId,
      title: 'Campaign Submission Failed',
      message: 'There was an error submitting your campaign. Please try again.',
      actionUrl: '/campaigns/wizard',
    });

    throw error;
  }
}

// ==========================================
// 2. BRAND LIFT NOTIFICATIONS
// ==========================================

/**
 * Example: When a Brand Lift study is submitted
 */
export async function handleBrandLiftSubmission(
  userId: string,
  studyData: Record<string, unknown>
) {
  try {
    const study = await submitBrandLiftStudy(studyData);

    await notifyBrandLiftSubmitted({
      userId: userId,
      studyName: studyData.name as string,
      studyId: study.id,
    });

    return study;
  } catch (error) {
    await notifyError({
      userId: userId,
      title: 'Brand Lift Submission Failed',
      message: 'Your Brand Lift study could not be submitted. Please review and try again.',
      actionUrl: '/brand-lift/survey-design',
    });

    throw error;
  }
}

/**
 * Example: When a Brand Lift report is ready
 * This would typically be called from a background job or webhook
 */
export async function handleBrandLiftReportReady(
  userId: string,
  reportData: Record<string, unknown>
) {
  await notifyBrandLiftReportReady({
    userId: userId,
    studyName: reportData.studyName as string,
    studyId: reportData.studyId as string,
    reportId: reportData.id as string,
  });
}

// ==========================================
// 3. GENERAL SUCCESS/ERROR NOTIFICATIONS
// ==========================================

/**
 * Example: File upload success
 */
export async function notifyFileUploadSuccess(userId: string, fileName: string) {
  await notifySuccess({
    userId: userId,
    title: 'File Uploaded Successfully',
    message: `${fileName} has been uploaded and is ready to use.`,
    actionUrl: '/creative-assets',
  });
}

/**
 * Example: Payment processing
 */
export async function notifyPaymentSuccess(userId: string, amount: number) {
  await notifySuccess({
    userId: userId,
    title: 'Payment Processed',
    message: `Your payment of $${amount} has been processed successfully.`,
    actionUrl: '/account/billing',
  });
}

/**
 * Example: System maintenance warning
 */
export async function notifyMaintenanceWarning(userIds: string[]) {
  const promises = userIds.map(userId =>
    notifyWarning({
      userId: userId,
      title: 'Scheduled Maintenance',
      message:
        'System maintenance is scheduled for tonight from 2-4 AM EST. Some features may be temporarily unavailable.',
      actionUrl: '/help',
    })
  );

  await Promise.all(promises);
}

// ==========================================
// 4. INTEGRATION WITH EXISTING WORKFLOWS
// ==========================================

/**
 * Example: Add to existing API route
 *
 * // In your API route (e.g., /api/campaigns/submit)
 * export async function POST(request: NextRequest) {
 *   try {
 *     const { userId } = getAuth(request);
 *     const body = await request.json();
 *
 *     // Your existing logic
 *     const result = await processCampaign(body);
 *
 *     // Add notification
 *     await notifyCampaignSubmitted({
 *       userId: userId,
 *       campaignName: body.name,
 *       campaignId: result.id,
 *     });
 *
 *     return NextResponse.json({ success: true, result });
 *   } catch (error) {
 *     return NextResponse.json({ error: 'Failed to submit campaign' }, { status: 500 });
 *   }
 * }
 */

/**
 * Example: Client-side usage with the useNotifications hook
 *
 * // In your React component
 * import { useNotifications } from '@/providers/NotificationProvider';
 *
 * export function MyComponent() {
 *   const { showToast } = useNotifications();
 *
 *   const handleAction = async () => {
 *     try {
 *       await performAction();
 *       showToast('success', 'Action completed successfully!');
 *     } catch (error) {
 *       showToast('error', 'Action failed. Please try again.');
 *     }
 *   };
 *
 *   return <button onClick={handleAction}>Perform Action</button>;
 * }
 */

// ==========================================
// 5. MOCK FUNCTIONS (Replace with your actual implementations)
// ==========================================

async function submitCampaignToDatabase(_campaignData: Record<string, unknown>) {
  // Replace with your actual campaign submission logic
  return { id: 'submission-123', status: 'submitted' };
}

async function submitBrandLiftStudy(_studyData: Record<string, unknown>) {
  // Replace with your actual Brand Lift submission logic
  return { id: 'study-456', status: 'submitted' };
}
