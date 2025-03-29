/**
 * Skeleton Loading Components
 * 
 * @deprecated This module has been moved to follow atomic design principles.
 * Please import from '@/components/ui/molecules/skeleton' instead.
 * This redirect will be removed in a future version.
 */

// Re-export all skeleton components from the new location
import {
  Skeleton,
  WizardSkeleton,
  TableSkeleton,
  SkeletonSection,
  FormFieldSkeleton,
  UIDashboardSkeleton as DashboardSkeleton,
  UICampaignDetailSkeleton as CampaignDetailSkeleton,
  UIFormSkeleton as FormSkeleton,
  AuthSkeleton
} from '@/components/ui/molecules/skeleton';

// Also re-export all types
import type {
  SkeletonProps,
  SkeletonSectionProps,
  FormFieldSkeletonProps
} from '@/components/ui/molecules/skeleton';

// Export components
export {
  Skeleton,
  WizardSkeleton,
  TableSkeleton,
  SkeletonSection,
  FormFieldSkeleton,
  DashboardSkeleton,
  CampaignDetailSkeleton,
  FormSkeleton,
  AuthSkeleton
};

// Export types
export type {
  SkeletonProps,
  SkeletonSectionProps,
  FormFieldSkeletonProps
};

// For backward compatibility with default imports
export default Skeleton; 