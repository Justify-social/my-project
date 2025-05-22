import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { NotFoundError, UnauthenticatedError, ForbiddenError, BadRequestError } from '@/lib/errors';
import { BrandLiftStudyData } from '@/types/brand-lift';

// Helper to check if the user is a Super Admin
async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
    try {
        const user = await clerkClient.users.getUser(clerkUserId);
        return user.publicMetadata?.role === 'super_admin';
    } catch (error) {
        logger.error('Error fetching user details from Clerk for Super Admin check', { clerkUserId, error });
        return false;
    }
}

export const GET = async (
    req: NextRequest,
    { params }: { params: { studyId: string } }
) => {
    try {
        const { userId: clerkUserId, orgId: userOrgId } = await auth();
        if (!clerkUserId) {
            throw new UnauthenticatedError('Authentication required.');
        }

        const { studyId } = params;
        if (!studyId) {
            throw new BadRequestError('Study ID is required.');
        }

        const study = await db.brandLiftStudy.findUnique({
            where: { id: studyId },
            include: {
                campaign: { // CampaignWizardSubmission
                    select: {
                        campaignName: true,
                        wizard: { // CampaignWizard
                            select: {
                                id: true, // This is the Campaign UUID (string)
                            },
                        },
                    },
                },
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        options: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                // Include other relations if needed for the export
            },
        });

        if (!study) {
            throw new NotFoundError('Brand Lift Study not found.');
        }

        // Authorization: Allow if user is Super Admin OR if they belong to the study's organization
        const superAdminCheck = await isSuperAdmin(clerkUserId);
        if (!superAdminCheck && study.orgId !== userOrgId) {
            logger.warn('User attempted to export study structure from another org without Super Admin role', {
                studyId,
                userId: clerkUserId,
                userOrgId,
                studyOrgId: study.orgId,
            });
            throw new ForbiddenError('You do not have permission to export this study structure.');
        }

        // Prepare the data for export, shaping it like BrandLiftStudyData
        const exportData: Partial<BrandLiftStudyData> = {
            id: study.id,
            name: study.name,
            campaignId: study.submissionId.toString(), // This is CampaignWizardSubmission.id
            status: study.status,
            funnelStage: study.funnelStage,
            primaryKpi: study.primaryKpi,
            secondaryKpis: study.secondaryKpis as string[],
            createdAt: study.createdAt,
            updatedAt: study.updatedAt,
            cintProjectId: study.cintProjectId,
            cintTargetGroupId: study.cintTargetGroupId,
            orgId: study.orgId,
            campaign: study.campaign
                ? {
                    campaignName: study.campaign.campaignName,
                    uuid: study.campaign.wizard?.id, // CampaignWizard.id (string UUID)
                }
                : undefined,
            questions: study.questions.map(q => ({
                ...q,
                options: q.options.map(o => ({ ...o, questionId: q.id })),
            })),
        };

        logger.info('Exporting Brand Lift Study structure as JSON', { studyId, userId: clerkUserId });

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="study_${studyId}_structure.json"`,
            },
        });

    } catch (error: unknown) {
        return handleApiError(error, req);
    }
}; 