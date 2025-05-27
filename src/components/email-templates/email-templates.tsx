/**
 * @file Email Templates - Single Source of Truth (SSOT)
 * @description All email templates for Resend using React Email components
 * @category email
 * @status active
 */

import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Heading,
  Hr,
  Section,
  Preview,
} from '@react-email/components';

// SSOT: Justify Brand Colors & Styles
const BRAND_STYLES = {
  colors: {
    primary: '#333333', // Jet
    secondary: '#4A5568', // Payne's Grey
    accent: '#00BFFF', // Deep Sky Blue
    background: '#FFFFFF', // White
    text: '#333333', // Jet
    muted: '#6B7280', // Gray
  },
  fonts: {
    family: "'Inter', 'Arial', sans-serif",
  },
} as const;

const containerStyle = {
  fontFamily: BRAND_STYLES.fonts.family,
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  backgroundColor: BRAND_STYLES.colors.background,
  color: BRAND_STYLES.colors.text,
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: '600',
  color: BRAND_STYLES.colors.primary,
  marginBottom: '20px',
  lineHeight: '1.3',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: BRAND_STYLES.colors.text,
  marginBottom: '16px',
};

const buttonStyle = {
  backgroundColor: BRAND_STYLES.colors.accent,
  color: BRAND_STYLES.colors.background,
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
};

const footerStyle = {
  fontSize: '14px',
  color: BRAND_STYLES.colors.muted,
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: `1px solid #E5E7EB`,
};

// SSOT: Email Template Interface
export interface EmailTemplateProps {
  subject: string;
  content: string;
  recipientName?: string;
  actionUrl?: string;
  actionText?: string;
  // Template-specific props
  companyName?: string;
  inviterName?: string;
  role?: string;
  studyName?: string;
  campaignName?: string;
  expiresAt?: string;
  [key: string]: string | undefined;
}

// SSOT: Base Email Template
export function BaseEmailTemplate({
  subject,
  content,
  recipientName,
  actionUrl,
  actionText = 'Get Started',
}: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: '#f6f9fc' }}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>{subject}</Heading>

          {recipientName && <Text style={textStyle}>Hi {recipientName},</Text>}

          <Text style={textStyle}>{content}</Text>

          {actionUrl && (
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button href={actionUrl} style={buttonStyle}>
                {actionText}
              </Button>
            </Section>
          )}

          <Hr style={{ borderColor: '#E5E7EB', margin: '32px 0' }} />

          <Text style={footerStyle}>
            Best regards,
            <br />
            The Justify.Social Team
          </Text>

          <Text style={{ ...footerStyle, fontSize: '12px', marginTop: '16px' }}>
            This email was sent from Justify.Social. If you have any questions, please contact us at
            hello@justify.social
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// SSOT: Welcome Email Template
export function WelcomeEmailTemplate({ recipientName }: EmailTemplateProps) {
  return (
    <BaseEmailTemplate
      subject="Welcome to Justify.Social!"
      content="We're excited to have you on board. Start exploring our platform to manage your influencer marketing campaigns effectively. Our team is here to help you succeed with data-driven influencer partnerships."
      recipientName={recipientName}
      actionUrl="https://justify.social/dashboard"
      actionText="Explore Dashboard"
    />
  );
}

// SSOT: Team Invitation Template
export function InvitationEmailTemplate({
  recipientName,
  inviterName,
  companyName,
  role,
  actionUrl,
  expiresAt,
}: EmailTemplateProps) {
  return (
    <BaseEmailTemplate
      subject={`You've been invited to join ${companyName || 'our team'}`}
      content={`${inviterName || 'Someone'} has invited you to join ${companyName || 'their organization'} on Justify.Social as a ${role || 'team member'}. Accept this invitation to start collaborating on influencer marketing campaigns.${expiresAt ? ` This invitation expires on ${expiresAt}.` : ''}`}
      recipientName={recipientName}
      actionUrl={actionUrl}
      actionText="Accept Invitation"
    />
  );
}

// SSOT: Notification Template
export function NotificationEmailTemplate({
  subject,
  content,
  recipientName,
  actionUrl,
  actionText = 'View Details',
}: EmailTemplateProps) {
  return (
    <BaseEmailTemplate
      subject={subject}
      content={content}
      recipientName={recipientName}
      actionUrl={actionUrl}
      actionText={actionText}
    />
  );
}

// SSOT: Brand Lift Report Template
export function BrandLiftReportEmailTemplate({
  recipientName,
  studyName,
  actionUrl,
}: EmailTemplateProps) {
  return (
    <BaseEmailTemplate
      subject="Your Brand Lift Report is Ready"
      content={`We're excited to share the results of your Brand Lift study "${studyName || 'your study'}". The report contains valuable insights about your campaign's impact on brand perception and consumer behavior. Download your comprehensive report to see the measurable impact of your influencer marketing efforts.`}
      recipientName={recipientName}
      actionUrl={actionUrl}
      actionText="Download Report"
    />
  );
}

// SSOT: Campaign Submitted Template
export function CampaignSubmittedEmailTemplate({
  recipientName,
  campaignName,
  actionUrl,
}: EmailTemplateProps) {
  return (
    <BaseEmailTemplate
      subject={`Campaign "${campaignName || 'Your Campaign'}" Submitted Successfully`}
      content={`Your campaign "${campaignName || 'has'}" has been submitted and is now being reviewed by our team. We'll review your campaign within 24-48 hours and notify you once it's approved. Track your campaign status anytime in your dashboard.`}
      recipientName={recipientName}
      actionUrl={actionUrl}
      actionText="View Campaign"
    />
  );
}

// SSOT: Template Registry (Single Source)
export const EMAIL_TEMPLATES = {
  welcome: WelcomeEmailTemplate,
  invitation: InvitationEmailTemplate,
  notification: NotificationEmailTemplate,
  'brand-lift-report': BrandLiftReportEmailTemplate,
  'campaign-submitted': CampaignSubmittedEmailTemplate,
} as const;

// SSOT: Template Metadata
export const TEMPLATE_METADATA = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Welcome new users to the platform',
    type: 'welcome' as const,
    defaultSubject: 'Welcome to Justify.Social!',
  },
  invitation: {
    id: 'invitation',
    name: 'Team Invitation',
    description: 'Invite users to join an organization',
    type: 'invitation' as const,
    defaultSubject: "You've been invited to join our team",
  },
  notification: {
    id: 'notification',
    name: 'General Notification',
    description: 'General system notifications and updates',
    type: 'notification' as const,
    defaultSubject: 'Update from Justify.Social',
  },
  'brand-lift-report': {
    id: 'brand-lift-report',
    name: 'Brand Lift Report Ready',
    description: 'Notification when Brand Lift reports are available',
    type: 'notification' as const,
    defaultSubject: 'Your Brand Lift Report is Ready',
  },
  'campaign-submitted': {
    id: 'campaign-submitted',
    name: 'Campaign Submitted',
    description: 'Confirmation when a campaign is submitted for review',
    type: 'notification' as const,
    defaultSubject: 'Campaign Submitted Successfully',
  },
} as const;

export type TemplateId = keyof typeof EMAIL_TEMPLATES;
export type TemplateType = (typeof TEMPLATE_METADATA)[TemplateId]['type'];
