// src/services/influencer/index.ts

// Import types and logger
import { InfluencerSummary, InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';
import { Platform as PlatformBackend, PrismaClient } from '@prisma/client';
// TODO: Add InsightIQ enrichment if needed for summaries
// Import needed service and mapping functions
import {
  getInsightIQProfiles,
  getSingleInsightIQProfileAnalytics,
  getProfileUniqueId,
} from '@/lib/insightiqService';
import { InsightIQProfile, InsightIQSearchProfile } from '@/types/insightiq';
import {
  mapInsightIQProfileToInfluencerProfileData,
  mapInsightIQProfileToInfluencerSummary,
  mapPrismaInfluencerToSummary,
} from '@/lib/data-mapping/influencer';
import { getInsightIQWorkPlatformId } from '@/lib/insightiqUtils';

const prisma = new PrismaClient();

// Define the expected structure for filters passed to the service
// Align this with the backend API query parameters currently supported
export interface GetInfluencersFilters {
  platforms?: PlatformEnum[];
  minFollowers?: number;
  maxFollowers?: number;
  isVerified?: boolean;
  locations?: string[];
}

// Define necessary InsightIQ filter type inline
interface InsightIQProfileFilters {
  platforms?: PlatformEnum[];
  follower_count?: { min?: number; max?: number };
  is_verified?: boolean;
  locations?: string[]; // Align with GetInfluencersFilters
}

/**
 * Defines the interface for the influencer service.
 * Ensures the real API implementation adheres to the contract.
 */
export interface IInfluencerService {
  getInfluencers(params: {
    filters?: GetInfluencersFilters; // Use defined filter type
    pagination?: { page: number; limit: number };
  }): Promise<{
    influencers: InfluencerSummary[];
    total: number;
    page: number;
    limit: number;
  }>;

  getInfluencerById(id: string): Promise<InfluencerProfileData | null>;

  getInfluencerByIdentifier(
    identifier: string,
    platformId: string
  ): Promise<InfluencerProfileData | null>;

  getInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]>;

  getProcessedInfluencerProfileByIdentifier(
    identifier: string
  ): Promise<InfluencerProfileData | null>;

  // Add interface for the new list function
  getProcessedInfluencerList(params: {
    filters?: GetInfluencersFilters;
    pagination?: { page: number; limit: number };
  }): Promise<{
    influencers: InfluencerSummary[];
    total: number;
    page: number;
    limit: number;
  }>;

  // Add interface for summaries by IDs
  getProcessedInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]>;

  // Add interfaces for persistence methods
  saveProfileIdToDatabase(
    profileData: Pick<
      InfluencerProfileData,
      'id' | 'handle' | 'platformSpecificId' | 'name' | 'avatarUrl' | 'platforms'
    > // Add 'id' (unique identifier)
  ): Promise<void>;

  getProfileIdsFromDatabase(
    uniqueIds: string[] // Lookup by unique ID (external_id or composite)
  ): Promise<Record<string, string | null>>; // Map unique ID -> platformSpecificId
}

// --- Helper to get the unique ID (INTERNAL) ---
// REMOVE THIS INTERNAL VERSION - Use the exported one from insightiqService
/*
const getProfileUniqueId = (profile: InsightIQProfile | InsightIQSearchProfile): string => {
  if (profile.platform_username && profile.work_platform?.id) {
    return `${profile.platform_username}:::${profile.work_platform.id}`;
  }
  if (profile.url && profile.work_platform?.id) {
    try {
      const urlObject = new URL(profile.url);
      const pathSegments = urlObject.pathname.split('/').filter(Boolean);
      const username = pathSegments[pathSegments.length - 1];
      if (username) {
        return `${username}:::${profile.work_platform.id}`;
      }
    } catch (e) {
      logger.warn(`[getProfileUniqueId] Failed to parse username from URL: ${profile.url}`);
    }
  }
  logger.error(`[getProfileUniqueId] Profile lacks usable unique identifier`, { profile });
  throw new Error('Profile lacks required identifiers (username or URL and platform ID)');
};
*/

// --- Real API Service Implementation ---

// Helper function to construct query strings safely
const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle array parameters (e.g., platforms=INSTAGRAM,TIKTOK)
        if (value.length > 0) {
          query.append(key, value.join(','));
        }
      } else {
        query.append(key, String(value));
      }
    }
  });
  return query.toString();
};

// Implementation hitting our backend API endpoints
const apiService: IInfluencerService = {
  getInfluencers: async params => {
    const { filters = {}, pagination = {} } = params;
    const queryParams = { ...filters, ...pagination };
    const queryString = buildQueryString(queryParams);
    const url = `/api/influencers?${queryString}`;

    logger.info(`[influencerService] Calling GET ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error
        throw new Error(
          `API Error (${response.status}): ${errorData?.error || response.statusText}`
        );
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(`API returned error: ${data.error || 'Unknown API error'}`);
      }
      // TODO: Add response validation with Zod later if needed
      return {
        influencers: data.influencers || [],
        total: data.pagination?.totalInfluencers ?? 0,
        page: data.pagination?.currentPage ?? 1,
        limit: data.pagination?.limit ?? 12,
      };
    } catch (error) {
      logger.error(`[influencerService] Failed getInfluencers call to ${url}:`, error);
      throw error; // Re-throw for the caller to handle
    }
  },

  getInfluencerById: async id => {
    const url = `/api/influencers/${id}`;
    logger.info(`[influencerService] Calling GET ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null; // Not found is not an error here
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error (${response.status}): ${errorData?.error || response.statusText}`
        );
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(`API returned error: ${data.error || 'Unknown API error'}`);
      }
      // TODO: Add response validation with Zod later if needed
      return data.data as InfluencerProfileData | null; // Assuming data is nested under 'data' key
    } catch (error) {
      logger.error(`[influencerService] Failed getInfluencerById call to ${url}:`, error);
      throw error; // Re-throw for the caller to handle
    }
  },

  getInfluencerByIdentifier: async (identifier, platformId) => {
    // Construct query params for the backend API
    const queryString = buildQueryString({ platformId });
    const url = `/api/influencers/${identifier}?${queryString}`;
    logger.info(`[influencerService] Calling GET ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null; // Not found
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error (${response.status}): ${errorData?.error || response.statusText}`
        );
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(`API returned error: ${data.error || 'Unknown API error'}`);
      }
      return data.data as InfluencerProfileData | null;
    } catch (error) {
      logger.error(`[influencerService] Failed getInfluencerByIdentifier call to ${url}:`, error);
      throw error; // Re-throw
    }
  },

  async getProcessedInfluencerProfileByIdentifier(
    identifier: string
  ): Promise<InfluencerProfileData | null> {
    logger.info(`[influencerService] Processing DETAILED request for identifier: ${identifier}`);
    try {
      if (!identifier) {
        logger.warn(`[influencerService] Missing identifier`);
        return null;
      }

      const profile: InsightIQProfile | null = await getSingleInsightIQProfileAnalytics(identifier);

      if (!profile) {
        logger.warn(`[influencerService] Detailed fetch failed for identifier: ${identifier}`);
        return null;
      }

      const returnedHandle = profile.platform_username;
      let requestedHandle: string | null = null;
      if (identifier.includes(':::')) {
        requestedHandle = identifier.split(':::')[0];
      }

      if (
        requestedHandle &&
        (!returnedHandle || requestedHandle.toLowerCase() !== returnedHandle.toLowerCase())
      ) {
        logger.error(
          `[getProcessedInfluencerProfileByIdentifier] Mismatch Error! Requested handle '${requestedHandle}' (from identifier: ${identifier}) but fetch returned profile with handle: '${returnedHandle}'`
        );
        return null;
      }

      const profileData = mapInsightIQProfileToInfluencerProfileData(profile, identifier);
      if (!profileData) {
        logger.warn(
          `[getProcessedInfluencerProfileByIdentifier] map function returned null for identifier: ${identifier}`
        );
        return null;
      }

      if (profileData.platformSpecificId) {
        await this.saveProfileIdToDatabase({
          id: profileData.id,
          handle:
            profile.platform_username ?? requestedHandle ?? identifier.split(':::')[0] ?? 'unknown',
          platformSpecificId: profileData.platformSpecificId,
          name: profileData.name,
          avatarUrl: profileData.avatarUrl,
          platforms: profileData.platforms,
        });
      } else {
        logger.warn(
          `[influencerService] Detailed profile fetch for ${identifier} did NOT return platformSpecificId. Cannot save to DB.`
        );
      }

      return profileData;
    } catch (error) {
      logger.error(
        `[influencerService] Error processing detailed profile for ${identifier}:`,
        error
      );
      throw error;
    }
  },

  async getProcessedInfluencerList(params: {
    filters?: GetInfluencersFilters;
    pagination?: { page: number; limit: number };
  }): Promise<{
    influencers: InfluencerSummary[];
    total: number;
    page: number;
    limit: number;
  }> {
    logger.info('[influencerService] Processing list request (using /search)', params);
    try {
      const { filters = {}, pagination = { page: 1, limit: 12 } } = params;
      const offset = (pagination.page - 1) * pagination.limit;

      const insightIQFilters: InsightIQProfileFilters = {
        platforms: filters.platforms,
        follower_count: {
          min: filters.minFollowers,
          max: filters.maxFollowers,
        },
        is_verified: filters.isVerified,
        locations: filters.locations,
      };

      const insightIQResponse = await getInsightIQProfiles({
        limit: pagination.limit,
        offset: offset,
        filters: insightIQFilters,
      });

      if (!insightIQResponse?.data) {
        logger.warn('[influencerService] Received null or empty data from getInsightIQProfiles');
        return { influencers: [], total: 0, page: pagination.page, limit: pagination.limit };
      }

      logger.info(
        `[influencerService] Received ${insightIQResponse.data.length} profiles from InsightIQ /search`
      );

      const summaries: InfluencerSummary[] = [];
      insightIQResponse.data.forEach((profileFromSearch: InsightIQSearchProfile) => {
        const profile = profileFromSearch;
        try {
          const id = getProfileUniqueId(profile);
          const summaryBase = mapInsightIQProfileToInfluencerSummary(profile);
          if (summaryBase) {
            summaries.push({
              ...summaryBase,
              id: id,
              profileId: id,
              workPlatformId: profile.work_platform?.id ?? null,
            });
          }
        } catch (e) {
          logger.warn(
            `[getProcessedInfluencerList] Skipping profile due to error in getProfileUniqueId or mapping`,
            { error: e, profileData: profile }
          );
        }
      });

      const uniqueIdsFromList = summaries.map(s => s.id).filter(Boolean);
      if (uniqueIdsFromList.length > 0) {
        const storedPlatformIds = await this.getProfileIdsFromDatabase(uniqueIdsFromList);
        summaries.forEach((summary: InfluencerSummary) => {
          if (summary.id && !summary.platformSpecificId && storedPlatformIds[summary.id]) {
            summary.platformSpecificId = storedPlatformIds[summary.id];
          }
        });
      }

      logger.info(
        `[influencerService] Successfully processed ${summaries.length} influencers for list.`
      );
      return {
        influencers: summaries,
        total: insightIQResponse.metadata?.total ?? summaries.length,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      logger.error('[influencerService] Error in getProcessedInfluencerList:', error);
      throw error;
    }
  },

  async getProcessedInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]> {
    if (!ids || ids.length === 0) return [];
    logger.info(`[influencerService] Processing summaries request for IDs: ${ids.join(', ')}`);

    try {
      const dbInfluencers = await prisma.marketplaceInfluencer.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          platforms: true,
          followersCount: true,
          isInsightIQVerified: true,
          primaryAudienceLocation: true,
          primaryAudienceAgeRange: true,
          primaryAudienceGender: true,
          engagementRate: true,
          audienceQualityIndicator: true,
          insightiqUserId: true,
        },
      });

      logger.debug(
        `[influencerService] Found ${dbInfluencers.length} influencers in DB for summaries.`
      );

      const summaries: InfluencerSummary[] = dbInfluencers.map(inf =>
        mapPrismaInfluencerToSummary(inf as any)
      );

      const orderedSummaries = ids
        .map(id => summaries.find(inf => inf.id === id))
        .filter((inf): inf is InfluencerSummary => inf !== undefined);

      return orderedSummaries;
    } catch (error) {
      logger.error(
        `[influencerService] Error processing influencer summaries for IDs [${ids.join(', ')}]:`,
        error
      );
      return [];
    }
  },

  getInfluencerSummariesByIds: async ids => {
    if (!ids || ids.length === 0) return [];
    const queryString = buildQueryString({ ids });
    const url = `/api/influencers/summaries?${queryString}`;

    logger.info(`[influencerService] Calling GET ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error (${response.status}): ${errorData?.error || response.statusText}`
        );
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(`API returned error: ${data.error || 'Unknown API error'}`);
      }
      return data.influencers || [];
    } catch (error) {
      logger.error(`[influencerService] Failed getInfluencerSummariesByIds call to ${url}:`, error);
      throw error;
    }
  },

  async saveProfileIdToDatabase(
    profileData: Pick<
      InfluencerProfileData,
      'id' | 'handle' | 'platformSpecificId' | 'name' | 'avatarUrl' | 'platforms'
    >
  ): Promise<void> {
    const { id, handle, platformSpecificId, name, avatarUrl, platforms } = profileData;

    if (!platformSpecificId || !id) {
      logger.warn(
        `[influencerService] Cannot save to DB: platformSpecificId or unique identifier (id) is missing`,
        { handle, id, platformSpecificId }
      );
      return;
    }

    logger.info(
      `[influencerService] Attempting to upsert DB record using uniqueId ${id} with platformSpecificId ${platformSpecificId}`
    );

    try {
      await prisma.marketplaceInfluencer.upsert({
        where: {
          searchIdentifier: id,
        },
        update: {
          platformSpecificId: platformSpecificId,
          name: name ?? handle ?? id,
          handle: handle ?? '',
          avatarUrl: avatarUrl,
          platforms: platforms?.map(p => p as PlatformBackend) ?? [],
          updatedAt: new Date(),
        },
        create: {
          searchIdentifier: id,
          platformSpecificId: platformSpecificId,
          handle: handle ?? id.substring(0, 50),
          name: name ?? handle ?? id,
          avatarUrl: avatarUrl,
          platforms: platforms?.map(p => p as PlatformBackend) ?? [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      logger.info(`[influencerService] Successfully upserted DB record for uniqueId ${id}`);
    } catch (error) {
      logger.error(`[influencerService] Error upserting DB record for uniqueId ${id}:`, error);
    }
  },

  async getProfileIdsFromDatabase(uniqueIds: string[]): Promise<Record<string, string | null>> {
    logger.info(
      `[influencerService] Fetching platformSpecificIds for ${uniqueIds.length} searchIdentifiers`
    );
    if (uniqueIds.length === 0) return {};
    try {
      const influencers = await prisma.marketplaceInfluencer.findMany({
        where: {
          searchIdentifier: { in: uniqueIds },
        },
        select: {
          searchIdentifier: true,
          platformSpecificId: true,
        },
      });
      const idMap: Record<string, string | null> = {};
      uniqueIds.forEach(uid => (idMap[uid] = null));
      influencers.forEach(inf => {
        if (inf.searchIdentifier && inf.platformSpecificId) {
          idMap[inf.searchIdentifier] = inf.platformSpecificId;
        }
      });
      logger.debug(
        `[influencerService] Found ${Object.values(idMap).filter(Boolean).length} stored platformSpecificIds`
      );
      return idMap;
    } catch (error) {
      logger.error(`[influencerService] Failed to fetch profileIds:`, error);
      return {};
    }
  },
};

logger.info(`[influencerService] Initializing service (Using API implementation).`);

export const influencerService: IInfluencerService = apiService;
