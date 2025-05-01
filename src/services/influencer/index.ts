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
  getProfileUniqueId,
  getInsightIQProfileById,
  searchInsightIQProfilesByParams,
  fetchDetailedProfile,
} from '@/lib/insightiqService';
import {
  InsightIQProfile,
  InsightIQSearchProfile,
  InsightIQProfileWithAnalytics,
} from '@/types/insightiq';
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
  searchTerm?: string;
  audienceQuality?: 'High' | 'Medium' | 'Low';
  minScore?: number;
  maxScore?: number;
}

// Define necessary InsightIQ filter type inline
interface InsightIQProfileFilters {
  platforms?: PlatformEnum[];
  follower_count?: { min?: number; max?: number };
  is_verified?: boolean;
  locations?: string[]; // Align with GetInfluencersFilters
  searchTerm?: string;
  // NOTE: InsightIQ search doesn't directly filter by audience quality.
  // This filtering will happen on our backend using stored/calculated data.
}

/**
 * Defines the interface for the influencer service.
 * Ensures the real API implementation adheres to the contract.
 */
export interface IInfluencerService {
  getInfluencers(params: {
    filters?: GetInfluencersFilters; // Use defined filter type (now includes searchTerm, audienceQuality, Score)
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
    filters?: GetInfluencersFilters; // Use defined filter type (now includes searchTerm, audienceQuality, Score)
    pagination?: { page: number; limit: number };
  }): Promise<{
    influencers: InfluencerSummary[];
    total: number;
    page: number;
    limit: number;
  }>;

  // Add interface for summaries by IDs
  getProcessedInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]>;

  // NEW method taking handle and platform string
  getAndMapProfileByHandleAndPlatform(
    handle: string,
    platform: string
  ): Promise<InfluencerProfileData | null>;

  // Mark old one as deprecated explicitly if keeping it
  /** @deprecated Use getAndMapProfileByHandleAndPlatform */
  getAndMapProfileByHandle(handle: string): Promise<InfluencerProfileData | null>;

  // Add interfaces for persistence methods
  saveProfileIdToDatabase(
    profileData: Pick<
      InfluencerProfileData,
      'id' | 'handle' | 'platformSpecificId' | 'name' | 'avatarUrl' | 'platforms'
    > & { audienceQualityIndicator?: string | null }
  ): Promise<void>;

  getStoredDataFromDatabase(
    uniqueIds: string[] // Lookup by unique ID (external_id or composite)
  ): Promise<
    Record<string, { platformSpecificId: string | null; audienceQualityIndicator: string | null }>
  >; // Map unique ID -> stored data
}

// Helper function to find PlatformEnum by its string value (case-insensitive)
function findPlatformEnumByValue(value: string | null): PlatformEnum | null {
  if (!value) return null;
  const upperValue = value.toUpperCase(); // Normalize input
  for (const key of Object.keys(PlatformEnum)) {
    // Check if the key is a valid enum member (not a number for reverse mapping)
    // and if its value matches the input string (case-insensitive)
    if (
      isNaN(Number(key)) &&
      PlatformEnum[key as keyof typeof PlatformEnum].toUpperCase() === upperValue
    ) {
      return PlatformEnum[key as keyof typeof PlatformEnum];
    }
  }
  return null; // Not found
}

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
    logger.warn(
      '[influencerService] getInfluencerByIdentifier is deprecated. Use getAndMapProfileByHandle.'
    );
    // Construct the NEW API route URL (by-handle)
    const url = `/api/influencers/by-handle/${encodeURIComponent(identifier)}`;
    logger.info(`[influencerService] Calling GET ${url} (via deprecated function)`);
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
    logger.warn(
      '[influencerService] getProcessedInfluencerProfileByIdentifier is deprecated. Use getAndMapProfileByHandle.'
    );
    // Simple pass-through for now, assuming identifier might contain handle
    let handle = identifier;
    if (identifier.includes(':::')) {
      handle = identifier.split(':::')[0];
    }
    if (!handle) return null;
    return this.getAndMapProfileByHandle(handle);
  },

  async getProcessedInfluencerList(params: {
    filters?: GetInfluencersFilters; // Includes searchTerm, audienceQuality, Score
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

      // --- Handle Multi-Platform Search ---
      const platformEnums =
        filters.platforms && filters.platforms.length > 0
          ? filters.platforms
          : [PlatformEnum.Instagram]; // Default to Instagram if none selected

      logger.info(`[getProcessedInfluencerList] Targeting platforms: ${platformEnums.join(', ')}`);

      const platformIds = platformEnums
        .map(pe => getInsightIQWorkPlatformId(pe))
        .filter((id): id is string => id !== null);

      if (platformIds.length === 0) {
        logger.error('[getProcessedInfluencerList] No valid platform IDs found after mapping.');
        return { influencers: [], total: 0, page: pagination.page, limit: pagination.limit };
      }

      // Prepare filters to pass to each InsightIQ call (excluding platforms)
      const commonInsightIQFilters: Omit<InsightIQProfileFilters, 'platforms'> = {
        follower_count: {
          min: filters.minFollowers,
          max: filters.maxFollowers,
        },
        is_verified: filters.isVerified,
        locations: filters.locations,
        searchTerm: filters.searchTerm,
      };

      // Fetch data from InsightIQ in parallel for each platform
      const platformPromises = platformIds.map(platformId =>
        getInsightIQProfiles({
          limit: pagination.limit * platformIds.length, // Fetch more per platform initially for better merging/pagination
          offset: offset, // Offset needs rethinking for true multi-source pagination
          filters: {
            ...commonInsightIQFilters,
            platforms: [platformEnums[platformIds.indexOf(platformId)]],
          }, // Pass single platform enum for mapping inside
        }).catch(error => {
          logger.error(
            `[getProcessedInfluencerList] Error fetching from platform ${platformId}:`,
            error
          );
          return null; // Return null on error for this platform
        })
      );

      const platformResults = await Promise.all(platformPromises);

      // Process results, aggregate, and deduplicate
      let combinedInfluencerData: InsightIQSearchProfile[] = [];
      let combinedTotal = 0;
      const handledHandles = new Set<string>(); // Simple deduplication by handle

      platformResults.forEach((result, index) => {
        if (result?.data) {
          logger.info(
            `[getProcessedInfluencerList] Received ${result.data.length} profiles from platform ${platformIds[index]}`
          );
          combinedTotal += result.metadata?.total ?? result.data.length; // Sum totals
          result.data.forEach(profile => {
            const handle = profile.platform_username?.toLowerCase();
            // Deduplicate based on handle (simple strategy)
            if (handle && !handledHandles.has(handle)) {
              combinedInfluencerData.push(profile);
              handledHandles.add(handle);
            }
          });
        } else {
          logger.warn(
            `[getProcessedInfluencerList] No data or error fetching from platform ${platformIds[index]}`
          );
        }
      });

      logger.info(
        `[getProcessedInfluencerList] Combined ${combinedInfluencerData.length} unique profiles from ${platformIds.length} platforms. Approx Total: ${combinedTotal}`
      );

      // Sort combined results (example: by follower count)
      combinedInfluencerData.sort((a, b) => (b.follower_count ?? 0) - (a.follower_count ?? 0));

      // Map combined data to summaries
      const summaries: InfluencerSummary[] = [];
      combinedInfluencerData.forEach(profile => {
        try {
          const id = getProfileUniqueId(profile);
          const summaryBase = mapInsightIQProfileToInfluencerSummary(profile);
          if (summaryBase) {
            summaries.push({
              ...summaryBase,
              id: id,
            });
          }
        } catch (e) {
          logger.warn(`[getProcessedInfluencerList] Skipping profile during final mapping`, {
            error: e,
            profileData: profile,
          });
        }
      });

      // Enrich with DB data (audience quality, etc.)
      const uniqueIdsFromList = summaries.map(s => s.id).filter(Boolean);
      if (uniqueIdsFromList.length > 0) {
        const storedDataMap = await this.getStoredDataFromDatabase(uniqueIdsFromList);
        summaries.forEach((summary: InfluencerSummary) => {
          const storedData = summary.id ? storedDataMap[summary.id] : null;
          if (storedData?.audienceQualityIndicator) {
            const validIndicators = ['High', 'Medium', 'Low'];
            if (validIndicators.includes(storedData.audienceQualityIndicator)) {
              summary.audienceQualityIndicator = storedData.audienceQualityIndicator as
                | 'High'
                | 'Medium'
                | 'Low';
            }
          }
          // Add platformSpecificId enrichment if needed
          if (!summary.platformSpecificId && storedData?.platformSpecificId) {
            summary.platformSpecificId = storedData.platformSpecificId;
          }
        });
      }

      // --- Apply Backend Filtering (Audience Quality & Score) ---
      let filteredSummaries = summaries;

      /* // Temporarily comment out backend filtering
      // Apply Audience Quality Filter
      if (filters.audienceQuality) {
        const qualityFilter = filters.audienceQuality;
        logger.info(`[getProcessedInfluencerList] Applying backend filter for Audience Quality: ${qualityFilter}`);
        filteredSummaries = filteredSummaries.filter(summary => {
          const indicator = summary.audienceQualityIndicator;
          if (!indicator) return false;
          if (qualityFilter === 'High') return indicator === 'High';
          if (qualityFilter === 'Medium') return indicator === 'Medium' || indicator === 'High';
          return true;
        });
        logger.info(`[getProcessedInfluencerList] ${filteredSummaries.length} summaries remain after Audience Quality filter.`);
      }
      */ // End temporary comment out
      // --------------------------------------------------

      // Apply pagination to the *final filtered* list
      const paginatedSummaries = filteredSummaries.slice(offset, offset + pagination.limit);

      logger.info(
        `[influencerService] Successfully processed. Returning ${paginatedSummaries.length} influencers for page ${pagination.page}.`
      );

      // Note: `combinedTotal` is an approximation due to deduplication and backend filtering.
      // Accurate pagination requires a more complex count strategy.
      return {
        influencers: paginatedSummaries,
        total: combinedTotal, // Using approximated total for now
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

  // Update implementation to handle platform string correctly
  async getAndMapProfileByHandleAndPlatform(
    handle: string,
    platform: string
  ): Promise<InfluencerProfileData | null> {
    logger.info(
      `[influencerService] Processing profile request for handle: ${handle}, platform string: ${platform}`
    );

    // Convert platform string to enum using the helper
    const platformEnum = findPlatformEnumByValue(platform); // Use helper
    if (!platformEnum) {
      logger.error(`[influencerService] Invalid platform string received: ${platform}`);
      throw new Error(`Invalid platform specified: ${platform}`); // Throw error for API route to catch
    }

    // Get the reliable platform UUID using the enum
    const reliablePlatformUuid = getInsightIQWorkPlatformId(platformEnum);
    if (!reliablePlatformUuid) {
      logger.error(`[influencerService] Could not map platform enum ${platformEnum} to UUID.`);
      throw new Error(`Internal configuration error for platform: ${platformEnum}`);
    }

    logger.info(
      `[influencerService] Mapped platform ${platformEnum} to reliable UUID: ${reliablePlatformUuid}`
    );

    try {
      // Call the InsightIQ service function with handle and RELIABLE UUID
      const detailedProfile: InsightIQProfileWithAnalytics | null = await fetchDetailedProfile(
        handle,
        reliablePlatformUuid
      );

      if (!detailedProfile) {
        logger.warn(
          `[influencerService] fetchDetailedProfile returned null for handle: ${handle}.`
        );
        return null;
      }

      // --- Calculate Audience Quality Indicator --- //
      let calculatedIndicator: 'High' | 'Medium' | 'Low' | null = null;
      const credibilityScore = detailedProfile.audience?.credibility_score;
      logger.debug(
        `[influencerService] Extracted credibility score for ${handle}: ${credibilityScore}`
      );

      if (typeof credibilityScore === 'number' && credibilityScore !== null) {
        if (credibilityScore >= 0.8) {
          calculatedIndicator = 'High';
        } else if (credibilityScore >= 0.5) {
          calculatedIndicator = 'Medium';
        } else {
          calculatedIndicator = 'Low';
        }
        logger.info(
          `[influencerService] Calculated Audience Quality for ${handle}: ${calculatedIndicator} (Score: ${credibilityScore})`
        );
      } else {
        logger.warn(
          `[influencerService] Credibility score not found or invalid for ${handle}. Indicator remains null.`
        );
      }
      // --- End Calculate Indicator ---

      // Map the fetched profile data
      const identifierForMapping = detailedProfile.external_id ?? handle; // Prefer external_id
      const profileData = mapInsightIQProfileToInfluencerProfileData(
        detailedProfile,
        identifierForMapping
      );

      if (!profileData) {
        logger.error(
          `[influencerService] Failed to map detailedProfile to InfluencerProfileData for handle: ${handle}`
        );
        return null;
      }

      // --- Save to Database (including indicator) --- //
      try {
        const idForDb = identifierForMapping;
        const platformSpecificIdForDb = profileData.platformSpecificId;

        if (idForDb && platformSpecificIdForDb) {
          await this.saveProfileIdToDatabase({
            id: idForDb,
            handle: profileData.handle,
            platformSpecificId: platformSpecificIdForDb,
            name: profileData.name,
            avatarUrl: profileData.avatarUrl,
            platforms: profileData.platforms,
            audienceQualityIndicator: calculatedIndicator,
          });
        } else {
          logger.warn(
            `[influencerService] Skipping DB save for ${handle} due to missing idForDb or platformSpecificIdForDb after mapping.`
          );
        }
      } catch (dbError) {
        logger.error(
          `[influencerService] Failed to save profile data to DB for ${handle}:`,
          dbError
        );
      }
      // --- End Save to Database ---

      return profileData;
    } catch (error) {
      logger.error(
        `[influencerService] Error in getAndMapProfileByHandleAndPlatform for ${handle}:`,
        error
      );
      throw error; // Re-throw for the API route
    }
  },

  // Deprecated implementation
  /** @deprecated Use getAndMapProfileByHandleAndPlatform */
  async getAndMapProfileByHandle(handle: string): Promise<InfluencerProfileData | null> {
    logger.warn(
      '[influencerService] Calling deprecated getAndMapProfileByHandle. Use getAndMapProfileByHandleAndPlatform.'
    );
    // Cannot reliably call new function without platformId
    return null;
  },

  async saveProfileIdToDatabase(
    profileData: Pick<
      InfluencerProfileData,
      'id' | 'handle' | 'platformSpecificId' | 'name' | 'avatarUrl' | 'platforms'
    > & { audienceQualityIndicator?: string | null }
  ): Promise<void> {
    const { id, handle, platformSpecificId, name, avatarUrl, platforms, audienceQualityIndicator } =
      profileData;

    if (!platformSpecificId || !id) {
      logger.warn(
        `[influencerService] Cannot save to DB: platformSpecificId or unique identifier (id) is missing`,
        { handle, id, platformSpecificId }
      );
      return;
    }

    logger.info(
      `[influencerService] Attempting to upsert DB record using uniqueId ${id} with platformSpecificId ${platformSpecificId} and quality: ${audienceQualityIndicator}`
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
          audienceQualityIndicator: audienceQualityIndicator,
          updatedAt: new Date(),
        },
        create: {
          searchIdentifier: id,
          platformSpecificId: platformSpecificId,
          handle: handle ?? id.substring(0, 50),
          name: name ?? handle ?? id,
          avatarUrl: avatarUrl,
          platforms: platforms?.map(p => p as PlatformBackend) ?? [],
          audienceQualityIndicator: audienceQualityIndicator,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      logger.info(`[influencerService] Successfully upserted DB record for uniqueId ${id}`);
    } catch (error) {
      logger.error(`[influencerService] Error upserting DB record for uniqueId ${id}:`, error);
    }
  },

  async getStoredDataFromDatabase(
    uniqueIds: string[]
  ): Promise<
    Record<string, { platformSpecificId: string | null; audienceQualityIndicator: string | null }>
  > {
    logger.info(
      `[influencerService] Fetching stored data (platformSpecificId, audienceQualityIndicator) for ${uniqueIds.length} searchIdentifiers`
    );
    if (uniqueIds.length === 0) return {};

    // Define the expected structure for the return map
    const initialMap: Record<
      string,
      { platformSpecificId: string | null; audienceQualityIndicator: string | null }
    > = {};
    uniqueIds.forEach(
      uid => (initialMap[uid] = { platformSpecificId: null, audienceQualityIndicator: null })
    );

    try {
      const influencers = await prisma.marketplaceInfluencer.findMany({
        where: {
          searchIdentifier: { in: uniqueIds },
        },
        // Select both fields
        select: {
          searchIdentifier: true,
          platformSpecificId: true,
          audienceQualityIndicator: true, // Add this field
        },
      });

      // Populate the map with fetched data
      influencers.forEach(inf => {
        if (inf.searchIdentifier) {
          initialMap[inf.searchIdentifier] = {
            platformSpecificId: inf.platformSpecificId ?? null,
            audienceQualityIndicator: inf.audienceQualityIndicator ?? null, // Add this field
          };
        }
      });

      const foundCount = Object.values(initialMap).filter(
        d => d.platformSpecificId || d.audienceQualityIndicator
      ).length;
      logger.debug(
        `[influencerService] Found stored data for ${foundCount} out of ${uniqueIds.length} identifiers.`
      );
      return initialMap;
    } catch (error) {
      logger.error(`[influencerService] Failed to fetch stored data:`, error);
      return initialMap; // Return the initial map (all nulls) on error
    }
  },
};

logger.info(`[influencerService] Initializing service (Using API implementation).`);

export const influencerService: IInfluencerService = apiService;
