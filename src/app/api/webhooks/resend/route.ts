import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';
// import { Resend } from 'resend'; // Commented out: Resend SDK not directly used for webhook consumption logic
import { Webhook } from 'svix'; // Import Svix Webhook class

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;
// No need to instantiate Resend client here unless the SDK's Webhook class is static
// or you use a global instance for other purposes.
// For webhook verification, usually you use a method from the imported Resend object/class directly.

function handleErrorResponse(error: unknown, type: string, res: typeof NextResponse) {
  let errorData: string | unknown = 'Unknown error'; // Default error data, changed type
  let statusCode = 500;

  if (error instanceof Error) {
    logger.error(`Resend webhook error (${type})`, {
      errorName: error.name,
      errorMessage: error.message,
    });
    errorData = error.message;
    // Check for code property more safely
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const errorCode = (error as { code: unknown }).code;
      if (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED') {
        statusCode = 503; // Service Unavailable for network errors
      }
    }
  } else if (typeof error === 'object' && error !== null) {
    // For Zod-like errors or other structured errors
    if ('errors' in error) {
      errorData = (error as { errors: unknown }).errors;
      statusCode = 400; // Bad Request for validation errors
    } else if ('message' in error) {
      errorData = (error as { message: unknown }).message;
    } else {
      errorData = error; // Fallback to the error object itself if no message/errors field
    }
    logger.error(`Resend webhook structured error (${type})`, { errorData });
  } else {
    // For primitive errors or unknown types
    errorData = String(error);
    logger.error(`Resend webhook primitive error (${type})`, { errorData });
  }

  return res.json(
    { error: typeof errorData === 'string' ? errorData : JSON.stringify(errorData), type },
    { status: statusCode }
  );
}

export async function POST(request: Request) {
  logger.info('[Webhook Resend] Received request');

  if (!RESEND_WEBHOOK_SECRET) {
    logger.error('[Webhook Resend] Webhook secret is not configured.');
    // Return 500 but don't reveal internal config issues
    return NextResponse.json({ error: 'Webhook configuration error.' }, { status: 500 });
  }

  // --- 1. Signature Verification using Svix ---
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.warn('[Webhook Resend] Missing Svix headers for verification.');
    return NextResponse.json({ error: 'Missing signature headers.' }, { status: 400 });
  }

  const wh = new Webhook(RESEND_WEBHOOK_SECRET);
  const rawBody = await request.text();
  let event: Record<string, any>; // Use a generic record type initially

  try {
    // Verify the webhook signature
    event = wh.verify(rawBody, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as Record<string, any>; // Assert type after verification

    logger.info('[Webhook Resend] Signature verified successfully.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('[Webhook Resend] Error during signature verification:', message);
    // Ensure specific error message for invalid signature
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }
  // --- End Signature Verification ---

  try {
    // Event payload is already verified and available in the 'event' variable
    const eventType = event.type;
    const eventData = event.data;

    logger.info(`[Webhook Resend] Processing event type: ${eventType}`, {
      eventId: eventData?.email_id || event.id,
    });

    // --- 2. Handle Specific Event Types ---
    switch (eventType) {
      case 'email.sent':
        logger.info(`Email Sent: ID ${eventData?.email_id} to ${eventData?.to}`);
        // Optional: Update internal status if needed
        break;

      case 'email.delivered':
        logger.info(`Email Delivered: ID ${eventData?.email_id} to ${eventData?.to}`);
        // Optional: Mark email as confirmed delivered
        break;

      case 'email.delivery_delayed':
        logger.warn(`Email Delivery Delayed: ID ${eventData?.email_id} to ${eventData?.to}`);
        // Optional: Monitor or notify internally
        break;

      case 'email.bounced':
        logger.warn(`Email Bounced: ID ${eventData?.email_id} to ${eventData?.to}`, {
          bounceReason: eventData?.reason,
          bounceType: eventData?.type,
        });
        if (eventData?.email) {
          try {
            await prisma.user.updateMany({
              where: { email: eventData.email },
              data: { isEmailDeliverable: false },
            });
            logger.info(`Marked email ${eventData.email} as undeliverable due to bounce.`);
          } catch (dbError) {
            logger.error(
              `[Webhook Resend] DB error updating user for bounce: ${eventData.email}`,
              dbError
            );
          }
        } else {
          logger.warn('[Webhook Resend] Bounce event missing email address.');
        }
        break;

      case 'email.complained':
        logger.warn(`Email Complaint (Spam): ID ${eventData?.email_id} from ${eventData?.to}`);
        if (eventData?.email) {
          try {
            await prisma.user.updateMany({
              where: { email: eventData.email },
              data: {
                emailMarketingConsent: false,
                isEmailDeliverable: false,
              },
            });
            logger.info(`Marked email ${eventData.email} as unsubscribed due to complaint.`);
          } catch (dbError) {
            logger.error(
              `[Webhook Resend] DB error updating user for complaint: ${eventData.email}`,
              dbError
            );
          }
        } else {
          logger.warn('[Webhook Resend] Complaint event missing email address.');
        }
        break;

      case 'email.opened':
        logger.info(`Email Opened: ID ${eventData?.email_id} by ${eventData?.to}`);
        // Optional: Track opens for analytics
        break;

      case 'email.clicked':
        logger.info(
          `Email Clicked: ID ${eventData?.email_id} by ${eventData?.to}, URL: ${eventData?.url}`
        );
        // Optional: Track clicks for analytics
        break;

      default:
        logger.info(`Unhandled Resend event type: ${eventType}`);
    }

    // --- 3. Acknowledge Receipt ---
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    logger.error('Error processing Resend webhook event', {
      errorName: (error as Error).name,
      errorMessage: (error as Error).message,
    });
    // Return a generic error response; specific errors handled by handleErrorResponse if called before this catch
    return handleErrorResponse(error, 'Resend webhook event', NextResponse);
  }
}
