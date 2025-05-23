// src/lib/notificationService.ts

// import { Resend } from 'resend'; // Actual import for Resend
import { logger } from './logger'; // Assuming shared logger

// const resend = new Resend(process.env.RESEND_API_KEY);

// Placeholder for actual Resend client and email sending logic
const mockResendClient = {
  emails: {
    send: async (payload: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
    }) => {
      logger.info('Mock Resend: Email send called', { resendPayload: payload });
      if (!process.env.RESEND_API_KEY) {
        logger.warn('Mock Resend: RESEND_API_KEY not set. Email not actually sent.', {});
        return { data: { id: `mock_email_id_${Date.now()}` }, error: null };
      }
      if (
        Array.isArray(payload.to)
          ? payload.to.includes('test@error.com')
          : payload.to === 'test@error.com'
      ) {
        logger.error('Mock Resend: Simulated error sending email.', {});
        return { data: null, error: { message: 'Simulated send failure', name: 'EmailSendError' } };
      }
      return { data: { id: `mock_email_id_${Date.now()}` }, error: null };
    },
  },
};

const APP_NAME = 'Justify Platform'; // Or your application's name
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || 'noreply@justifyplatform.com';

// TODO: Define more specific types for user and study details needed for emails
// Export UserDetails to be used by other modules
export interface UserDetails {
  email: string;
  name?: string;
  id?: string; // Optional ID if needed by consuming services
}

export interface StudyDetails {
  id: string;
  name: string;
  approvalPageUrl?: string;
}

export interface CommentDetails {
  commentText: string;
  commentAuthorName?: string;
  questionText?: string; // If comment is on a specific question
}

// Adding ApprovalWorkflowStatus type, assuming it might be used by sendStudyStatusChangeEmail
// Ideally, this would be imported from a shared types file (e.g., src/types/brand-lift.ts or a status enum file)
export type ApprovalWorkflowStatus =
  | 'OPEN'
  | 'RESOLVED'
  | 'NEED_ACTION'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SIGNED_OFF'
  | 'DRAFT'
  | 'COLLECTING'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'DEFAULT';

// Simplified conceptual service
export class NotificationService {
  private client: typeof mockResendClient; // Replace with `Resend` type in actual implementation

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      logger.warn(
        'RESEND_API_KEY is not set. NotificationService will use mock email sending.',
        {}
      );
    }
    this.client = mockResendClient; // Use `resend` in actual implementation
  }

  private async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.client.emails.send({
        from: `${APP_NAME} <${DEFAULT_FROM_EMAIL}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        logger.error('Failed to send email via Resend', { error, to, subject });
        return false;
      }
      logger.info('Email sent successfully via Resend', { emailId: data?.id, to, subject });
      return true;
    } catch (e) {
      logger.error('Exception during email sending', {
        error: (e as Error).message, // Cast to Error
        to,
        subject,
        stack: (e as Error).stack, // Cast to Error
      });
      return false;
    }
  }

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
    await this.sendEmail(
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
    const commentContext = comment.questionText ? ` on question: "${comment.questionText}"` : '';
    const htmlContent = `
      <p>Hi there,</p>
      <p>A new comment has been added by ${comment.commentAuthorName || 'A user'} to the Brand Lift study "<strong>${study.name}</strong>"${commentContext}.</p>
      <p>Comment: <em>"${comment.commentText}"</em></p>
      <p>View the discussion: <a href="${study.approvalPageUrl || '#'}">View Study Comments</a></p>
    `;
    await this.sendEmail(
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
    await this.sendEmail(
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
    await this.sendEmail(studyOwner.email, subject, htmlContent);
  }
}

// Export an instance for easy use elsewhere, or use dependency injection
// export const notificationService = new NotificationService();
