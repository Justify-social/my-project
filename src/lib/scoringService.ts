import { MarketplaceInfluencer } from '@prisma/client'; // Assuming prisma client regeneration worked
import { logger } from '@/utils/logger';

/**
 * Calculates the Justify Score (MVP V1) for an influencer.
 * This is a simple initial version based on readily available data.
 *
 * @param influencer The MarketplaceInfluencer data from the database.
 * @returns A score between 0 and 100, or null if insufficient data.
 */
export function calculateJustifyScoreV1(
  influencer: Partial<MarketplaceInfluencer> // Accept partial data
): number | null {
  let score = 0;
  let maxScorePossible = 0;
  let factorsUsed = 0;

  // Factor 1: Phyllo Verification (Weight: 30 points)
  maxScorePossible += 30;
  if (influencer.isPhylloVerified === true) {
    score += 30;
    factorsUsed++;
  } else if (influencer.isPhylloVerified === false) {
    // Potentially penalize unverified? For V1, just no bonus.
    // score -= 5; // Example penalty
    factorsUsed++;
  }

  // Factor 2: Audience Quality (Weight: 40 points)
  maxScorePossible += 40;
  if (influencer.audienceQualityIndicator) {
    if (influencer.audienceQualityIndicator === 'High') {
      score += 40;
    } else if (influencer.audienceQualityIndicator === 'Medium') {
      score += 20;
    } else if (influencer.audienceQualityIndicator === 'Low') {
      score += 5; // Small score even for Low quality?
    }
    factorsUsed++;
  }

  // Factor 3: Engagement Rate (Weight: 30 points)
  // Simple linear scale: 0% = 0 points, 5%+ = 30 points
  maxScorePossible += 30;
  if (typeof influencer.engagementRate === 'number') {
    const rate = influencer.engagementRate;
    const engagementScore = Math.max(0, Math.min(30, (rate / 5.0) * 30)); // Cap at 30 points for 5% or higher
    score += engagementScore;
    factorsUsed++;
  }

  // Basic check: require at least 2 factors to provide a score?
  if (factorsUsed < 2) {
    logger.debug(
      `[ScoringV1] Insufficient data for influencer ${influencer.id}. Factors used: ${factorsUsed}`
    );
    return null;
  }

  // Normalize score? For V1, let's just cap at 100.
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  logger.debug(
    `[ScoringV1] Calculated score for influencer ${influencer.id}: ${finalScore} (Raw: ${score}, Factors: ${factorsUsed})`
  );
  return finalScore;
}
