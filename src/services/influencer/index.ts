// src/services/influencer/index.ts

// Attempting imports using relative paths as aliases seem problematic
import * as mockService from '@/services/mock/mockInfluencerService';
import { InfluencerSummary, InfluencerProfileData } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger'; // Assuming logger utility path

/**
 * Defines the interface for the influencer service.
 * Ensures both mock and real API implementations adhere to the same contract.
 */
export interface IInfluencerService {
  getInfluencers(params: {
    filters?: {
      platform?: PlatformEnum[];
      minScore?: number;
      maxScore?: number;
      minFollowers?: number;
      maxFollowers?: number;
      // TODO: Add other MVP filters from API contract
    };
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

// Placeholder for the real API service implementing the interface
// This will eventually contain fetch calls to our backend API
const apiService: IInfluencerService = {
  getInfluencers: async params => {
    logger.error('[influencerService] Real getInfluencers API not implemented yet.');
    // Simulate API failure structure
    // throw new Error('API_NOT_IMPLEMENTED: getInfluencers');
    return {
      influencers: [],
      total: 0,
      page: params.pagination?.page ?? 1,
      limit: params.pagination?.limit ?? 12,
    };
  },
  getInfluencerById: async id => {
    logger.error(
      `[influencerService] Real getInfluencerById API not implemented yet for ID: ${id}`
    );
    // Simulate API failure structure
    // throw new Error('API_NOT_IMPLEMENTED: getInfluencerById');
    return null;
  },
  getInfluencerSummariesByIds: async ids => {
    logger.error(
      `[influencerService] Real getInfluencerSummariesByIds API not implemented yet for IDs: ${ids.join(', ')}`
    );
    // Simulate API failure structure
    // throw new Error('API_NOT_IMPLEMENTED: getInfluencerSummariesByIds');
    return [];
  },
};

// Ensure mockService conforms to the interface (TypeScript will check this)
// We need to assert the type because the import itself might be unresolved by TS server initially
const typedMockService: IInfluencerService = mockService as any;

// Determine whether to use the mock service or the real API service
// Defaults to mock in development, uses real API otherwise (controlled by env var)
// Use NEXT_PUBLIC_ prefix if this needs to be accessible client-side
const useMock =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || process.env.NODE_ENV === 'development';

logger.info(`[influencerService] Initializing service. Using mock API: ${useMock}`);

export const influencerService: IInfluencerService = useMock ? typedMockService : apiService;
