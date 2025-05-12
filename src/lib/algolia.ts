import { algoliasearch } from 'algoliasearch';
import type { SearchClient } from 'algoliasearch'; // SearchIndex type is likely not needed directly with v5 client.
import type { CampaignWizard } from '@prisma/client'; // Assuming CampaignWizard is your Prisma model
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

/**
 * Transforms a CampaignWizard Prisma object (or similar) into the format for Algolia.
 * This is the SSOT for how campaign data is structured in Algolia.
 */
export function transformCampaignForAlgolia(
  campaign: CampaignWizard // Or your primary campaign data type
): CampaignAlgoliaRecord {
  // Apply any necessary transformations (e.g., EnumTransformers, date formatting)
  // This logic should be robust and ensure all fields are correctly mapped.
  // Based on scripts/algolia/reindex-algolia.ts transformation:
  const frontendReady = EnumTransformers.transformObjectFromBackend(campaign) as any; // Cast as any for flexibility if not all fields match CampaignWizard

  const record: CampaignAlgoliaRecord = {
    objectID: campaign.id,
    id: campaign.id,
    campaignName: frontendReady.name || 'Unknown Campaign',
    description: frontendReady.businessGoal || '',
    status: frontendReady.status ? String(frontendReady.status).toUpperCase() : undefined, // Ensure canonical status
    startDate:
      frontendReady.startDate instanceof Date ? frontendReady.startDate.toISOString() : undefined,
    endDate:
      frontendReady.endDate instanceof Date ? frontendReady.endDate.toISOString() : undefined,
    timeZone: frontendReady.timeZone || undefined,
    primaryKPI: frontendReady.primaryKPI || undefined,
    brand: frontendReady.brand || undefined,
    platform: frontendReady.platform ? String(frontendReady.platform) : undefined, // Ensure string if it comes as enum object
    currency: frontendReady.budget?.currency || undefined,
    totalBudget:
      frontendReady.budget?.total !== undefined ? Number(frontendReady.budget.total) : undefined,
    socialMediaBudget:
      frontendReady.budget?.socialMedia !== undefined
        ? Number(frontendReady.budget.socialMedia)
        : undefined,
    // Ensure all fields from CampaignAlgoliaRecord are mapped here
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
    // Consider if not found should be an error or handled gracefully
    if ((error as any).status === 404) {
      logger.warn(`[Algolia] Object ${objectID} not found for deletion, likely already deleted.`);
      return; // Not an error if already gone
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
      // If saveResponse is BatchResponse[], then taskID is on each element.
      // Assuming we wait for the first task as representative for the batch.
      if (Array.isArray(saveResponse) && saveResponse.length > 0 && saveResponse[0].taskID) {
        await adminClient.waitForTask({ indexName, taskID: saveResponse[0].taskID });
      } else if (!Array.isArray(saveResponse) && (saveResponse as any).taskID) {
        // If it's a single response object with taskID (e.g. SaveObjectsResponse)
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
 * (This replaces the previous fetch-based searchCampaigns)
 */
export async function searchAlgoliaCampaigns(query: string): Promise<CampaignAlgoliaRecord[]> {
  if (!searchClient) {
    // Fallback to an empty array or throw error if search client isn't configured
    logger.warn('[Algolia] Search client not initialized. Returning empty search results.');
    return [];
  }
  if (!query || query.trim() === '') {
    return [];
  }
  const fetchTimerLabel = `[Algolia SDK] Search: ${query}`;
  console.time(fetchTimerLabel);
  try {
    const { hits } = await searchClient.searchSingleIndex<CampaignAlgoliaRecord>({
      indexName,
      searchParams: { query },
    });
    return hits;
  } catch (error) {
    logger.error('[Algolia] Error searching campaigns with SDK', { query, error });
    return [];
  } finally {
    console.timeEnd(fetchTimerLabel);
  }
}

// For potential use with react-instantsearch or direct client access if needed
// The searchClient is already initialized if keys are present.
export const getAlgoliaSearchClient = () => {
  if (!searchClient) {
    // This case should ideally be handled by ensuring env vars are set,
    // but provides a fallback or a point to throw a more critical error.
    logger.error('[Algolia] Search client not available. Check ENV variables.');
    // return null; or throw new Error('Algolia search client not configured');
  }
  return searchClient;
};

// This replaces the old algoliaConfig export if it was used for react-instantsearch
// For react-instantsearch-hooks-web, you usually pass the searchClient directly.
// If you need the config object for older versions or other uses:
export const algoliaFrontendConfig = {
  appId: appId || '',
  apiKey: searchOnlyApiKey || '',
  indexName: indexName,
};

// Note: The old `indexCampaigns` function that took `Partial<CampaignSearchResult>[]`
// and used fetch for batch and clear has been replaced by `reindexAllCampaigns` which takes Prisma objects.
// The old `searchCampaigns` that used fetch has been replaced by `searchAlgoliaCampaigns` using the SDK.
