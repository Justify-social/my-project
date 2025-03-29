/**
 * @deprecated These components have been moved to src/components/ui/molecules/skeleton
 * Please import from '@/components/ui/molecules/skeleton' instead.
 */

import {
  CampaignDetailSkeleton as UICampaignDetailSkeleton,
  SkeletonSection as UISkeletonSection,
  FormFieldSkeleton as UIFormFieldSkeleton,
  FormSkeleton as UIFormSkeleton,
  TableSkeleton as UITableSkeleton,
  DashboardSkeleton as UIDashboardSkeleton
} from '@/components/ui/molecules/skeleton';

export type { SkeletonSectionProps } from '@/components/ui/molecules/skeleton';
export type { FormFieldSkeletonProps } from '@/components/ui/molecules/skeleton';

// Re-export components with the same names
export const CampaignDetailSkeleton = UICampaignDetailSkeleton;
export const SkeletonSection = UISkeletonSection;
export const FormFieldSkeleton = UIFormFieldSkeleton;
export const WizardSkeleton = UIFormSkeleton; // Map to FormSkeleton
export const TableSkeleton = UITableSkeleton;
export const FormSkeleton = UIFormSkeleton;
export const AuthSkeleton = UIDashboardSkeleton; // Map to DashboardSkeleton 
export const DashboardSkeleton = UIDashboardSkeleton;