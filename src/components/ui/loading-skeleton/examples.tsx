/**
 * Examples of skeleton loading components
 * 
 * This file demonstrates proper usage of the skeleton components.
 * For more details, see the README.md in this directory.
 */

import React from 'react';
import { 
  Skeleton, 
  WizardSkeleton, 
  TableSkeleton,
  SkeletonSection,
  FormFieldSkeleton,
  DashboardSkeleton,
  CampaignDetailSkeleton,
  FormSkeleton
} from './index';

// Example: Basic usage of WizardSkeleton in a page
export function WizardSkeletonExample(): JSX.Element {
  return (
    <WizardSkeleton 
      step={1} 
      hasProgressBar={true}
      hasHeader={true}
      maxWidth="max-w-6xl"
    />
  );
}

// Example: Form with multiple field types
export function FormSkeletonExample(): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Form Example</h2>
      
      <FormFieldSkeleton type="text" label={true} labelWidth="w-1/4" />
      <FormFieldSkeleton type="textarea" label={true} labelWidth="w-1/4" />
      <FormFieldSkeleton type="select" label={true} labelWidth="w-1/4" />
      <FormFieldSkeleton type="checkbox" label={false} />
      <FormFieldSkeleton type="radio" label={true} labelWidth="w-1/4" />
      <FormFieldSkeleton type="datepicker" label={true} labelWidth="w-1/4" />
      <FormFieldSkeleton type="upload" label={true} labelWidth="w-1/4" />
      
      {/* Or use the pre-composed form skeleton */}
      <FormSkeleton />
    </div>
  );
}

// Example: Dashboard layout skeleton
export function DashboardSkeletonExample(): JSX.Element {
  return <DashboardSkeleton />;
}

// Example: Custom skeleton section composition
export function CustomSkeletonExample(): JSX.Element {
  return (
    <div className="space-y-6">
      <SkeletonSection 
        title={true}
        titleWidth="w-1/3"
        actionButton={true}
        lines={4}
        lineHeight="h-5"
      />
      
      <SkeletonSection 
        title={true}
        titleWidth="w-1/4"
        actionButton={false}
        lines={0}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </SkeletonSection>
    </div>
  );
}

// Example: Table skeleton
export function TableSkeletonExample(): JSX.Element {
  return (
    <TableSkeleton 
      rows={5} 
      cols={4} 
      hasHeader={true}
      hasFilter={true}
    />
  );
}

// Example: Campaign detail skeleton
export function CampaignDetailSkeletonExample(): JSX.Element {
  return <CampaignDetailSkeleton />;
} 