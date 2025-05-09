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
  DatabaseError,
  ZodValidationError,
} from '@/lib/errors'; // Ensure all used errors are imported
import { prisma } from '@/lib/db';
import { BrandLiftStudyData } from '@/types/brand-lift'; // Removed BrandLiftStudyStatus
import {
  BrandLiftStudyStatus as PrismaBrandLiftStudyStatus,
  SubmissionStatus,
} from '@prisma/client';
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
      const { userId: clerkUserId } = await auth(); // Renamed
      if (!clerkUserId) throw new UnauthenticatedError('Authentication required.'); // Updated

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

      // Find the CampaignWizard record by its UUID and user
      const campaignWizard = await prisma.campaignWizard.findFirst({
        where: {
          id: campaignWizardId, // This is the UUID from the form
          userId: internalUserId,
        },
        select: { id: true, name: true }, // Select enough to identify it, or what's needed
      });

      if (!campaignWizard) {
        logger.error('CampaignWizard (source) not found or unauthorized access attempt', {
          campaignWizardId,
          userId: clerkUserId,
        });
        throw new NotFoundError('Source campaign not found or not accessible');
      }

      // IMPORTANT ASSUMPTION: Find or create a CampaignWizardSubmission linked to this CampaignWizard.
      // For MVP, let's assume a CampaignWizardSubmission with the same name and userId implies linkage.
      // This is a simplification and might need a more robust linking mechanism (e.g., a direct relation or a status that triggers submission creation).
      let submission = await prisma.campaignWizardSubmission.findFirst({
        where: {
          // campaignName: campaignWizard.name, // This might not be unique enough alone
          // userId: internalUserId, // Already filtered by this on CampaignWizard
          // A more robust link would be a direct foreign key if one existed from CampaignWizard to CampaignWizardSubmission
          // Or if CampaignWizard ID was used to create/find the submission.
          // For now, we can attempt to find a submission by name that matches the wizard and user.
          // THIS IS A MAJOR SIMPLIFICATION AND POTENTIAL POINT OF FAILURE/MISMATCH
          // A better approach would be for the CampaignWizard to have a submissionId field once submitted.
          // Or the selectable list provides submission IDs directly if it lists submissions.
          campaignName: campaignWizard.name, // Trying to link by name and user
          userId: internalUserId,
        },
        select: { id: true },
      });

      if (!submission) {
        // If no submission exists, this flow is problematic. For Brand Lift, a SUBMITTED campaign state is usually prerequisite.
        // The previous query for CampaignWizard didn't check its status. Ideally, only selectable/submitted wizards lead here.
        // Forcing an error now, as a BrandLiftStudy MUST link to a CampaignWizardSubmission.id (Int)
        logger.error(
          'No corresponding CampaignWizardSubmission found for the selected CampaignWizard',
          {
            campaignWizardId: campaignWizard.id,
            campaignWizardName: campaignWizard.name,
            userId: clerkUserId,
          }
        );
        throw new NotFoundError(
          'Could not find a finalized submission for the selected campaign. Please ensure the campaign is submitted.'
        );
      }
      const submissionIdForBrandLift = submission.id; // This is the Int ID

      logger.info('Attempting to create BrandLiftStudy, linking to submission ID:', {
        userId: clerkUserId,
        campaignWizardId,
        submissionId: submissionIdForBrandLift,
      });
      const newStudy = await prisma.brandLiftStudy.create({
        data: {
          name,
          submissionId: submissionIdForBrandLift, // Use the Int ID of the CampaignWizardSubmission
          funnelStage,
          primaryKpi,
          secondaryKpis: secondaryKpis ?? [],
          status: PrismaBrandLiftStudyStatus.DRAFT,
          // organizationId: orgId, // Removed organizationId
          // The link to user is via submissionId -> CampaignWizardSubmission.userId
        },
      });
      logger.info('BrandLiftStudy created successfully', {
        userId: clerkUserId,
        studyId: newStudy.id,
      }); // Log clerkUserId
      return NextResponse.json(newStudy, { status: 201 });
    },
    error => handleApiError(error, req)
  ); // Pass req to error handler
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
      return NextResponse.json(studies);
    },
    error => handleApiError(error, req)
  ); // Pass req to error handler
}

// Note: Specific GET by ID (/{studyId}) and PUT (/{studyId}) would typically be in a
// dynamic route file like /api/brand-lift/surveys/[studyId]/route.ts
// For now, all survey-related root operations are in this file.
