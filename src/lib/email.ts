import { Resend } from 'resend';
import { logger } from '../utils/logger';

// Initialize Resend with API key
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  logger.warn(
    '[Resend Setup] RESEND_API_KEY is not set in environment variables. Email functionality will be disabled.'
  );
}

// Interface for team invitation email
interface TeamInvitationEmailProps {
  email: string;
  inviterName: string;
  companyName: string;
  role: string;
  invitationLink: string;
  expiresAt: Date;
}

/**
 * Send a team invitation email to a new user using Resend
 */
export async function sendTeamInvitationEmail({
  email,
  inviterName,
  companyName,
  role,
  invitationLink,
  expiresAt,
}: TeamInvitationEmailProps): Promise<boolean> {
  if (!resend) {
    // console.log('Resend not initialized. Would send invitation email to', email);
    return true; // Reverted to boolean
  }

  try {
    const formattedExpiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedRole = role.charAt(0) + role.slice(1).toLowerCase();

    // Define email content (HTML can be reused, adjust styling if needed)
    const subject = `You\'ve been invited to join ${companyName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 1rem;">
        <h2 style="color: var(--interactive-color);">You\'ve been invited to join ${companyName}</h2>
        <p>${inviterName} has invited you to join ${companyName} as a <strong>${formattedRole}</strong>.</p>
        <div style="margin: 1rem 0;">
          <a href="${invitationLink}" style="background-color: var(--interactive-color); color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: var(--secondary-color); font-size: 0.875rem;">This invitation expires on ${formattedExpiryDate}.</p>
      </div>
    `;

    // IMPORTANT: Replace 'onboarding@resend.dev' with your verified sending domain/address
    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      // console.error('Error sending invitation email via Resend:', error);
      logger.error(`Failed to send invitation email to ${email}:`, { error: error.message }); // Keep logger.error
      return false; // Reverted to boolean
    }

    // console.log(`Invitation email sent successfully to ${email}. Message ID: ${data?.id}`);
    logger.info(`Invitation email sent successfully to ${email}`, { messageId: data?.id }); // Keep logger.info
    return true; // Reverted to boolean
  } catch (error) {
    // console.error('Unexpected error in sendTeamInvitationEmail:', error);
    logger.error('Unexpected error in sendTeamInvitationEmail:', {
      error: (error as Error).message,
    }); // Keep logger.error
    return false; // Reverted to boolean
  }
}

/**
 * Generate a secure invitation token
 */
export function generateInvitationToken(): string {
  return Array(24)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
}

// Interface for welcome email
interface WelcomeEmailProps {
  email: string;
  name: string | null; // User's name, might be null
}

/**
 * Send a welcome email to a new user using Resend
 */
export async function sendWelcomeEmail({ email, name }: WelcomeEmailProps): Promise<boolean> {
  if (!resend) {
    // console.log('Resend not initialized. Would send welcome email to', email);
    return true; // Reverted to boolean
  }

  const recipientName = name || 'New User';

  try {
    const subject = 'Welcome to Justify.Social!';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 1rem; border: 1px solid var(--divider-color); border-radius: 8px;">
        <h1 style="color: var(--primary-color); text-align: center;">Welcome to Justify.Social, ${recipientName}!</h1>
        <p style="color: var(--secondary-color); font-size: 1rem; line-height: 1.5;">
          We're thrilled to have you on board. Justify.Social helps you manage your influencer marketing campaigns with ease and precision.
        </p>
        <p style="color: var(--secondary-color); font-size: 1rem; line-height: 1.5;">
          Here are a few things you can do to get started:
        </p>
        <ul style="color: var(--secondary-color); list-style-type: disc; padding-left: 20px;">
          <li>Explore the Influencer Marketplace to discover new talent.</li>
          <li>Create your first campaign using our intuitive Campaign Wizard.</li>
          <li>Set up your branding in the settings.</li>
        </ul>
        <div style="text-align: center; margin: 2rem 0;">
          <a href="https://justify.social/dashboard" style="background-color: var(--interactive-color); color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Your Dashboard
          </a>
        </div>
        <p style="color: var(--secondary-color); font-size: 0.875rem; text-align: center;">
          If you have any questions, don't hesitate to reach out to our support team.
        </p>
        <p style="color: var(--accent-color); font-size: 0.875rem; text-align: center; margin-top: 2rem;">
          Happy campaigning!<br/>The Justify.Social Team
        </p>
      </div>
    `;

    // IMPORTANT: Replace 'welcome@justify.social' with your actual verified sending domain/address for welcome emails
    // It's good practice to use a different 'from' for different email types if possible.
    const fromAddress = process.env.WELCOME_EMAIL_FROM || 'welcome@justify.social';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      // console.error('Error sending welcome email via Resend:', error);
      logger.error(`Failed to send welcome email to ${email}:`, { error: error.message }); // Keep logger.error
      return false; // Reverted to boolean
    }

    // console.log(`Welcome email sent successfully to ${email}. Message ID: ${data?.id}`);
    logger.info(`Welcome email sent successfully to ${email}`, { messageId: data?.id }); // Keep logger.info
    return true; // Reverted to boolean
  } catch (error) {
    // console.error('Unexpected error in sendWelcomeEmail:', error);
    logger.error('Unexpected error in sendWelcomeEmail:', { error: (error as Error).message }); // Keep logger.error
    return false; // Reverted to boolean
  }
}
