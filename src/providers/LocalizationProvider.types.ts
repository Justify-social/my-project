import { z } from 'zod';
// Assuming CurrencyEnum is correctly exported from types.ts
// Verify this path is correct relative to your project structure
import { CurrencyEnum } from '@/components/features/campaigns/types';

export type DetectionSource = 'ipgeolocation.io' | 'Intl API' | 'default' | 'none';

export interface LocalizationContextType {
  timezone: string | null; // Detected/fallback timezone (e.g., 'Europe/London', 'UTC')
  countryCode: string | null; // Detected country code (e.g., 'GB', 'US')
  currency: z.infer<typeof CurrencyEnum> | null; // Default currency based on country (e.g., 'GBP', 'USD')
  isLoading: boolean; // True while detection is in progress
  error: Error | null; // Stores any detection error
  detectionSource: DetectionSource; // Source of the detected data
  // Note: Removed determineCurrencyForCountry from type, it's an internal implementation detail of the provider
}
