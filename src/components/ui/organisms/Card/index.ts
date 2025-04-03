/**
 * Card Module - Single Source of Truth for Card Components
 * 
 * This file consolidates all card-related exports into a single entry point,
 * making it easier to import and use cards throughout the application.
 * 
 * The entire card system follows the Single Source of Truth principle:
 * - Card.tsx is the canonical source for base card components
 * - MetricCard.tsx is the canonical source for the metric card component
 * - All card variants are consolidated and exported from this single file
 */

// Re-export the main Card components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './Card';

// Re-export specialized card components
export { MetricCard } from './MetricCard';
export { default as UpcomingCampaignsCard } from './UpcomingCampaignsCard';

// Re-export example for the component library
export { CardExamples } from './examples/CardExamples';

// Export types
export type { MetricCardProps } from './MetricCard';
