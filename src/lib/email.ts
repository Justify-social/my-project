import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will not work.');
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
 * Send a team invitation email to a new user
 */
export async function sendTeamInvitationEmail({
  email,
  inviterName,
  companyName,
  role,
  invitationLink,
  expiresAt,
}: TeamInvitationEmailProps): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Development mode: Would send invitation email to', email);
      return true; // Skip in development if no API key
    }

    const formattedExpiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format the role for display
    const formattedRole = role.charAt(0) + role.slice(1).toLowerCase();

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'notifications@yourdomain.com', // Set your verified sender in SendGrid
      subject: `You've been invited to join ${companyName}`,
      text: `${inviterName} has invited you to join ${companyName} as a ${formattedRole}. Click the link below to accept the invitation:\n\n${invitationLink}\n\nThis invitation expires on ${formattedExpiryDate}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; p-4;">
          <h2 style="color: var(--interactive-color);">You've been invited to join ${companyName}</h2>
          <p>${inviterName} has invited you to join ${companyName} as a <strong>${formattedRole}</strong>.</p>
          <div style="m-4 0;">
            <a href="${invitationLink}" style="background-color: var(--interactive-color); color: white; p-4 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: var(--secondary-color); text-base;">This invitation expires on ${formattedExpiryDate}.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`Invitation email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
}

/**
 * Generate a secure invitation token
 */
export function generateInvitationToken(): string {
  // Generate a random string of 24 characters
  return Array(24)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
}
