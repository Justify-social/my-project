import { InsightIQProfile } from '@/types/insightiq'; // Import the correct type
import { logger } from '@/utils/logger';

/**
 * Calculates the Justify Score (MVP V1 - Revised for Live InsightIQ Data) for an influencer.
 * This is a simple initial version based on readily available LIVE profile data.
 *
 * @param profile The InsightIQProfile data fetched live.
 * @returns A score between 0 and 100, or null if insufficient data.
 */
export function calculateJustifyScoreV1(
  profile: Partial<InsightIQProfile> // Accept partial profile data
): number | null {
  // Basic check: require profile ID for logging
  if (!profile.id) {
    logger.warn(`[ScoringV1] Cannot calculate score for profile without ID.`);
    return null;
  }

  let score = 0;
  const MAX_SCORE = 100;
  let factorsUsed = 0;

  // Factor 1: Verification (Weight: 50 points)
  if (profile.is_verified !== undefined && profile.is_verified !== null) {
    score += profile.is_verified ? 50 : 0;
    factorsUsed++;
  }

  // Factor 2: Follower Count (Logarithmic Scale - Weight: 50 points)
  const followers = profile.reputation?.follower_count;
  if (typeof followers === 'number' && followers > 0) {
    // Simple logarithmic scaling (adjust thresholds/points as needed)
    let followerScore = 0;
    if (followers >= 10_000_000) followerScore = 50;
    else if (followers >= 1_000_000) followerScore = 40;
    else if (followers >= 100_000) followerScore = 30;
    else if (followers >= 10_000) followerScore = 15;
    else if (followers >= 1_000) followerScore = 5;
    else followerScore = 1; // Minimal points for very small accounts

    score += followerScore;
    factorsUsed++;
  }

  // Require at least one factor to provide a score
  if (factorsUsed === 0) {
    logger.debug(
      `[ScoringV1] Insufficient data for profile ${profile.id}. Factors used: ${factorsUsed}`
    );
    return null;
  }

  // Ensure score is within 0-100 range
  const finalScore = Math.max(0, Math.min(MAX_SCORE, Math.round(score)));

  logger.debug(
    `[ScoringV1] Calculated score for profile ${profile.id}: ${finalScore} (Factors: ${factorsUsed})`,
    { isVerified: profile.is_verified, followers: followers }
  );
  return finalScore;
}
