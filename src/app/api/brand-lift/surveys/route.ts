import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db'; // TODO: Verify this is the correct path to your Prisma client instance
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Using clerkClient for potential role checks
// import { ForbiddenError, UnauthenticatedError } from '@/lib/errors'; // Hypothetical custom errors
// import logger from '@/lib/logger'; // Hypothetical shared logger
// import { handleApiError } from '@/lib/apiErrorHandler'; // Hypothetical shared API error handler

// Define Zod schema based on BrandLiftStudyBase from OpenAPI spec
const brandLiftStudyBaseSchema = z.object({
  name: z.string().min(1, { message: 'Study name is required.' }),
  campaignId: z.string().min(1, { message: 'Campaign ID is required.' }), // Will be Int in DB, but API might take string
  funnelStage: z.string().min(1, { message: 'Funnel stage is required.' }),
  primaryKpi: z.string().min(1, { message: 'Primary KPI is required.' }),
  secondaryKpis: z.array(z.string()).optional(),
});

// HYPOTHETICAL SHARED UTILITIES (Illustrative - these would be in separate files)
const logger = {
  info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
  error: (message: string, error?: any, context?: any) =>
    console.error(`[ERROR] ${message}`, error, context || ''),
};

const handleApiError = (error: any, request?: Request) => {
  // Default error
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred.';

  // Log the error with context
  const { method, url } = request || {};
  logger.error(`API Error: ${error.message}`, error, { method, url });

  if (error.name === 'UnauthenticatedError') {
    // Hypothetical custom error
    statusCode = 401;
    errorMessage = error.message || 'User not authenticated.';
  } else if (error.name === 'ForbiddenError') {
    // Hypothetical custom error
    statusCode = 403;
    errorMessage = error.message || 'User does not have permission for this action.';
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    errorMessage = error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      statusCode = 409; // Conflict
      errorMessage = `Record already exists. Fields: ${error.meta?.target?.join(', ')}`;
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = (error.meta?.cause as string) || 'Record not found.';
    } else {
      errorMessage = `Database error occurred.`; // Avoid leaking sensitive error.message
    }
  }
  // ... add more specific error type handling as needed

  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// Updated tryCatch to use shared error/logging utilities
async function tryCatch<T>(
  handler: (request: Request, params?: any) => Promise<NextResponse<T>>
): Promise<(request: Request, params?: any) => Promise<NextResponse<T | { error: string }>>> {
  return async (request: Request, params?: any) => {
    try {
      // Potentially add request logging here if needed
      // logger.info(`Request received: ${request.method} ${request.url}`);
      return await handler(request, params);
    } catch (error: any) {
      return handleApiError(error, request);
    }
  };
}

async function postHandler(request: Request) {
  const { userId, orgId } = getAuth(request);

  if (!userId) {
    // Replace with throwing a custom error to be caught by handleApiError
    // throw new UnauthenticatedError("User not authenticated.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 }); // Kept for now if custom error not set up
  }

  logger.info('Authenticated user for POST /surveys', { userId, orgId });

  // TODO: Authorization Logic - P1-01
  // Example: Check if the user has a specific role or permission to create studies.
  // const user = await clerkClient.users.getUser(userId);
  // const userRoles = user.publicMetadata.roles as string[] || []; // Assuming roles are stored in publicMetadata
  // if (!userRoles.includes('study_creator') && !userRoles.includes('admin')) {
  //    // throw new ForbiddenError("User does not have permission to create studies.");
  //    return NextResponse.json({ error: "Forbidden: User does not have permission to create studies." }, { status: 403 });
  // }
  // Further, if studies are linked to specific campaigns and campaigns have owners or org restrictions:
  // const campaign = await prisma.campaignWizardSubmission.findUnique({ where: { id: parseInt(validatedData.campaignId, 10) } });
  // if (!campaign) { return NextResponse.json({ error: "Campaign not found." }, { status: 404 }); }
  // if (campaign.organizationId && campaign.organizationId !== orgId && !userRoles.includes('admin')) {
  //    // throw new ForbiddenError("User cannot create a study for a campaign outside their organization.");
  //    return NextResponse.json({ error: "Forbidden: Cannot create study for this campaign." }, { status: 403 });
  // }
  // if (!campaign.organizationId && campaign.userId !== userId && !userRoles.includes('admin')) { // Assuming campaign.userId links to creator
  //    // throw new ForbiddenError("User cannot create a study for this campaign.");
  //    return NextResponse.json({ error: "Forbidden: Cannot create study for this campaign." }, { status: 403 });
  // }

  const body = await request.json();
  const validatedData = brandLiftStudyBaseSchema.parse(body); // ZodError will be caught by tryCatch

  const newStudy = await prisma.brandLiftStudy.create({
    data: {
      ...validatedData,
      campaignId: parseInt(validatedData.campaignId, 10), // Assuming campaignId in DB is Int
      // Example: Storing creator and organization if part of your schema
      // createdBy: userId,
      // organizationId: orgId,
      status: 'DRAFT', // Explicitly set initial status
    },
  });
  logger.info('New BrandLiftStudy created', { studyId: newStudy.id, userId });
  return NextResponse.json(newStudy, { status: 201 });
}

async function getHandler(request: Request) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  logger.info('Authenticated user for GET /surveys', { userId, orgId });

  const { searchParams } = new URL(request.url);
  const campaignIdQuery = searchParams.get('campaignId');

  const whereClause: any = {}; // Prisma.BrandLiftStudyWhereInput = {};
  if (campaignIdQuery) {
    whereClause.campaignId = parseInt(campaignIdQuery, 10);
  }

  // TODO: Authorization Logic for data visibility - P1-01
  // Example: Filter studies based on user ownership or organization membership.
  // This depends heavily on how studies are associated with users/orgs in your Prisma schema.
  // if (orgId) { // If user is part of an organization, show studies linked to that org.
  //    whereClause.organizationId = orgId;
  //    // Additionally, you might want to only show studies created by specific roles within the org, or all if admin.
  //    // const user = await clerkClient.users.getUser(userId);
  //    // const userRoles = user.publicMetadata.roles as string[] || [];
  //    // if (!userRoles.includes('admin') && !userRoles.includes('study_viewer')) {
  //    //    whereClause.createdBy = userId; // Non-admins/viewers only see their own org studies
  //    // }
  // } else { // If no org context, user might only see their own studies.
  //    whereClause.createdBy = userId;
  // }
  // If there's a global admin role that can see all studies, that check would come first.
  // const user = await clerkClient.users.getUser(userId);
  // const userRoles = user.publicMetadata.roles as string[] || [];
  // if (!userRoles.includes('global_admin')) { /* apply org/user filtering */ }

  const studies = await prisma.brandLiftStudy.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return NextResponse.json(studies, { status: 200 });
}

// It's generally better to define one handler per method and then wrap it,
// or handle errors more granularly within each handler if a generic HOF is too broad.
export const POST = tryCatch(postHandler);
export const GET = tryCatch(getHandler);

// Note: Specific GET by ID (/{studyId}) and PUT (/{studyId}) would typically be in a
// dynamic route file like /api/brand-lift/surveys/[studyId]/route.ts
// For now, all survey-related root operations are in this file.
