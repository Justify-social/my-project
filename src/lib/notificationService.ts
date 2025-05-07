// src/lib/notificationService.ts

// TODO: Replace with actual Resend SDK import if used, e.g., import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: Define more specific types for user and study details needed for emails
interface UserDetails {
  email: string;
  name?: string;
}

interface StudyDetails {
  id: string;
  name: string;
  // Add other relevant details like campaign name, link to the approval page
  approvalPageUrl?: string;
}

interface CommentDetails {
  commentText: string;
  commentAuthorName?: string;
  questionText?: string; // If comment is on a specific question
}

// Placeholder for actual email sending logic using Resend
async function sendEmailWithResend(
  to: string | string[],
  subject: string,
  htmlContent: string,
  fromAddress?: string // e.g., 'BrandLift Platform <notifications@yourdomain.com>'
) {
  const from = fromAddress || 'notifications@brandlift.example.com'; // Fallback from address
  console.log(`==== SENDING EMAIL (MOCK) ====`);
  console.log(`FROM: ${from}`);
  console.log(`TO: ${Array.isArray(to) ? to.join(', ') : to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`HTML BODY:\n${htmlContent}`);
  console.log(`==== END SENDING EMAIL (MOCK) ====`);

  // In a real implementation:
  /*
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set. Skipping actual email send.");
      return { success: false, error: "RESEND_API_KEY not configured." };
    }
    try {
      const { data, error } = await resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        html: htmlContent,
      });
      if (error) {
        console.error("Resend API Error:", error);
        return { success: false, error };
      }
      console.log("Email sent successfully via Resend:", data);
      return { success: true, data };
    } catch (e) {
      console.error("Exception sending email:", e);
      return { success: false, error: e };
    }
    */
  return { success: true, messageId: `mock_message_${Date.now()}` }; // Mock success
}

export class NotificationService {
  // Email for when a survey is first submitted for review
  async sendSurveySubmittedForReviewEmail(
    recipients: UserDetails[], // e.g., designated reviewers, team leads
    study: StudyDetails,
    submitter: UserDetails
  ) {
    const subject = `Brand Lift Study Ready for Review: "${study.name}"`;
    const htmlContent = `
      <p>Hello team,</p>
      <p>The Brand Lift study "<strong>${study.name}</strong>" (ID: ${study.id}) submitted by ${submitter.name || submitter.email} is now ready for your review and approval.</p>
      <p>You can access the approval workflow here: <a href="${study.approvalPageUrl || '#'}">Review Study</a></p>
      <p>Thank you!</p>
    `;
    await sendEmailWithResend(
      recipients.map(r => r.email),
      subject,
      htmlContent
    );
  }

  // Email for when a new comment is added
  async sendNewCommentEmail(
    recipients: UserDetails[], // e.g., study owner, relevant participants in the thread
    study: StudyDetails,
    comment: CommentDetails
  ) {
    const subject = `New Comment on Brand Lift Study: "${study.name}"`;
    let commentContext = comment.questionText ? ` on question: "${comment.questionText}"` : '';
    const htmlContent = `
      <p>Hi there,</p>
      <p>A new comment has been added by ${comment.commentAuthorName || 'A user'} to the Brand Lift study "<strong>${study.name}</strong>"${commentContext}.</p>
      <p>Comment: <em>"${comment.commentText}"</em></p>
      <p>View the discussion: <a href="${study.approvalPageUrl || '#'}">View Study Comments</a></p>
    `;
    await sendEmailWithResend(
      recipients.map(r => r.email),
      subject,
      htmlContent
    );
  }

  // Email when formal approval/sign-off is requested
  async sendApprovalRequestedEmail(
    approvers: UserDetails[], // Designated approvers
    study: StudyDetails,
    requester: UserDetails
  ) {
    const subject = `Approval Requested for Brand Lift Study: "${study.name}"`;
    const htmlContent = `
      <p>Hello,</p>
      <p>${requester.name || requester.email} has requested your formal approval for the Brand Lift study "<strong>${study.name}</strong>".</p>
      <p>Please review and provide your approval/sign-off here: <a href="${study.approvalPageUrl || '#'}">Approve Study</a></p>
    `;
    await sendEmailWithResend(
      approvers.map(r => r.email),
      subject,
      htmlContent
    );
  }

  // Email when a study status changes (e.g., Approved, Changes Requested)
  async sendStudyStatusChangeEmail(
    studyOwner: UserDetails, // Typically the person who created or is managing the study
    study: StudyDetails,
    newStatus: string, // e.g., "Approved", "Changes Requested"
    changedBy?: UserDetails // Optional: who made the status change
  ) {
    const subject = `Brand Lift Study Update: "${study.name}" is now ${newStatus}`;
    const changedByInfo = changedBy ? ` by ${changedBy.name || changedBy.email}` : '';
    const htmlContent = `
      <p>Hi ${studyOwner.name || 'there'},</p>
      <p>The status of your Brand Lift study "<strong>${study.name}</strong>" has been updated to <strong>${newStatus}</strong>${changedByInfo}.</p>
      <p>You can view the study here: <a href="${study.approvalPageUrl || '#'}">View Study</a></p>
      ${newStatus === 'CHANGES_REQUESTED' ? '<p>Please review the comments and make the necessary adjustments.</p>' : ''}
    `;
    await sendEmailWithResend(studyOwner.email, subject, htmlContent);
  }
}

// Export a singleton instance if preferred, or allow instantiation
export const notificationService = new NotificationService();
