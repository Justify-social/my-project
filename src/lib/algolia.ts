import { algoliasearch } from 'algoliasearch';
import type { SearchClient } from 'algoliasearch'; // SearchIndex type is likely not needed directly with v5 client.
import type {
  CampaignWizard,
  BrandLiftStudy as PrismaBrandLiftStudy,
  CampaignWizardSubmission as PrismaCampaignWizardSubmission,
} from '@prisma/client'; // Assuming CampaignWizard is your Prisma model
import { EnumTransformers } from '@/utils/enum-transformers'; // For potential enum transformations
import { logger } from '@/utils/logger'; // Assuming you have a logger

// Configuration from environment variables
const appId =
  (typeof process !== 'undefined' &&
    (process as any).env &&
    (process as any).env.NEXT_PUBLIC_ALGOLIA_APP_ID) ||
  '';
const searchOnlyApiKey =
  (typeof process !== 'undefined' &&
    (process as any).env &&
    (process as any).env.NEXT_PUBLIC_ALGOLIA_API_KEY) ||
  '';
const adminApiKey =
  (typeof process !== 'undefined' &&
    (process as any).env &&
    (process as any).env.ALGOLIA_ADMIN_API_KEY) ||
  '';
const indexName = 'campaigns';

export const BRAND_LIFT_STUDIES_INDEX_NAME =
  process.env.ALGOLIA_BRAND_LIFT_STUDIES_INDEX_NAME || 'brand_lift_studies';

// Types will be inferred or temporarily 'any' to resolve import issues first
let searchClient: SearchClient | null = null;
let adminClient: SearchClient | null = null;

if (!appId) {
  logger.error('[Algolia] NEXT_PUBLIC_ALGOLIA_APP_ID is not set.');
} else {
  if (searchOnlyApiKey) {
    try {
      searchClient = algoliasearch(appId, searchOnlyApiKey);
      logger.info('[Algolia] Search client initialized.');
    } catch (e) {
      logger.error('[Algolia] Failed to initialize search client:', e);
      searchClient = null;
    }
  } else {
    logger.warn(
      '[Algolia] NEXT_PUBLIC_ALGOLIA_API_KEY is not set. Frontend search may not work as expected.'
    );
  }

  // Admin client initialization - SERVER-SIDE ONLY
  if (typeof window === 'undefined') {
    // Check if running on the server
    if (adminApiKey) {
      // adminApiKey here is the server's process.env.ALGOLIA_ADMIN_API_KEY
      try {
        adminClient = algoliasearch(appId, adminApiKey);
        logger.info('[Algolia] Admin client initialized (server).');
      } catch (e) {
        logger.error('[Algolia] Failed to initialize admin client (server):', e);
        adminClient = null;
      }
    } else {
      // This error is now correctly scoped to the server if the key is missing there.
      logger.error(
        '[Algolia] ALGOLIA_ADMIN_API_KEY is not set on the server. Indexing operations will fail.'
      );
    }
  }
  // On the client-side, adminClient will remain null.
  // The problematic else block that caused client-side errors for the admin key is now removed
  // from client-side execution.
}

// Interface for Campaign search results
export interface CampaignSearchResult {
  id: string;
  campaignName: string;
  description?: string;
  platform?: string;
  brand?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  objectID: string;
  timeZone?: string;
  currency?: string;
  totalBudget?: number;
  socialMediaBudget?: number;
  primaryKPI?: string;
}

// Interface for the structure of objects in Algolia
// This should align with what your frontend search expects and what you index.
export interface CampaignAlgoliaRecord {
  objectID: string; // Must be unique, typically your campaign.id
  id: string;
  orgId?: string; // Added for organization scoping
  campaignName: string;
  description: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  primaryKPI?: string;
  brand?: string;
  // Add any other fields that need to be searchable or displayable from Algolia
  // For example, from your CampaignSearchResult interface:
  platform?: string;
  currency?: string;
  totalBudget?: number;
  socialMediaBudget?: number;
}

export interface BrandLiftStudyAlgoliaRecord {
  objectID: string; // Typically BrandLiftStudy.id
  id: string;
  orgId: string; // Crucial for multi-tenancy
  name: string;
  studyStatus: string; // e.g., DRAFT, COLLECTING, COMPLETED
  funnelStage?: string;
  primaryKpi?: string;
  secondaryKpis?: string[];
  campaignSubmissionId: number; // Link to CampaignWizardSubmission
  campaignName?: string; // Denormalized for easier display/filtering
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Add any other relevant fields from BrandLiftStudy model
}

/**
 * Transforms a CampaignWizard Prisma object (or similar) into the format for Algolia.
 * This is the SSOT for how campaign data is structured in Algolia.
 */
export function transformCampaignForAlgolia(campaign: CampaignWizard): CampaignAlgoliaRecord {
  const frontendReady = EnumTransformers.transformObjectFromBackend(campaign) as any;
  const record: CampaignAlgoliaRecord = {
    objectID: campaign.id,
    id: campaign.id,
    orgId: campaign.orgId ?? undefined, // Handle potential null from Prisma type
    campaignName: frontendReady.name || 'Unknown Campaign',
    description: frontendReady.businessGoal || '',
    status: frontendReady.status ? String(frontendReady.status).toUpperCase() : undefined,
    startDate:
      frontendReady.startDate instanceof Date ? frontendReady.startDate.toISOString() : undefined,
    endDate:
      frontendReady.endDate instanceof Date ? frontendReady.endDate.toISOString() : undefined,
    timeZone: frontendReady.timeZone || undefined,
    primaryKPI: frontendReady.primaryKPI || undefined,
    brand: frontendReady.brand || undefined,
    platform: frontendReady.platform ? String(frontendReady.platform) : undefined,
    currency: frontendReady.budget?.currency || undefined,
    totalBudget:
      frontendReady.budget?.total !== undefined ? Number(frontendReady.budget.total) : undefined,
    socialMediaBudget:
      frontendReady.budget?.socialMedia !== undefined
        ? Number(frontendReady.budget.socialMedia)
        : undefined,
  };
  return record;
}

/**
 * Indexes a single campaign to Algolia (Add or Update).
 */
export async function addOrUpdateCampaignInAlgolia(campaignData: CampaignWizard): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for add/update.');
    throw new Error('Algolia admin client not configured.');
  }
  const algoliaRecord = transformCampaignForAlgolia(campaignData);
  try {
    logger.info(`[Algolia] Saving object to index '${indexName}'`, {
      objectID: algoliaRecord.objectID,
    });
    const response = await adminClient.saveObject({
      indexName,
      body: algoliaRecord as unknown as Record<string, unknown>,
    });
    await adminClient.waitForTask({ indexName, taskID: response.taskID });
    logger.info(`[Algolia] Successfully saved object ${algoliaRecord.objectID}`);
  } catch (error) {
    logger.error('[Algolia] Error saving object', { objectID: algoliaRecord.objectID, error });
    throw error;
  }
}

/**
 * Deletes a single campaign from Algolia by its objectID.
 */
export async function deleteCampaignFromAlgolia(objectID: string): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for delete.');
    throw new Error('Algolia admin client not configured.');
  }
  try {
    logger.info(`[Algolia] Deleting object from index '${indexName}'`, { objectID });
    const response = await adminClient.deleteObject({ indexName, objectID });
    await adminClient.waitForTask({ indexName, taskID: response.taskID });
    logger.info(`[Algolia] Successfully deleted object ${objectID}`);
  } catch (error) {
    logger.error('[Algolia] Error deleting object', { objectID, error });
    if ((error as any).status === 404) {
      logger.warn(`[Algolia] Object ${objectID} not found for deletion, likely already deleted.`);
      return;
    }
    throw error;
  }
}

/**
 * Clears all objects from the Algolia index and re-indexes the provided campaigns.
 * Primarily for full re-sync scripts.
 */
export async function reindexAllCampaigns(campaigns: CampaignWizard[]): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for re-index.');
    throw new Error('Algolia admin client not configured.');
  }
  try {
    logger.info(`[Algolia] Clearing all objects from index '${indexName}'...`);
    const clearResponse = await adminClient.clearObjects({ indexName });
    await adminClient.waitForTask({ indexName, taskID: clearResponse.taskID });
    logger.info(`[Algolia] Index '${indexName}' cleared successfully.`);

    if (campaigns && campaigns.length > 0) {
      const algoliaRecords = campaigns.map(transformCampaignForAlgolia);
      logger.info(`[Algolia] Indexing ${algoliaRecords.length} campaigns...`);
      const saveResponse = await adminClient.saveObjects({
        indexName: indexName,
        objects: algoliaRecords as unknown as Array<Record<string, unknown>>,
      });
      if (Array.isArray(saveResponse) && saveResponse.length > 0 && saveResponse[0].taskID) {
        await adminClient.waitForTask({ indexName, taskID: saveResponse[0].taskID });
      } else if (!Array.isArray(saveResponse) && (saveResponse as any).taskID) {
        await adminClient.waitForTask({ indexName, taskID: (saveResponse as any).taskID });
      }
      logger.info(`[Algolia] Successfully indexed ${algoliaRecords.length} campaigns.`);
    } else {
      logger.info('[Algolia] No campaigns provided to index after clearing.');
    }
  } catch (error) {
    logger.error('[Algolia] Error during full re-indexing process', { error });
    throw error;
  }
}

/**
 * Searches campaigns in Algolia.
 */
export async function searchAlgoliaCampaigns(
  query: string,
  orgId?: string
): Promise<CampaignAlgoliaRecord[]> {
  if (!searchClient) {
    logger.warn('[Algolia] Search client not initialized. Returning empty search results.');
    return [];
  }
  if (!query || query.trim() === '') {
    // Optionally, if orgId is provided, we could return all items for that org with an empty query
    // For now, requiring a query string.
    return [];
  }
  const fetchTimerLabel = `[Algolia SDK] Search Campaigns: ${query} (Org: ${orgId || 'any'})`;
  console.time(fetchTimerLabel);
  try {
    const searchParams: Record<string, any> = { query };
    if (orgId) {
      searchParams.filters = `orgId:'${orgId}'`;
    }
    const { hits } = await searchClient.searchSingleIndex<CampaignAlgoliaRecord>({
      indexName,
      searchParams,
    });
    return hits;
  } catch (error) {
    logger.error('[Algolia] Error searching campaigns with SDK', { query, orgId, error });
    return [];
  } finally {
    console.timeEnd(fetchTimerLabel);
  }
}

/**
 * Searches Brand Lift Studies in Algolia.
 */
export async function searchAlgoliaBrandLiftStudies(
  query: string,
  orgId?: string
): Promise<BrandLiftStudyAlgoliaRecord[]> {
  if (!searchClient) {
    logger.warn(
      '[Algolia] Search client not initialized. Returning empty search results for BrandLiftStudies.'
    );
    return [];
  }
  if (!query || query.trim() === '') {
    return [];
  }
  const fetchTimerLabel = `[Algolia SDK] Search BrandLiftStudies: ${query} (Org: ${orgId || 'any'})`;
  console.time(fetchTimerLabel);
  try {
    const searchParams: Record<string, any> = { query };
    if (orgId) {
      searchParams.filters = `orgId:'${orgId}'`;
    }
    const { hits } = await searchClient.searchSingleIndex<BrandLiftStudyAlgoliaRecord>({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
      searchParams,
    });
    return hits;
  } catch (error) {
    logger.error('[Algolia] Error searching BrandLiftStudies with SDK', { query, orgId, error });
    return [];
  } finally {
    console.timeEnd(fetchTimerLabel);
  }
}

export const getAlgoliaSearchClient = () => {
  if (!searchClient) {
    logger.error('[Algolia] Search client not available. Check ENV variables.');
  }
  return searchClient;
};

export const algoliaFrontendConfig = {
  appId: appId || '',
  apiKey: searchOnlyApiKey || '',
  indexName: indexName,
};

/**
 * Utility function to index multiple objects to an Algolia index in a single batch operation.
 * @param objects Array of objects to index
 * @param indexName Name of the Algolia index to target
 */
export async function indexObjects<T extends { objectID: string }>(
  objects: T[],
  indexName: string
): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for batch indexing.');
    throw new Error('Algolia admin client not configured.');
  }

  if (!objects || objects.length === 0) {
    logger.info(`[Algolia] No objects provided to index for '${indexName}'`);
    return;
  }

  try {
    logger.info(`[Algolia] Batch indexing ${objects.length} objects to '${indexName}'...`);
    const response = await adminClient.saveObjects({
      indexName,
      objects: objects as unknown as Array<Record<string, unknown>>,
    });

    if (Array.isArray(response) && response.length > 0 && response[0].taskID) {
      await adminClient.waitForTask({ indexName, taskID: response[0].taskID });
    } else if (!Array.isArray(response) && (response as any).taskID) {
      await adminClient.waitForTask({ indexName, taskID: (response as any).taskID });
    }

    logger.info(
      `[Algolia] Successfully indexed ${objects.length} objects to index '${indexName}'.`
    );
  } catch (error) {
    logger.error('[Algolia] Error during batch indexing', { indexName, error });
    throw error;
  }
}

export function transformBrandLiftStudyToAlgoliaRecord(
  study: PrismaBrandLiftStudy & {
    campaign?: { campaignName?: string | null; wizard?: { orgId?: string | null } | null } | null;
  },
  orgId: string // Explicitly pass orgId resolved by the caller
): BrandLiftStudyAlgoliaRecord {
  // Transform the study data to the Algolia record format
  const record: BrandLiftStudyAlgoliaRecord = {
    objectID: study.id,
    id: study.id,
    orgId: orgId, // Use the explicitly passed orgId
    name: study.name || 'Untitled Study',
    studyStatus: study.status ? String(study.status) : 'DRAFT',
    funnelStage: study.funnelStage || undefined,
    primaryKpi: study.primaryKpi || undefined,
    secondaryKpis: (study.secondaryKpis as string[]) || [],
    campaignSubmissionId: study.submissionId,
    campaignName: study.campaign?.campaignName || undefined,
    createdAt:
      study.createdAt instanceof Date ? study.createdAt.toISOString() : new Date().toISOString(),
    updatedAt:
      study.updatedAt instanceof Date ? study.updatedAt.toISOString() : new Date().toISOString(),
  };

  return record;
}

// Placeholder for addOrUpdateBrandLiftStudyInAlgolia
export async function addOrUpdateBrandLiftStudyInAlgolia(
  studyData: PrismaBrandLiftStudy & {
    campaign?: { campaignName?: string | null; wizard?: { orgId?: string | null } | null } | null;
  }
): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for BrandLiftStudy add/update.');
    throw new Error('Algolia admin client not configured.');
  }
  // TODO: Resolve orgId carefully here if not directly on studyData, or ensure caller provides it
  // For now, assuming studyData.orgId exists or transformBrandLiftStudyToAlgoliaRecord handles it
  const resolvedOrgId = studyData.orgId || studyData.campaign?.wizard?.orgId;

  if (!resolvedOrgId) {
    logger.error('[Algolia] Missing orgId for BrandLiftStudy, cannot index.', {
      studyId: studyData.id,
    });
    // Depending on strictness, either throw or skip
    return; // Or throw new Error('Missing orgId for BrandLiftStudy');
  }
  const algoliaRecord = transformBrandLiftStudyToAlgoliaRecord(studyData, resolvedOrgId);
  try {
    logger.info(
      `[Algolia] Saving BrandLiftStudy object to index '${BRAND_LIFT_STUDIES_INDEX_NAME}'`,
      {
        objectID: algoliaRecord.objectID,
      }
    );
    const response = await adminClient.saveObject({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
      body: algoliaRecord as unknown as Record<string, unknown>,
    });
    await adminClient.waitForTask({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
      taskID: response.taskID,
    });
    logger.info(`[Algolia] Successfully saved BrandLiftStudy object ${algoliaRecord.objectID}`);
  } catch (error) {
    logger.error('[Algolia] Error saving BrandLiftStudy object', {
      objectID: algoliaRecord.objectID,
      error,
    });
    throw error;
  }
}

// Placeholder for deleteBrandLiftStudyFromAlgolia
export async function deleteBrandLiftStudyFromAlgolia(objectID: string): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for BrandLiftStudy delete.');
    throw new Error('Algolia admin client not configured.');
  }
  try {
    logger.info(
      `[Algolia] Deleting BrandLiftStudy object from index '${BRAND_LIFT_STUDIES_INDEX_NAME}'`,
      { objectID }
    );
    const response = await adminClient.deleteObject({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
      objectID,
    });
    await adminClient.waitForTask({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
      taskID: response.taskID,
    });
    logger.info(`[Algolia] Successfully deleted BrandLiftStudy object ${objectID}`);
  } catch (error) {
    logger.error('[Algolia] Error deleting BrandLiftStudy object', { objectID, error });
    if ((error as any).status === 404) {
      logger.warn(
        `[Algolia] BrandLiftStudy object ${objectID} not found for deletion, likely already deleted.`
      );
      return;
    }
    throw error;
  }
}

// Placeholder for reindexAllBrandLiftStudies
export async function reindexAllBrandLiftStudies(
  studies: (PrismaBrandLiftStudy & {
    campaign?: { campaignName?: string | null; wizard?: { orgId?: string | null } | null } | null;
  })[]
): Promise<void> {
  if (!adminClient) {
    logger.error('[Algolia] Admin client not initialized for BrandLiftStudy re-index.');
    throw new Error('Algolia admin client not configured.');
  }
  try {
    logger.info(`[Algolia] Clearing all objects from index '${BRAND_LIFT_STUDIES_INDEX_NAME}'...`);
    const clearResponse = await adminClient.clearObjects({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
    });
    await adminClient.waitForTask({
      indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
      taskID: clearResponse.taskID,
    });
    logger.info(`[Algolia] Index '${BRAND_LIFT_STUDIES_INDEX_NAME}' cleared successfully.`);

    if (studies && studies.length > 0) {
      const algoliaRecords = studies
        .map(study => {
          const orgId = study.orgId || study.campaign?.wizard?.orgId; // Example resolution
          if (!orgId) {
            logger.warn('[Algolia] Skipping study in reindex due to missing orgId', {
              studyId: study.id,
            });
            return null;
          }
          return transformBrandLiftStudyToAlgoliaRecord(study, orgId);
        })
        .filter(record => record !== null) as BrandLiftStudyAlgoliaRecord[];

      if (algoliaRecords.length === 0) {
        logger.info(
          '[Algolia] No valid BrandLiftStudy records to index after transformation during reindex.'
        );
        return;
      }

      logger.info(`[Algolia] Indexing ${algoliaRecords.length} BrandLiftStudies...`);
      const saveResponse = await adminClient.saveObjects({
        indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
        objects: algoliaRecords as unknown as Array<Record<string, unknown>>,
      });
      // waitForTask logic as in reindexAllCampaigns
      if (Array.isArray(saveResponse) && saveResponse.length > 0 && saveResponse[0].taskID) {
        await adminClient.waitForTask({
          indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
          taskID: saveResponse[0].taskID,
        });
      } else if (!Array.isArray(saveResponse) && (saveResponse as any).taskID) {
        await adminClient.waitForTask({
          indexName: BRAND_LIFT_STUDIES_INDEX_NAME,
          taskID: (saveResponse as any).taskID,
        });
      }
      logger.info(`[Algolia] Successfully indexed ${algoliaRecords.length} BrandLiftStudies.`);
    } else {
      logger.info('[Algolia] No BrandLiftStudies provided to index after clearing.');
    }
  } catch (error) {
    logger.error('[Algolia] Error during full BrandLiftStudy re-indexing process', { error });
    throw error;
  }
}
