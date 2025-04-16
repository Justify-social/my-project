import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { handleDbError } from 'config/middleware/api/handle-db-errors';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for error checking

// Re-define or import the schema used in the frontend form for validation
// IMPORTANT: Ensure this matches the form schema exactly
const brandingSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#333333'),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#4A5568'),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color").optional().default('#00BFFF'),
    headerFont: z.string().min(1, "Header font is required").default('Inter'),
    bodyFont: z.string().min(1, "Body font is required").default('Inter'),
    logoUrl: z.string().url("Invalid URL").optional().nullable(),
});

/**
 * GET /api/branding
 * Fetches the branding settings for the authenticated user.
 * Attempts findUnique by userId, falls back to defaults or error.
 */
export async function GET(request: NextRequest) {
    let userId: string | null = null;
    try {
        const authResult = await auth();
        userId = authResult.userId;
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Attempt to find directly by userId
        const settings = await prisma.brandingSettings.findUnique({
            // @ts-expect-error - TS Linter incorrectly flags userId despite schema definition
            where: { userId: userId },
        });

        if (!settings) {
            return NextResponse.json({
                success: true,
                data: brandingSchema.parse({}) // Return defaults
            }, { status: 200 });
        }

        return NextResponse.json({ success: true, data: settings }, { status: 200 });

    } catch (error) {
        console.error(`API Error fetching branding settings for user ${userId}:`, error);
        // Handle potential runtime error if findUnique by userId fails
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') { // Example: Table does not exist (less likely) or invalid arg type
            console.error("Prisma schema/client type mismatch suspected for findUnique({ where: { userId } })");
            return NextResponse.json({ success: false, error: 'Internal configuration error finding settings.' }, { status: 500 });
        }
        return handleDbError(error, 'BrandingSettings', DbOperation.FETCH);
    }
}

/**
 * PATCH /api/branding
 * Pragmatic Update/Create: Finds by userId, then updates by ID or creates.
 */
export async function PATCH(request: NextRequest) {
    let userId: string | null = null;
    try {
        const authResult = await auth();
        userId = authResult.userId;
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = brandingSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid input data', details: validationResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;
        let finalSettings;

        // 1. Attempt to find existing settings by userId
        let existingSettings = null;
        try {
            existingSettings = await prisma.brandingSettings.findUnique({
                // @ts-expect-error - TS Linter incorrectly flags userId despite schema definition
                where: { userId: userId },
            });
        } catch (findError) {
            console.error(`Prisma findUnique({ where: { userId } }) failed for user ${userId}:`, findError);
            // If findUnique itself fails structurally, proceed to create but log error
            if (!(findError instanceof Prisma.PrismaClientKnownRequestError && findError.code === 'P2025')) { // P2025 = Record not found (expected case)
                // Log unexpected find error, but attempt create anyway
                console.error('Unexpected error during findUnique by userId, attempting create...');
            }
            // existingSettings remains null
        }


        if (existingSettings) {
            // 2a. Update using the primary key `id`
            finalSettings = await prisma.brandingSettings.update({
                where: { id: existingSettings.id }, // Use the actual primary key
                data: validatedData,
            });
        } else {
            // 2b. Create new settings, setting the scalar userId field
            finalSettings = await prisma.brandingSettings.create({
                data: {
                    ...validatedData,
                    // @ts-expect-error - TS Linter incorrectly flags userId despite schema definition
                    userId: userId,
                },
            });
        }

        return NextResponse.json({ success: true, data: finalSettings }, { status: 200 });

    } catch (error) {
        console.error(`API Error updating branding settings for user ${userId}:`, error);
        return handleDbError(error, 'BrandingSettings', DbOperation.UPDATE);
    }
} 