import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler'; // Correct import path
import { tryCatch } from '@/lib/middleware/api/util-middleware';
import { UnauthenticatedError, ForbiddenError, NotFoundError, BadRequestError, DatabaseError, ZodValidationError } from '@/lib/errors'; // Ensure all used errors are imported
import { prisma } from '@/lib/db';
import { BrandLiftStudyData } from '@/types/brand-lift'; // Removed BrandLiftStudyStatus
import { BrandLiftStudyStatus as PrismaBrandLiftStudyStatus, SubmissionStatus } from '@prisma/client';
// import { hasPermission } from '@/lib/auth/permissions'; // Commented out - path needs verification

// Schema for creating a BrandLiftStudy
const createStudySchema = z.object({
    name: z.string().min(1, { message: 'Study name is required' }),
    campaignId: z.number().int({ message: 'Valid Campaign ID is required' }), // Assuming CampaignWizardSubmission uses Int ID based on schema
    funnelStage: z.string().min(1, { message: 'Funnel stage is required' }),
    primaryKpi: z.string().min(1, { message: 'Primary KPI is required' }),
    secondaryKpis: z.array(z.string()).optional(),
});

// Schema for query params when listing studies
const listStudiesQuerySchema = z.object({
    campaignId: z.coerce.number().int().optional(),
});

export async function POST(req: NextRequest) {
    return tryCatch(async () => {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) throw new UnauthenticatedError();

        const body = await req.json();
        const validation = createStudySchema.safeParse(body);
        if (!validation.success) throw new ZodValidationError(validation.error.errors);

        const { name, campaignId, funnelStage, primaryKpi, secondaryKpis } = validation.data;

        // Verify campaign exists and belongs to the user's organization/user scope
        const campaign = await prisma.campaignWizardSubmission.findFirst({
            where: {
                id: campaignId,
                userId: userId, // Verify campaign belongs to user
                submissionStatus: SubmissionStatus.submitted, // Ensure campaign is submitted
            },
            select: { id: true }
        });

        if (!campaign) {
            logger.error('Campaign not found or unauthorized access attempt', { campaignId, userId, orgId });
            throw new NotFoundError('Campaign not found or not accessible');
        }

        logger.info('Attempting to create BrandLiftStudy', { userId, orgId, campaignId });
        const newStudy = await prisma.brandLiftStudy.create({
            data: {
                name,
                submissionId: campaignId,
                funnelStage,
                primaryKpi,
                secondaryKpis: secondaryKpis ?? [],
                status: PrismaBrandLiftStudyStatus.DRAFT,
                organizationId: orgId,
            },
        });
        logger.info('BrandLiftStudy created successfully', { userId, orgId, studyId: newStudy.id });
        return NextResponse.json(newStudy, { status: 201 });
    }, (error) => handleApiError(error, req)); // Pass req to error handler
}

export async function GET(req: NextRequest) {
    return tryCatch(async () => {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) throw new UnauthenticatedError();

        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        const validation = listStudiesQuerySchema.safeParse(queryParams);

        if (!validation.success) {
            logger.warn('Invalid query parameters for fetching studies', { errors: validation.error.errors, orgId });
            throw new ZodValidationError(validation.error.errors);
        }

        const { campaignId } = validation.data;

        const whereClause: { organizationId: string; campaignId?: number } = {
            organizationId: orgId, // Always scope by organization
        };

        if (campaignId !== undefined) {
            // Verify campaign exists and belongs to user before using it in filter
            const campaignCheck = await prisma.campaignWizardSubmission.findFirst({
                where: {
                    id: campaignId,
                    userId: userId // Check user scope
                },
                select: { id: true }
            });
            if (!campaignCheck) {
                logger.warn('Attempted to filter studies by inaccessible campaign', { campaignId, userId, orgId });
                return NextResponse.json({ studies: [] }); // Return empty if campaign not accessible
            }
            whereClause.campaignId = campaignId;
        }

        logger.info('Fetching BrandLiftStudies', { userId, orgId, whereClause });
        const studies = await prisma.brandLiftStudy.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { // Include campaign name for context if needed
                campaign: {
                    select: { campaignName: true }
                }
            }
        });
        logger.info(`Successfully fetched ${studies.length} BrandLiftStudies`, { userId, orgId, count: studies.length });
        return NextResponse.json(studies);
    }, (error) => handleApiError(error, req)); // Pass req to error handler
}

// Note: Specific GET by ID (/{studyId}) and PUT (/{studyId}) would typically be in a
// dynamic route file like /api/brand-lift/surveys/[studyId]/route.ts
// For now, all survey-related root operations are in this file.
