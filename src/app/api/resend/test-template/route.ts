import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

// Request validation schema
const TestTemplateSchema = z.object({
  templateId: z.string(),
  testEmail: z.string().email().optional(),
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
      throw new ForbiddenError('Admin access required for template testing.');
    }

    const body = await request.json();
    const { templateId, testEmail } = TestTemplateSchema.parse(body);

    if (!process.env.RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }

    // Use Resend's test email addresses for safe testing
    const testEmailAddress = testEmail || 'delivered@resend.dev';

    // Get template data (in a real app, this would fetch from database)
    const template = getTemplateById(templateId);
    if (!template) {
      throw new BadRequestError(`Template with ID ${templateId} not found`);
    }

    // Generate test data for template variables
    const testData = generateTestData(template.type);

    // Replace template variables with test data
    let htmlContent = template.preview;
    let subject = template.subject;

    Object.entries(testData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Send test email
    const { data, error } = await resend.emails.send({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@justifyplatform.com',
      to: testEmailAddress,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      tags: [
        { name: 'type', value: 'template-test' },
        { name: 'template', value: templateId },
        { name: 'tester', value: clerkUserId },
      ],
    });

    if (error) {
      logger.error('Failed to send test email:', { error: error.message, templateId });
      throw new Error(`Failed to send test email: ${error.message}`);
    }

    logger.info('Test email sent successfully', {
      templateId,
      templateName: template.name,
      testEmail: testEmailAddress,
      emailId: data?.id,
      userId: clerkUserId,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testEmailAddress}`,
      emailId: data?.id,
      template: {
        id: templateId,
        name: template.name,
        type: template.type,
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

function getTemplateById(templateId: string) {
  const templates = {
    'welcome-template': {
      id: 'welcome-template',
      name: 'Welcome Email',
      type: 'welcome',
      subject: 'Welcome to Justify.Social!',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #333;">Welcome to Justify.Social!</h2>
          <p>We're excited to have you on board. Start exploring our platform to manage your influencer marketing campaigns effectively.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://justify.social/dashboard" style="background-color: #00BFFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Get Started
            </a>
          </div>
          <p>Best regards,<br>The Justify.Social Team</p>
        </div>
      `,
    },
    'invitation-template': {
      id: 'invitation-template',
      name: 'Team Invitation',
      type: 'invitation',
      subject: "You've been invited to join {{companyName}}",
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #333;">You've Been Invited!</h2>
          <p>{{inviterName}} has invited you to join {{companyName}} on Justify.Social as a {{role}}.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{invitationLink}}" style="background-color: #00BFFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This invitation expires on {{expiresAt}}.</p>
          <p>Best regards,<br>The Justify.Social Team</p>
        </div>
      `,
    },
    'brand-lift-report-template': {
      id: 'brand-lift-report-template',
      name: 'Brand Lift Report Ready',
      type: 'notification',
      subject: 'Your Brand Lift Report is Ready',
      preview: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
          <h2 style="color: #333;">Your Brand Lift Report is Ready!</h2>
          <p>We're excited to share the results of your Brand Lift study "{{studyName}}". The report contains valuable insights about your campaign's impact on brand perception.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Key Highlights:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Brand awareness lift: {{awarenessLift}}%</li>
              <li>Purchase intent lift: {{purchaseIntentLift}}%</li>
              <li>Study completion rate: {{completionRate}}%</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{reportUrl}}" style="background-color: #00BFFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View Full Report
            </a>
          </div>
          <p>Best regards,<br>The Justify.Social Team</p>
        </div>
      `,
    },
    // Add other templates as needed
  };

  return templates[templateId as keyof typeof templates] || null;
}

function generateTestData(templateType: string): Record<string, string | number> {
  const baseData = {
    userEmail: 'test.user@example.com',
    userName: 'Test User',
    companyName: 'Test Company',
    supportEmail: 'support@justifyplatform.com',
    dashboardUrl: 'https://justify.social/dashboard',
  };

  switch (templateType) {
    case 'invitation':
      return {
        ...baseData,
        inviterName: 'John Smith',
        role: 'Admin',
        invitationLink: 'https://justify.social/invitations/test-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      };

    case 'notification':
      return {
        ...baseData,
        subject: 'Test Notification',
        message: 'This is a test notification message.',
        actionUrl: 'https://justify.social/dashboard',
        studyName: 'Test Brand Lift Study',
        awarenessLift: 15,
        purchaseIntentLift: 12,
        completionRate: 85,
        reportUrl: 'https://justify.social/brand-lift/reports/test-123',
        campaignName: 'Test Campaign',
        campaignUrl: 'https://justify.social/campaigns/test-123',
        resetUrl: 'https://justify.social/reset-password/test-token',
      };

    default:
      return baseData;
  }
}
