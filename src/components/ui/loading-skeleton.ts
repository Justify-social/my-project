/**
 * This file provides backward compatibility for code that imports from '@/components/ui/loading-skeleton'
 * It re-exports components from the new canonical location at '@/components/ui/skeleton'
 * 
 * @deprecated Import from '@/components/ui/skeleton' instead
 */

import { 
  TableSkeleton,
  SkeletonSection,
  WizardSkeleton,
  FormFieldSkeleton, 
  UIFormSkeleton,
  UICampaignDetailSkeleton,
  UIDashboardSkeleton,
  AuthSkeleton
} from '@/components/ui/skeleton';

// Re-export all components
export { 
  TableSkeleton,
  SkeletonSection,
  WizardSkeleton,
  FormFieldSkeleton,
  UIFormSkeleton,
  UICampaignDetailSkeleton,
  UIDashboardSkeleton,
  AuthSkeleton
};

// Also export the default component
export default TableSkeleton; 