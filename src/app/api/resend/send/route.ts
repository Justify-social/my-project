import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { z } from 'zod';
import { EMAIL_TEMPLATES, type TemplateId } from '@/components/email-templates/email-templates';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// Store email sent event for analytics tracking
async function storeEmailSentEvent(
  emailId: string,
  to: string,
  subject: string,
  templateType: string
) {
  try {
    await prisma.stripeEvent.create({
      data: {
        id: `resend_${emailId}_sent_immediate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'email.sent',
        status: 'processed',
        error: {
          emailId,
          to,
          subject,
          templateType,
          eventStatus: 'sent',
          timestamp: new Date().toISOString(),
        },
      },
    });
    logger.info(`Stored email.sent event for ${emailId}`);
  } catch (error) {
    logger.error(`Failed to store email.sent event:`, { emailId, to, error });
  }
}

// Request validation schema
const SendEmailSchema = z.object({
  recipients: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['user', 'organisation']),
    })
  ),
  from: z.string().email(),
  subject: z.string().min(1),
  templateType: z.string(),
  content: z.string().min(1), // Single content field instead of message + htmlContent
  scheduledAt: z.string().optional().nullable(),
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
      logger.warn('Non-admin attempted to send bulk emails', {
        clerkUserId,
        metadataRole: sessionClaims?.['metadata.role'],
      });
      throw new ForbiddenError('Admin access required for email sending.');
    }

    const body = await request.json();
    const validatedData = SendEmailSchema.parse(body);

    const { recipients, from, subject, templateType, content, scheduledAt } = validatedData;

    if (!process.env.RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }

    // Collect all user email addresses from recipients
    const userEmails: string[] = [];
    const client = await clerkClient();

    for (const recipient of recipients) {
      if (recipient.type === 'user') {
        try {
          const user = await client.users.getUser(recipient.id);
          if (user.emailAddresses[0]?.emailAddress) {
            userEmails.push(user.emailAddresses[0].emailAddress);
          }
        } catch (error) {
          logger.error(`Failed to fetch user ${recipient.id}:`, {
            error: error instanceof Error ? error.message : String(error),
            userId: recipient.id,
          });
        }
      } else if (recipient.type === 'organisation') {
        try {
          // Fetch organization members
          const organizationMembershipList =
            await client.organizations.getOrganizationMembershipList({
              organizationId: recipient.id,
            });

          for (const membership of organizationMembershipList.data) {
            if (membership.publicUserData?.userId) {
              try {
                const user = await client.users.getUser(membership.publicUserData.userId);
                if (user.emailAddresses[0]?.emailAddress) {
                  userEmails.push(user.emailAddresses[0].emailAddress);
                }
              } catch (error) {
                logger.error(
                  `Failed to fetch user ${membership.publicUserData.userId} from org ${recipient.id}:`,
                  {
                    error: error instanceof Error ? error.message : String(error),
                  }
                );
              }
            }
          }
        } catch (error) {
          logger.error(`Failed to fetch users for organization ${recipient.id}:`, {
            error: error instanceof Error ? error.message : String(error),
            organizationId: recipient.id,
          });
        }
      }
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(userEmails)];

    if (uniqueEmails.length === 0) {
      throw new BadRequestError('No valid email addresses found in the selected recipients.');
    }

    // Generate email content using React Email templates
    let emailContent = '';

    // Check if templateType is 'custom' - handle rich HTML content directly
    if (templateType === 'custom') {
      // For custom content, create a simple HTML email with the rich content
      emailContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="font-family: 'Inter', 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #333333;">
            <div style="margin-bottom: 32px;">
              ${content}
            </div>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
            
            <div style="font-size: 14px; color: #6B7280; margin-top: 32px;">
              <p>Best regards,<br>The Justify.Social Team</p>
              <p style="font-size: 12px; margin-top: 16px;">
                This email was sent from Justify.Social. If you have any questions, please contact us at 
                <a href="mailto:hello@justify.social" style="color: #00BFFF;">hello@justify.social</a>
              </p>
            </div>
          </body>
        </html>
      `;
    } else if (templateType in EMAIL_TEMPLATES) {
      // Use React Email templates for predefined templates
      const TemplateComponent = EMAIL_TEMPLATES[templateType as TemplateId];
      emailContent = await render(
        TemplateComponent({
          subject,
          content,
          recipientName: undefined, // Could be enhanced to get user names
          actionUrl: 'https://app.justify.social/dashboard',
        })
      );
    } else {
      // Fallback: Use the notification template for unknown templates
      const NotificationTemplate = EMAIL_TEMPLATES.notification;
      emailContent = await render(
        NotificationTemplate({
          subject,
          content,
          recipientName: undefined,
          actionUrl: 'https://app.justify.social/dashboard',
        })
      );
    }

    // Handle scheduling (if scheduledAt is provided)
    if (scheduledAt) {
      // For now, we'll store scheduled emails and process them later
      // In a production environment, you'd use a job queue like Bull/BullMQ
      logger.info('Email scheduling requested', {
        scheduledAt,
        recipientCount: uniqueEmails.length,
        userId: clerkUserId,
      });

      // Store scheduled email for later processing
      // TODO: Implement scheduling mechanism
      return NextResponse.json({
        success: true,
        message: `Email scheduled for ${uniqueEmails.length} recipients`,
        scheduledAt,
        recipientCount: uniqueEmails.length,
      });
    }

    // Send emails immediately
    const results = [];
    const batchSize = 5; // Process in batches to avoid rate limits

    for (let i = 0; i < uniqueEmails.length; i += batchSize) {
      const batch = uniqueEmails.slice(i, i + batchSize);

      const batchPromises = batch.map(async email => {
        try {
          const { data, error } = await resend.emails.send({
            from,
            to: email,
            subject,
            html: emailContent,
            text: content.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
            tags: [
              { name: 'type', value: templateType },
              { name: 'sender', value: clerkUserId },
            ],
          });

          if (error) {
            logger.error(`Failed to send email to ${email}:`, { error: error.message });
            return { email, success: false, error: error.message };
          }

          logger.info(`Email sent successfully to ${email}`, { emailId: data?.id });

          // Store the sent event for analytics tracking
          if (data?.id) {
            await storeEmailSentEvent(data.id, email, subject, templateType);
          }

          return { email, success: true, emailId: data?.id };
        } catch (error) {
          logger.error(`Exception sending email to ${email}:`, {
            error: error instanceof Error ? error.message : String(error),
          });
          return {
            email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add a small delay between batches to be gentle on the API
      if (i + batchSize < uniqueEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    logger.info(`Bulk email sending completed`, {
      totalRecipients: uniqueEmails.length,
      successCount,
      failureCount,
      userId: clerkUserId,
    });

    return NextResponse.json({
      success: true,
      message: `${successCount} emails sent successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results: {
        total: uniqueEmails.length,
        success: successCount,
        failed: failureCount,
      },
      details: results,
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
