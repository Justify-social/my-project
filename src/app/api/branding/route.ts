import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { handleDbError } from '@/lib/middleware/api';
import { DbOperation } from '@/lib/data-mapping/db-logger';
import { Prisma } from '@prisma/client';

// Re-define or import the schema used in the frontend form for validation
// IMPORTANT: Ensure this matches the form schema exactly
const brandingSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional()
    .default('#333333'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional()
    .default('#4A5568'),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color')
    .optional()
    .default('#00BFFF'),
  headerFont: z.string().min(1, 'Header font is required').default('Inter'),
  bodyFont: z.string().min(1, 'Body font is required').default('Inter'),
  logoUrl: z.string().url('Invalid URL').optional().nullable(),
});

/**
 * GET /api/branding
 * Fetches the branding settings for the authenticated user.
 * Attempts findUnique by userId, falls back to defaults or error.
 */
export async function GET(_request: Request) {
  let _userId: string | null = null;
  try {
    const authResult = await auth();
    _userId = authResult.userId;
    if (!_userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to find directly by userId
    const settings = await prisma.brandingSettings.findUnique({
      where: { userId: _userId },
    });

    if (!settings) {
      return NextResponse.json(
        {
          success: true,
          data: brandingSchema.parse({}), // Return defaults
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error) {
    console.error(`API Error fetching branding settings for user ${_userId}:`, error);
    // Handle potential runtime error if findUnique by userId fails
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      // Example: Table does not exist (less likely) or invalid arg type
      console.error(
        'Prisma schema/client type mismatch suspected for findUnique({ where: { userId } })'
      );
      return NextResponse.json(
        { success: false, error: 'Internal configuration error finding settings.' },
        { status: 500 }
      );
    }
    return handleDbError(error, 'BrandingSettings', DbOperation.FETCH);
  }
}

/**
 * PATCH /api/branding
 * Pragmatic Update/Create: Finds by userId, then updates by ID or creates.
 */
export async function PATCH(request: NextRequest) {
  let _userId: string | null = null;
  try {
    const authResult = await auth();
    _userId = authResult.userId;
    if (!_userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = brandingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data: brandingData, success: _success } = validationResult;

    let finalSettings;

    // 1. Attempt to find existing settings by userId
    let existingSettings = null;
    try {
      existingSettings = await prisma.brandingSettings.findUnique({
        where: { userId: _userId },
      });
    } catch (findError) {
      console.error(
        `Prisma findUnique({ where: { userId } }) failed for user ${_userId}:`,
        findError
      );
      // If findUnique itself fails structurally, proceed to create but log error
      if (
        !(findError instanceof Prisma.PrismaClientKnownRequestError && findError.code === 'P2025')
      ) {
        // P2025 = Record not found (expected case)
        // Log unexpected find error, but attempt create anyway
        console.error('Unexpected error during findUnique by userId, attempting create...');
      }
      // existingSettings remains null
    }

    if (existingSettings) {
      // 2a. Update using the primary key `id`
      finalSettings = await prisma.brandingSettings.update({
        where: { id: existingSettings.id }, // Use the actual primary key
        data: brandingData,
      });
    } else {
      // 2b. Create new settings, setting the scalar userId field
      finalSettings = await prisma.brandingSettings.create({
        data: {
          ...brandingData,
          userId: _userId,
        },
      });
    }

    return NextResponse.json({ success: true, data: finalSettings }, { status: 200 });
  } catch (error) {
    console.error(`API Error updating branding settings for user ${_userId}:`, error);
    return handleDbError(error, 'BrandingSettings', DbOperation.UPDATE);
  }
}

export async function POST(_request: Request) {
  let userIdForErrorLogging: string | null = null;
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userIdForErrorLogging = userId;

    const existingSettings = await prisma.brandingSettings.findUnique({
      where: { userId },
    });

    const body = await _request.json();
    const validationResult = brandingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data: brandingData } = validationResult;

    let finalSettings;

    if (existingSettings) {
      finalSettings = await prisma.brandingSettings.update({
        where: { id: existingSettings.id },
        data: brandingData,
      });
    } else {
      finalSettings = await prisma.brandingSettings.create({
        data: {
          ...brandingData,
          userId: userId,
        },
      });
    }

    return NextResponse.json({ success: true, data: finalSettings }, { status: 200 });
  } catch (error) {
    console.error(
      `API Error updating branding settings for user ${userIdForErrorLogging ?? 'UNKNOWN'}:`,
      error
    );
    return handleDbError(error, 'BrandingSettings', DbOperation.UPDATE);
  }
}
