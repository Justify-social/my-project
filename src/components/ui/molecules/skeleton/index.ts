export * from './Skeleton';
export * from './LoadingSkeleton';

// Re-export renamed components for backward compatibility
export { UICampaignDetailSkeleton as CampaignDetailSkeleton } from './LoadingSkeleton';
export { UIFormSkeleton as FormSkeleton } from './LoadingSkeleton';
export { UIDashboardSkeleton as DashboardSkeleton } from './LoadingSkeleton';
export { TableSkeleton } from './LoadingSkeleton';

export { default as SkeletonSection } from './SkeletonSection';
export { default as FormFieldSkeleton } from './FormFieldSkeleton';
export type { SkeletonSectionProps } from './SkeletonSection';
export type { FormFieldSkeletonProps } from './FormFieldSkeleton';

import FormFieldSkeleton from './FormFieldSkeleton';

export default FormFieldSkeleton;
