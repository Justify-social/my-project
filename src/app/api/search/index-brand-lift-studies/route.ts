import { NextRequest, NextResponse } from 'next/server';
import {
  reindexAllBrandLiftStudies,
  // transformBrandLiftStudyToAlgoliaRecord, // No longer needed here
  // BRAND_LIFT_STUDIES_INDEX_NAME, // No longer needed directly here, reindexAllBrandLiftStudies uses it
  // BrandLiftStudyAlgoliaRecord, // Type not directly needed here for requests/responses
} from '@/lib/algolia';
import { prisma } from '@/lib/prisma';
import {} from // BrandLiftStudy as PrismaBrandLiftStudy, // Removed unused alias
// CampaignWizardSubmission as PrismaCampaignWizardSubmission, // Not directly used if studiesFromDb has correct includes
// CampaignWizard as PrismaCampaignWizard, // Not directly used
'@prisma/client';
import { logger } from '@/lib/logger';
import { auth } from '@clerk/nextjs/server';
// User as PrismaUser, // Not directly used

export async function GET(_request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const { has } = await auth();
    if (!has({ permission: 'org:admin' })) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    logger.info(
      '[API /search/index-brand-lift-studies] GET request received - Starting BrandLiftStudy re-indexing...'
    );

    const studiesFromDb = await prisma.brandLiftStudy.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        campaign: {
          // CampaignWizardSubmission
          select: {
            campaignName: true,
            wizard: {
              // CampaignWizard
              select: {
                // id: true, // Not strictly needed by reindexAllBrandLiftStudies if submissionId is the link
                orgId: true, // Crucial for orgId resolution in algolia.ts
                // userId: true // Not strictly needed by reindexAllBrandLiftStudies
              },
            },
          },
        },
      },
    });

    logger.info(
      `[API /search/index-brand-lift-studies] Found ${studiesFromDb.length} BrandLiftStudies in DB.`
    );

    if (!studiesFromDb.length) {
      return NextResponse.json({ warning: 'No BrandLiftStudies found to index.' }, { status: 200 });
    }

    // The transformation logic is now within reindexAllBrandLiftStudies
    // const algoliaRecords = studiesFromDb.map(study => {
    //     const orgIdForRecord = study.orgId || study.campaign?.wizard?.orgId;
    //     if (!orgIdForRecord) {
    //         logger.warn(`[API /search/index-brand-lift-studies] Study ${study.id} is missing a resolvable orgId. Skipping Algolia indexing.`);
    //         return null;
    //     }
    //     const typedStudy = study as PrismaBrandLiftStudy & {
    //         campaign?: {
    //             campaignName: string,
    //             wizard?: { id: string, orgId?: string | null, userId?: string | null } | null
    //         } | null
    //     };
    //     return transformBrandLiftStudyToAlgoliaRecord(typedStudy, orgIdForRecord);
    // }).filter(record => record !== null) as BrandLiftStudyAlgoliaRecord[];

    // if (algoliaRecords.length === 0) {
    //     logger.info('[API /search/index-brand-lift-studies] No valid records to index after transformation.');
    //     return NextResponse.json({ warning: 'No valid BrandLiftStudies to index after transformation.' }, { status: 200 });
    // }

    logger.info(
      `[API /search/index-brand-lift-studies] Indexing ${studiesFromDb.length} fetched BrandLiftStudies...`
    );
    // Pass the raw studiesFromDb; reindexAllBrandLiftStudies will handle transformation and orgId resolution internally
    await reindexAllBrandLiftStudies(studiesFromDb as any); // Cast to any for now, will be fixed by Prisma types in algolia.ts for studies parameter

    logger.info('[API /search/index-brand-lift-studies] Indexing complete!');
    return NextResponse.json({
      success: true,
      message: `Successfully initiated indexing for ${studiesFromDb.length} BrandLiftStudies in Algolia.`,
    });
  } catch (error: unknown) {
    logger.error('[API /search/index-brand-lift-studies] Error reindexing BrandLiftStudies:', {
      error: (error as Error).message,
      stack: (error as Error)?.stack,
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reindex BrandLiftStudies.',
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}
