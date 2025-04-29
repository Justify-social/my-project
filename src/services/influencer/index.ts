// src/services/influencer/index.ts

// Import types and logger
import { InfluencerSummary, InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';

// Define the expected structure for filters passed to the service
// Align this with the backend API query parameters
export interface GetInfluencersFilters {
  platforms?: PlatformEnum[];
  minScore?: number;
  maxScore?: number;
  minFollowers?: number;
  maxFollowers?: number;
  audienceAge?: string;
  audienceLocation?: string;
  isPhylloVerified?: boolean;
  // sortBy?: string; // Post-MVP
  // searchTerm?: string; // Post-MVP
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

  getInfluencerSummariesByIds(ids: string[]): Promise<InfluencerSummary[]>;
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

  getInfluencerSummariesByIds: async ids => {
    if (!ids || ids.length === 0) return [];
    const queryString = buildQueryString({ ids }); // Assumes API accepts comma-separated IDs
    const url = `/api/influencers/summaries?${queryString}`; // Assuming this endpoint exists

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
      // TODO: Add response validation with Zod later if needed
      return data.influencers || []; // Assuming summaries are directly in `influencers` key
    } catch (error) {
      logger.error(`[influencerService] Failed getInfluencerSummariesByIds call to ${url}:`, error);
      throw error; // Re-throw for the caller to handle
    }
  },
};

logger.info(`[influencerService] Initializing service (Using API implementation).`);

// Export only the real API service implementation
export const influencerService: IInfluencerService = apiService;
