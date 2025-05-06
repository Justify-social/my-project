import {
  InsightIQProfile,
  InsightIQSearchProfile,
  InsightIQProfileWithAnalytics,
} from '@/types/insightiq'; // Import BOTH types
import { logger } from '@/utils/logger';

/**
 * Calculates the Discovery Score (V1.5) based on readily available search/summary data.
 *
 * @param profile The InsightIQSearchProfile or partial InsightIQProfile data.
 * @returns A score between 0 and 100, or null if insufficient data.
 */
export function calculateDiscoveryScore(
  profile: Partial<InsightIQProfile | InsightIQSearchProfile>
): number | null {
  const logIdentifier =
    ('id' in profile ? profile.id : undefined) ??
    profile.platform_username ??
    profile.full_name ??
    'unknown';

  if (logIdentifier === 'unknown') {
    logger.warn(`[ScoringV1.5 Discovery] Cannot calculate score for profile without identifier.`);
    return null;
  }

  let score = 0;
  const MAX_SCORE = 100;
  let factorsUsed = 0;

  // Factor 1: Verification (Weight: 40 points)
  if (profile.is_verified !== undefined && profile.is_verified !== null) {
    score += profile.is_verified ? 40 : 0;
    factorsUsed++;
  }

  // Factor 2: Follower Count (Weight: 30 points)
  const followers =
    ('follower_count' in profile ? profile.follower_count : undefined) ??
    ('reputation' in profile ? profile.reputation?.follower_count : undefined);

  logger.debug(`[ScoringV1.5 Discovery Inputs] Profile: ${logIdentifier}`, {
    is_verified_input: profile.is_verified,
    follower_count_input: followers,
    engagement_rate_input: profile.engagement_rate,
  });

  if (typeof followers === 'number' && followers > 0) {
    let followerScore = 0;
    if (followers >= 10_000_000) followerScore = 30;
    else if (followers >= 1_000_000) followerScore = 25;
    else if (followers >= 100_000) followerScore = 20;
    else if (followers >= 10_000) followerScore = 10;
    else if (followers >= 1_000) followerScore = 5;
    else followerScore = 1;
    score += followerScore;
    factorsUsed++;
  }

  // Factor 3: Engagement Rate (Weight: 30 points)
  if (typeof profile.engagement_rate === 'number' && profile.engagement_rate > 0) {
    let engagementScore = 0;
    if (profile.engagement_rate >= 0.05)
      engagementScore = 30; // 5%+
    else if (profile.engagement_rate >= 0.03)
      engagementScore = 20; // 3-5%
    else if (profile.engagement_rate >= 0.01)
      engagementScore = 10; // 1-3%
    else engagementScore = 2; // <1%
    score += engagementScore;
    factorsUsed++;
  }

  if (factorsUsed === 0) {
    logger.debug(
      `[ScoringV1.5 Discovery] Insufficient data for profile ${logIdentifier}. Factors used: ${factorsUsed}`
    );
    return null;
  }

  const finalScore = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));
  logger.debug(
    `[ScoringV1.5 Discovery] Calculated score for profile ${logIdentifier}: ${finalScore}`
  );
  return finalScore;
}

/**
 * Calculates the Full Justify Score (V2) using detailed profile analytics.
 * Requires full InsightIQProfileWithAnalytics data.
 *
 * @param profile The full InsightIQProfileWithAnalytics data.
 * @returns A score between 0 and 100, or null if insufficient data.
 */
export function calculateFullJustifyScore(profile: InsightIQProfileWithAnalytics): number | null {
  const logIdentifier = profile.id ?? profile.platform_username ?? profile.full_name ?? 'unknown';
  const audienceCredibility = profile.audience?.credibility_score;

  logger.debug(`[ScoringV2 Full Inputs] Profile: ${logIdentifier}`, {
    is_verified_input: profile.is_verified,
    follower_count_input: profile.reputation?.follower_count,
    engagement_rate_input: profile.engagement_rate,
    audience_credibility_input: audienceCredibility,
    // TODO: Log follower_types once available and used
  });

  let score = 0;
  const MAX_SCORE = 100;
  let factorsUsed = 0;

  // Define V2 Weights
  const WEIGHT_VERIFICATION = 25;
  const WEIGHT_AUDIENCE_CREDIBILITY = 35;
  const WEIGHT_ENGAGEMENT_RATE = 25;
  const WEIGHT_FOLLOWER_COUNT = 15;
  // const WEIGHT_FOLLOWER_QUALITY = 10; // Example for future use

  // Factor 1: Verification
  if (profile.is_verified !== undefined && profile.is_verified !== null) {
    score += profile.is_verified ? WEIGHT_VERIFICATION : 0;
    factorsUsed++;
  }

  // Factor 2: Audience Credibility Score (0-1 scale from InsightIQ)
  if (
    typeof audienceCredibility === 'number' &&
    audienceCredibility >= 0 &&
    audienceCredibility <= 1
  ) {
    score += Math.round(audienceCredibility * WEIGHT_AUDIENCE_CREDIBILITY);
    factorsUsed++;
  } else if (audienceCredibility !== undefined) {
    // Log if present but not a valid number
    logger.warn(
      `[ScoringV2 Full] Invalid audienceCredibility value for ${logIdentifier}:`,
      audienceCredibility
    );
  }

  // Factor 3: Engagement Rate
  if (typeof profile.engagement_rate === 'number' && profile.engagement_rate >= 0) {
    let engagementScore = 0;
    const er = profile.engagement_rate;
    if (er >= 0.05)
      engagementScore = WEIGHT_ENGAGEMENT_RATE; // 5%+
    else if (er >= 0.03)
      engagementScore = Math.round(WEIGHT_ENGAGEMENT_RATE * 0.75); // 3-4.99%
    else if (er >= 0.02)
      engagementScore = Math.round(WEIGHT_ENGAGEMENT_RATE * 0.5); // 2-2.99%
    else if (er >= 0.01)
      engagementScore = Math.round(WEIGHT_ENGAGEMENT_RATE * 0.25); // 1-1.99%
    else engagementScore = Math.round(WEIGHT_ENGAGEMENT_RATE * 0.1); // <1% (still give some points)
    score += engagementScore;
    factorsUsed++;
  }

  // Factor 4: Follower Count
  const followers = profile.reputation?.follower_count;
  if (typeof followers === 'number' && followers > 0) {
    let followerScore = 0;
    if (followers >= 10_000_000)
      followerScore = WEIGHT_FOLLOWER_COUNT; // 10M+
    else if (followers >= 1_000_000)
      followerScore = Math.round(WEIGHT_FOLLOWER_COUNT * 0.8); // 1M - 9.99M
    else if (followers >= 100_000)
      followerScore = Math.round(WEIGHT_FOLLOWER_COUNT * 0.6); // 100k - 999k
    else if (followers >= 10_000)
      followerScore = Math.round(WEIGHT_FOLLOWER_COUNT * 0.4); // 10k - 99k
    else if (followers >= 1_000)
      followerScore = Math.round(WEIGHT_FOLLOWER_COUNT * 0.2); // 1k - 9.9k
    else followerScore = Math.round(WEIGHT_FOLLOWER_COUNT * 0.05); // <1k
    score += followerScore;
    factorsUsed++;
  }

  // TODO: Future Factor 5: Follower Quality (from audience.follower_types)
  // Example: if (profile.audience?.follower_types) { ... score += ...; factorsUsed++; }

  if (factorsUsed === 0) {
    logger.debug(
      `[ScoringV2 Full] Insufficient data for profile ${logIdentifier} to calculate score. Factors used: ${factorsUsed}`
    );
    return null;
  }

  const finalScore = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));
  logger.debug(
    `[ScoringV2 Full] Calculated score for profile ${logIdentifier}: ${finalScore} (Factors used: ${factorsUsed})`
  );
  return finalScore;
}
