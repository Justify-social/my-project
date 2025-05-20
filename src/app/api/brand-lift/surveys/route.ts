import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler'; // Correct import path
import { tryCatch } from '@/lib/middleware/api/util-middleware';
import {
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ZodValidationError,
} from '@/lib/errors'; // Ensure all used errors are imported
import { prisma } from '@/lib/db';
import { BrandLiftStudyStatus as PrismaBrandLiftStudyStatus } from '@prisma/client';
import { addOrUpdateBrandLiftStudyInAlgolia } from '@/lib/algolia'; // Import Algolia utility
// import { hasPermission } from '@/lib/auth/permissions'; // Commented out - path needs verification

// Schema for creating a BrandLiftStudy
const createStudySchema = z.object({
  name: z.string().min(1, { message: 'Study name is required' }),
  campaignId: z.string().uuid({ message: 'Valid Campaign UUID is required' }), // Changed from number to string UUID
  funnelStage: z.string().min(1, { message: 'Funnel stage is required' }),
  primaryKpi: z.string().min(1, { message: 'Primary KPI is required' }),
  secondaryKpis: z.array(z.string()).optional(),
});

// Schema for query params when listing studies
const listStudiesQuerySchema = z.object({
  campaignId: z.coerce.number().int().optional(),
});

export async function POST(req: NextRequest) {
  return tryCatch(
    async () => {
      const { userId: clerkUserId, orgId } = await auth(); // Fetch orgId as well

      if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

      // Enforce orgId presence
      if (!orgId) {
        throw new BadRequestError(
          'Active organization context is required to create a brand lift study.'
        );
      }

      const body = await req.json();
      const validation = createStudySchema.safeParse(body);
      if (!validation.success) throw new ZodValidationError(validation.error.errors);

      const {
        name,
        campaignId: campaignWizardId,
        funnelStage,
        primaryKpi,
        secondaryKpis,
      } = validation.data;

      const userRecord = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      if (!userRecord) {
        throw new NotFoundError('User not found for campaign verification.');
      }
      const internalUserId = userRecord.id;

      // Find the CampaignWizard record by its UUID and check its orgId
      const campaignWizard = await prisma.campaignWizard.findUnique({
        where: {
          id: campaignWizardId, // This is the UUID from the form
        },
        select: {
          id: true,
          orgId: true,
          submissionId: true,
          status: true,
          name: true,
        },
      });

      if (!campaignWizard) {
        logger.error('Brand Lift POST: Source CampaignWizard not found', {
          campaignWizardId,
          userId: clerkUserId, // Log clerkUserId for context
        });
        throw new NotFoundError('Source campaign not found.');
      }

      // Authorization: Check if the CampaignWizard belongs to the user's active organization.
      if (campaignWizard.orgId === null) {
        logger.warn(
          `User ${internalUserId} in org ${orgId} attempted to create Brand Lift for legacy campaign ${campaignWizardId} (null orgId). Action denied.`
        );
        throw new ForbiddenError(
          'The selected campaign is not associated with an organization and cannot be used for a new brand lift study.'
        );
      } else if (campaignWizard.orgId !== orgId) {
        logger.warn(
          `User ${internalUserId} in org ${orgId} attempted to create Brand Lift for campaign ${campaignWizardId} belonging to org ${campaignWizard.orgId}. Action denied.`
        );
        throw new ForbiddenError(
          'You do not have permission to use this campaign for a new brand lift study.'
        );
      }

      // Check if the campaign has been submitted and has a submissionId
      if (campaignWizard.status !== 'SUBMITTED' || !campaignWizard.submissionId) {
        logger.warn(
          'Brand Lift POST: Source CampaignWizard is not submitted or lacks a submission ID.',
          {
            campaignWizardId: campaignWizard.id,
            status: campaignWizard.status,
            submissionId: campaignWizard.submissionId,
            userId: clerkUserId, // Log clerkUserId for context
          }
        );
        throw new BadRequestError(
          'The selected campaign must be submitted before a brand lift study can be created for it.'
        );
      }

      const submissionIdForBrandLift = campaignWizard.submissionId; // This is the Int ID from the verified CampaignWizard

      logger.info('Attempting to create BrandLiftStudy, linking to submission ID:', {
        userId: clerkUserId, // Log clerkUserId for context
        campaignWizardId,
        submissionId: submissionIdForBrandLift,
        orgId, // Log orgId being assigned
      });
      const newStudy = await prisma.brandLiftStudy.create({
        data: {
          name,
          submissionId: submissionIdForBrandLift,
          funnelStage,
          primaryKpi,
          secondaryKpis: secondaryKpis ?? [],
          status: PrismaBrandLiftStudyStatus.DRAFT,
          orgId: orgId, // Store the active orgId for ownership
        },
        // Include relations needed by Algolia transformer, if any, beyond direct fields
        // For example, if campaignName is needed from the related CampaignWizardSubmission
        include: {
          campaign: {
            // CampaignWizardSubmission
            select: {
              campaignName: true,
              wizard: {
                // CampaignWizard (though orgId is already on BrandLiftStudy)
                select: {
                  orgId: true, // Ensure this path is available if transformer relies on it
                },
              },
            },
          },
        },
      });
      logger.info('BrandLiftStudy created successfully in DB', {
        userId: clerkUserId,
        studyId: newStudy.id,
        orgId: newStudy.orgId,
      });

      // Index in Algolia
      if (newStudy) {
        try {
          logger.info(`[Algolia] Indexing newly created BrandLiftStudy ${newStudy.id}`);
          await addOrUpdateBrandLiftStudyInAlgolia(newStudy);
          logger.info(`[Algolia] Successfully indexed BrandLiftStudy ${newStudy.id}.`);
        } catch (algoliaError: unknown) {
          logger.error(
            `[Algolia] Failed to index BrandLiftStudy ${newStudy.id} after creation. DB operation was successful.`,
            {
              studyId: newStudy.id,
              errorName: (algoliaError as Error).name,
              errorMessage: (algoliaError as Error).message,
            }
          );
          // Non-critical error for the main POST operation
        }
      }

      return NextResponse.json(newStudy, { status: 201 });
    },
    error => handleApiError(error, req)
  );
}

export async function GET(req: NextRequest) {
  return tryCatch(
    async () => {
      const { userId: clerkUserId } = await auth(); // Renamed
      if (!clerkUserId) throw new UnauthenticatedError('Authentication required.'); // Updated

      const { searchParams } = new URL(req.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      const validation = listStudiesQuerySchema.safeParse(queryParams);

      if (!validation.success) {
        logger.warn('Invalid query parameters for fetching studies', {
          errors: validation.error.errors,
          userId: clerkUserId, // Log clerkUserId
        });
        throw new ZodValidationError(validation.error.errors);
      }

      const { campaignId: campaignIdQuery } = validation.data; // This is now potentially a string from query

      // Fetch internal user ID
      const userRecord = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      if (!userRecord) {
        throw new NotFoundError('User not found for fetching studies.');
      }
      const internalUserId = userRecord.id;

      // Base whereClause to filter by user
      const whereClause: Prisma.BrandLiftStudyWhereInput = {
        campaign: {
          userId: internalUserId,
        },
      };

      if (campaignIdQuery !== undefined) {
        // If campaignIdQuery is from listStudiesQuerySchema, it's coerced to number.
        // But the BrandLiftStudy.submissionId (what it links to) is Int.
        // And if campaignIdQuery was meant to be a CampaignWizard UUID (string), this is a mismatch.
        // The selectable list now returns CampaignWizard UUIDs (string).
        // This GET endpoint for surveys probably doesn't need to filter by a specific campaignId UUID from CampaignWizard
        // as it's already scoped by user. If filtering by a campaign is needed, it should be by submissionId (Int).
        // For now, assuming campaignIdQuery (if present) is the INT submissionId.
        whereClause.submissionId = campaignIdQuery;
      }

      logger.info('Fetching BrandLiftStudies', { userId: clerkUserId, whereClause }); // Log clerkUserId
      const studies = await prisma.brandLiftStudy.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          // Include campaign name for context if needed
          campaign: {
            select: { campaignName: true },
          },
        },
      });
      logger.info(`Successfully fetched ${studies.length} BrandLiftStudies`, {
        userId: clerkUserId, // Log clerkUserId
        count: studies.length,
      });
      // Wrap the response in the expected { success: true, data: ... } structure
      return NextResponse.json({ success: true, data: studies });
    },
    error => handleApiError(error, req)
  ); // Pass req to error handler
}

// Note: Specific GET by ID (/{studyId}) and PUT (/{studyId}) would typically be in a
// dynamic route file like /api/brand-lift/surveys/[studyId]/route.ts
// For now, all survey-related root operations are in this file.
