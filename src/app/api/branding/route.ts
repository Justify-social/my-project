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

// Helper to get internal organization ID from Clerk Org ID
async function getInternalOrgId(clerkOrgId: string): Promise<string | null> {
  if (!clerkOrgId) return null;
  try {
    // Try to find existing organization
    let orgRecord = await prisma.organization.findUnique({
      where: { clerkOrgId },
      select: { id: true },
    });

    // If organization doesn't exist, create it automatically
    if (!orgRecord) {
      console.log(`Auto-creating Organization record for clerkOrgId: ${clerkOrgId}`);
      orgRecord = await prisma.organization.create({
        data: {
          clerkOrgId: clerkOrgId,
          name: `Organization ${clerkOrgId}`, // Default name, can be updated later
        },
        select: { id: true },
      });
      console.log(`Created Organization with internal ID: ${orgRecord.id}`);
    }

    return orgRecord.id;
  } catch (error: any) {
    // Handle case where Organization table doesn't exist yet (during migration deployment)
    if (error?.code === 'P2021') {
      console.warn(
        `Organization table not yet available during migration. ClerkOrgId: ${clerkOrgId}`
      );
      return null;
    }
    throw error; // Re-throw other errors
  }
}

/**
 * GET /api/branding
 * Fetches the branding settings for the authenticated user.
 * Attempts findUnique by userId, falls back to defaults or error.
 */
export async function GET(_request: Request) {
  let clerkUserId: string | null = null;
  let clerkOrgId: string | null | undefined = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
    clerkOrgId = authResult.orgId;

    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!clerkOrgId) {
      console.warn(`User ${clerkUserId} does not have an active organization for GET.`);
      return NextResponse.json(
        { success: false, error: 'No active organization found for user.' },
        { status: 400 }
      );
    }

    const internalOrgId = await getInternalOrgId(clerkOrgId);
    if (!internalOrgId) {
      console.warn(`No internal organization record found for clerkOrgId ${clerkOrgId}.`);
      return NextResponse.json(
        { success: false, error: 'Organization not found in system.' },
        { status: 404 }
      );
    }

    const settings = await prisma.brandingSettings.findUnique({
      where: { organizationId: internalOrgId },
    });

    if (!settings) {
      return NextResponse.json({ success: true, data: brandingSchema.parse({}) }, { status: 200 });
    }
    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error) {
    console.error(
      `API Error fetching branding settings for org ${clerkOrgId} (user ${clerkUserId}):`,
      error
    );
    return handleDbError(error, 'BrandingSettings', DbOperation.FETCH);
  }
}

/**
 * PATCH /api/branding
 * Pragmatic Update/Create: Finds by userId, then updates by ID or creates.
 */
export async function PATCH(request: NextRequest) {
  let clerkUserId: string | null = null;
  let clerkOrgId: string | null | undefined = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
    clerkOrgId = authResult.orgId;

    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!clerkOrgId) {
      console.warn(`User ${clerkUserId} does not have an active organization for PATCH.`);
      return NextResponse.json(
        { success: false, error: 'No active organization found to save settings.' },
        { status: 400 }
      );
    }

    const internalOrgId = await getInternalOrgId(clerkOrgId);
    if (!internalOrgId) {
      console.warn(`No internal organization record found for clerkOrgId ${clerkOrgId}.`);
      return NextResponse.json(
        { success: false, error: 'Organization not found in system. Cannot save settings.' },
        { status: 404 }
      );
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

    const { data: brandingData } = validationResult;
    let finalSettings;

    const existingSettings = await prisma.brandingSettings.findUnique({
      where: { organizationId: internalOrgId },
    });

    if (existingSettings) {
      finalSettings = await prisma.brandingSettings.update({
        where: { id: existingSettings.id },
        data: brandingData,
      });
    } else {
      finalSettings = await prisma.brandingSettings.create({
        data: {
          ...brandingData,
          organizationId: internalOrgId,
        },
      });
    }
    return NextResponse.json({ success: true, data: finalSettings }, { status: 200 });
  } catch (error) {
    console.error(
      `API Error updating branding settings for org ${clerkOrgId} (user ${clerkUserId}):`,
      error
    );
    return handleDbError(error, 'BrandingSettings', DbOperation.UPDATE);
  }
}

export async function POST(_request: NextRequest) {
  let clerkUserId: string | null = null;
  let clerkOrgId: string | null | undefined = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult.userId;
    clerkOrgId = authResult.orgId;

    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!clerkOrgId) {
      console.warn(`User ${clerkUserId} does not have an active organization for POST.`);
      return NextResponse.json(
        { success: false, error: 'No active organization found to save settings.' },
        { status: 400 }
      );
    }

    const internalOrgId = await getInternalOrgId(clerkOrgId);
    if (!internalOrgId) {
      console.warn(`No internal organization record found for clerkOrgId ${clerkOrgId}.`);
      return NextResponse.json(
        { success: false, error: 'Organization not found in system. Cannot save settings.' },
        { status: 404 }
      );
    }

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

    const existingSettings = await prisma.brandingSettings.findUnique({
      where: { organizationId: internalOrgId },
    });

    if (existingSettings) {
      finalSettings = await prisma.brandingSettings.update({
        where: { id: existingSettings.id },
        data: brandingData,
      });
    } else {
      finalSettings = await prisma.brandingSettings.create({
        data: {
          ...brandingData,
          organizationId: internalOrgId,
        },
      });
    }
    return NextResponse.json({ success: true, data: finalSettings }, { status: 200 });
  } catch (error) {
    console.error(
      `API Error creating/updating branding settings for org ${clerkOrgId} (user ${clerkUserId}):`,
      error
    );
    return handleDbError(error, 'BrandingSettings', DbOperation.UPDATE);
  }
}
