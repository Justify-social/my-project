// import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent, UserJSON } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Import your Prisma client
import { logger } from '@/utils/logger'; // Assuming logger exists
import { sendWelcomeEmail } from '@/lib/email';
import { headers } from 'next/headers';

/**
 * Clerk Webhook Handler
 *
 * Handles incoming webhook events from Clerk to synchronize user data
 * with the application database.
 */

// Ensure secret is loaded from environment variables
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  logger.info('[Clerk Webhook] Received POST request');

  if (!CLERK_WEBHOOK_SECRET) {
    logger.error(
      '[Clerk Webhook] CRITICAL ERROR: CLERK_WEBHOOK_SECRET environment variable not set.'
    );
    // Do not return the actual secret in the error response for security.
    return NextResponse.json(
      { success: false, error: 'Webhook secret not configured on server.' },
      { status: 500 }
    );
  }
  // Log only a portion or a hash if you need to verify it's loaded, but not the secret itself for security.
  // For now, we assume it's loaded if the check above passes.
  logger.info('[Clerk Webhook] CLERK_WEBHOOK_SECRET is present (not logging value for security).');

  // Await headers() if the type system insists it's a Promise
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  logger.info('[Clerk Webhook] Svix Headers Present:', {
    has_svix_id: !!svix_id,
    has_svix_timestamp: !!svix_timestamp,
    has_svix_signature: !!svix_signature,
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.error('[Clerk Webhook] Error: Missing one or more Svix headers.', {
      svix_id: svix_id || 'missing',
      svix_timestamp: svix_timestamp || 'missing',
      svix_signature: svix_signature || 'missing',
    });
    return NextResponse.json({ success: false, error: 'Missing Svix headers' }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
    logger.info(
      '[Clerk Webhook] Successfully read raw request body (length: ' + rawBody.length + ').'
    );
    // Avoid logging the full body in production long-term; truncate or log only if debugging specific issues.
    // logger.debug('[Clerk Webhook] Raw body snippet: ' + rawBody.substring(0, 200));
  } catch (error) {
    logger.error('[Clerk Webhook] Error reading request body as text:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read request body' },
      { status: 500 }
    );
  }

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    logger.info('[Clerk Webhook] Attempting to verify signature with Svix library.');
    evt = wh.verify(rawBody, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    logger.info(
      '[Clerk Webhook] Signature verified successfully! Event type: ' +
        evt.type +
        ', Event ID: ' +
        evt.data.id
    );
  } catch (err: any) {
    logger.error('[Clerk Webhook] Error verifying webhook signature with Svix library:', {
      errorMessage: err.message,
      errorStack: err.stack,
      // fullError: err, // Avoid logging full error object if it might contain sensitive details from Svix internals
    });
    // This specific error message is what Clerk dashboard shows for signature failures.
    return NextResponse.json(
      { success: false, error: 'Error verifying webhook: No matching signature found' },
      { status: 400 }
    );
  }

  const eventType = evt.type;
  logger.info(`[Clerk Webhook] Processing verified event type: ${eventType}`);

  // Safely get the relevant ID for logging
  let relevantIdForLog = '(unknown_event_structure)';
  if (
    evt.data &&
    typeof evt.data === 'object' &&
    'id' in evt.data &&
    typeof evt.data.id === 'string'
  ) {
    relevantIdForLog = evt.data.id;
  } else if (
    eventType === 'organizationMembership.created' ||
    eventType === 'organizationMembership.updated' ||
    eventType === 'organizationMembership.deleted'
  ) {
    // Handle events where ID might be nested differently, e.g., membership events
    if (
      evt.data &&
      typeof evt.data === 'object' &&
      'public_user_data' in evt.data &&
      typeof evt.data.public_user_data === 'object' &&
      evt.data.public_user_data &&
      'user_id' in evt.data.public_user_data
    ) {
      relevantIdForLog = `membership_user:${evt.data.public_user_data.user_id}`;
    } else if (
      evt.data &&
      typeof evt.data === 'object' &&
      'organization' in evt.data &&
      typeof evt.data.organization === 'object' &&
      evt.data.organization &&
      'id' in evt.data.organization
    ) {
      relevantIdForLog = `membership_org:${evt.data.organization.id}`;
    }
  } // Add more checks for other event types if needed

  logger.info(`Processing verified Clerk event type: ${eventType}`, {
    relatedId: relevantIdForLog,
  });

  // --- Handle Specific Events ---
  try {
    switch (eventType) {
      // --- CLERK-BE-4: Use Upsert for User Created ---
      case 'user.created':
        logger.info('[Clerk Webhook] Event: user.created, User ID: ' + evt.data.id);
        const createdData = evt.data;
        logger.info('Handling user.created', { clerkId: createdData.id });

        // Prepare user data for upsert
        const userEmail =
          createdData.email_addresses[0]?.email_address ?? 'missing_email@example.com';
        const userName =
          `${createdData.first_name ?? ''} ${createdData.last_name ?? ''}`.trim() || null;

        const userDataForCreate = {
          clerkId: createdData.id,
          email: userEmail,
          name: userName,
          // Map other fields from createdData if needed
        };

        await prisma.user.upsert({
          where: { clerkId: createdData.id },
          update: userDataForCreate,
          create: userDataForCreate,
        });
        logger.info(`User upserted successfully in DB for Clerk ID: ${createdData.id}`);

        // --- SEND WELCOME EMAIL ---
        try {
          // Don't block webhook response for email sending result
          sendWelcomeEmail({ email: userEmail, name: userName }).then(success => {
            if (!success) {
              logger.error(
                `Failed to send welcome email to ${userEmail} for Clerk ID: ${createdData.id}`
              );
            }
          });
        } catch (emailError) {
          // Catch sync errors if sendWelcomeEmail itself throws somehow
          logger.error(`Error initiating welcome email for ${userEmail}:`, emailError);
        }
        // --- END SEND WELCOME EMAIL ---
        break;

      // --- CLERK-BE-5: User Updated ---
      case 'user.updated':
        logger.info('[Clerk Webhook] Event: user.updated, User ID: ' + evt.data.id);
        const updatedData = evt.data;
        logger.info('Handling user.updated', { clerkId: updatedData.id });
        await prisma.user.update({
          where: { clerkId: updatedData.id },
          data: {
            email: updatedData.email_addresses[0]?.email_address ?? undefined,
            name: `${updatedData.first_name ?? ''} ${updatedData.last_name ?? ''}`.trim() || null,
          },
        });
        logger.info(`User updated successfully in DB for Clerk ID: ${updatedData.id}`);
        break;

      // --- CLERK-BE-6: User Deleted ---
      case 'user.deleted':
        logger.info('[Clerk Webhook] Event: user.deleted, User ID: ' + evt.data.id);
        const deletedData = evt.data as UserJSON & { deleted?: boolean };
        if (deletedData.id) {
          logger.info('Handling user.deleted', { clerkId: deletedData.id });
          // Use deleteMany - this won't throw an error if the user is already gone.
          const deleteResult = await prisma.user.deleteMany({
            where: { clerkId: deletedData.id },
          });
          if (deleteResult.count > 0) {
            logger.info(`User deleted successfully from DB for Clerk ID: ${deletedData.id}`);
          } else {
            logger.warn(
              `User with Clerk ID ${deletedData.id} not found in DB for deletion (already deleted?).`
            );
          }
        } else {
          logger.error('Received user.deleted event without an ID.');
        }
        break;

      default:
        logger.info(`Unhandled verified Clerk event type: ${eventType}`);
    }
    return NextResponse.json(
      { success: true, message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error(
      `Error handling Clerk webhook event type ${eventType} for ID ${relevantIdForLog}:`,
      error
    );
    return NextResponse.json(
      { success: false, error: 'Webhook handler error: ' + error.message },
      { status: 500 }
    );
  }
  // --- End Event Handling ---
}
