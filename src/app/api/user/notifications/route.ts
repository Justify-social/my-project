import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { handleDbError } from '@/lib/middleware/api';
import { Prisma } from '@prisma/client';

// Schema for expected PATCH request body
const notificationPrefsSchema = z.object({
    campaignUpdates: z.boolean().optional(),
    brandHealthAlerts: z.boolean().optional(),
    aiInsightNotifications: z.boolean().optional(),
});

/**
 * GET /api/user/notifications
 * Fetches notification preferences for the authenticated user.
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const prefs = await prisma.notificationPrefs.findUnique({
            where: { userId }, // Use the unique userId field
        });

        if (!prefs) {
            // Return default preferences if none exist
            return NextResponse.json({
                success: true,
                data: { campaignUpdates: false, brandHealthAlerts: false, aiInsightNotifications: false }
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: prefs }, { status: 200 });

    } catch (error) {
        console.error("API Error fetching notification preferences:", error);
        return handleDbError(error, 'NotificationPrefs', DbOperation.FETCH);
    }
}

/**
 * PATCH /api/user/notifications
 * Updates notification preferences for the authenticated user.
 */
export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = notificationPrefsSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input data', details: validationResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;

        // Use upsert to create or update preferences
        const updatedPrefs = await prisma.notificationPrefs.upsert({
            where: { userId }, // Use the unique userId field
            update: validatedData, // Only update fields present in the validated data
            create: {
                userId: userId,
                // Set explicit defaults for fields not included in the PATCH request
                campaignUpdates: validatedData.campaignUpdates ?? false,
                brandHealthAlerts: validatedData.brandHealthAlerts ?? false,
                aiInsightNotifications: validatedData.aiInsightNotifications ?? false,
            },
        });

        return NextResponse.json({ success: true, data: updatedPrefs }, { status: 200 });

    } catch (error) {
        console.error("API Error updating notification preferences:", error);
        return handleDbError(error, 'NotificationPrefs', DbOperation.UPDATE);
    }
} 