// import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent, UserJSON } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Import your Prisma client
import { logger } from '@/utils/logger'; // Assuming logger exists
import { sendWelcomeEmail } from '@/lib/email';

/**
 * Clerk Webhook Handler
 *
 * Handles incoming webhook events from Clerk to synchronize user data
 * with the application database.
 */

// Ensure secret is loaded from environment variables
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: Request) {
  console.log('Clerk webhook request received...');

  if (!CLERK_WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET environment variable not set.');
    return new Response('Internal Server Error: Webhook secret not configured.', { status: 500 });
  }

  // Get headers directly from the request object
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    logger.info('Clerk webhook verified successfully.');
  } catch (err: any) {
    logger.error('Error verifying Clerk webhook:', { error: err.message });
    return new Response(`Error verifying webhook: ${err.message}`, { status: 400 });
  }

  const eventType = evt.type;

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
  } catch (error: any) {
    logger.error(
      `Error handling Clerk webhook event type ${eventType} for ID ${relevantIdForLog}:`,
      error
    );
    return new Response(`Webhook handler error: ${error.message}`, { status: 500 });
  }
  // --- End Event Handling ---

  // Acknowledge receipt
  return NextResponse.json({ received: true });
}
