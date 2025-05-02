import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';

// Mapping from our PlatformEnum to known InsightIQ work_platform_id UUIDs
// Source: openapi.v1.yml examples for /v1/work-platforms/{id} and /v1/work-platforms
const platformEnumToUuidMap: Record<PlatformEnum, string> = {
  [PlatformEnum.Instagram]: '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
  [PlatformEnum.YouTube]: '14d9ddf5-51c6-415e-bde6-f8ed36ad7054',
  [PlatformEnum.TikTok]: 'de55aeec-0dc8-4119-bf90-16b3d1f0c987',
  [PlatformEnum.Twitter]: '7645460a-96e0-4192-a3ce-a1fc30641f72', // Includes 'X'
  [PlatformEnum.Facebook]: 'ad2fec62-2987-40a0-89fb-23485972598c',
  [PlatformEnum.Twitch]: 'e4de6c01-5b78-4fc0-a651-24f44134457b',
  [PlatformEnum.Pinterest]: '9c5b1cf1-23f1-4d40-b0ea-40f9bf615801',
  [PlatformEnum.LinkedIn]: '36410629-f907-43ba-aa0d-434ca9c0501a', // Assuming this is the correct one from Professional section
  // Add other platforms here if needed, e.g.:
  // [PlatformEnum.Substack]: 'fbf76083-710b-439a-8b8c-956f607ef2c1',
  // [PlatformEnum.Discord]: '3f996edf-fec1-4be7-bb53-f9b649f41058',
};

/**
 * Gets the InsightIQ work_platform_id UUID for a given PlatformEnum.
 * Logs a warning if the enum value is not mapped.
 * @param platformEnum The PlatformEnum value.
 * @returns The corresponding UUID string or null if not found.
 */
export function getInsightIQWorkPlatformId(platformEnum: PlatformEnum): string | null {
  const uuid = platformEnumToUuidMap[platformEnum];
  if (!uuid) {
    logger.warn(
      `[InsightIQ Utils] No InsightIQ UUID mapping found for PlatformEnum: ${platformEnum}`
    );
  }
  return uuid ?? null;
}

// --- NEW Utility: Get Platform URL Prefix ---
// Based on standard profile URL structures
const platformUrlPrefixMap: Record<PlatformEnum, string> = {
  [PlatformEnum.Instagram]: 'https://www.instagram.com/',
  [PlatformEnum.YouTube]: 'https://www.youtube.com/@', // Common format now, might need channel ID variant
  [PlatformEnum.TikTok]: 'https://www.tiktok.com/@',
  [PlatformEnum.Twitter]: 'https://twitter.com/', // Or x.com
  [PlatformEnum.Facebook]: 'https://www.facebook.com/', // Note: FB often uses IDs not handles
  [PlatformEnum.Twitch]: 'https://www.twitch.tv/',
  [PlatformEnum.Pinterest]: 'https://www.pinterest.com/',
  [PlatformEnum.LinkedIn]: 'https://www.linkedin.com/in/', // Common for personal profiles
};

/**
 * Gets the standard URL prefix for a given platform.
 * Useful for constructing profile URLs from handles/usernames.
 * @param platformEnum The PlatformEnum value.
 * @returns The URL prefix string or null if not mapped.
 */
export function getPlatformUrlPrefix(platformEnum: PlatformEnum): string | null {
  const prefix = platformUrlPrefixMap[platformEnum];
  if (!prefix) {
    logger.warn(`[InsightIQ Utils] No URL prefix mapping found for PlatformEnum: ${platformEnum}`);
  }
  return prefix ?? null;
}

// Add other InsightIQ related utility functions here if needed
