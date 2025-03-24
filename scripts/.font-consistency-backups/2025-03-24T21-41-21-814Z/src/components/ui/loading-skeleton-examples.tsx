import React from 'react';
import { 
  WizardSkeleton, 
  FormFieldSkeleton, 
  TableSkeleton, 
  FormSkeleton, 
  AuthSkeleton, 
  SkeletonSection,
  DashboardSkeleton,
  CampaignDetailSkeleton
} from '@/components/ui/loading-skeleton';

export function LoadingSkeletonExamples() {
  return (
    <div className="space-y-8" id="loading-skeletons">
      <div>
        <h2 className="text-lg font-semibold mb-4">Contextual Skeleton Components</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Wizard Skeleton (Step 3)</p>
              <div className="border rounded-lg p-4 overflow-hidden" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.6] origin-top-left">
                  <WizardSkeleton step={3} />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Form Field Skeleton Variants</p>
              <div className="border rounded-lg p-4 overflow-hidden space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="w-1/3">
                    <p className="text-xs text-gray-500 mb-1">Text Input</p>
                    <FormFieldSkeleton type="text" />
                  </div>
                  <div className="w-1/3">
                    <p className="text-xs text-gray-500 mb-1">Select</p>
                    <FormFieldSkeleton type="select" />
                  </div>
                  <div className="w-1/3">
                    <p className="text-xs text-gray-500 mb-1">Checkbox</p>
                    <FormFieldSkeleton type="checkbox" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="w-1/3">
                    <p className="text-xs text-gray-500 mb-1">Radio</p>
                    <FormFieldSkeleton type="radio" />
                  </div>
                  <div className="w-1/3">
                    <p className="text-xs text-gray-500 mb-1">Datepicker</p>
                    <FormFieldSkeleton type="datepicker" />
                  </div>
                  <div className="w-1/3">
                    <p className="text-xs text-gray-500 mb-1">Upload</p>
                    <FormFieldSkeleton type="upload" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Table Skeleton with Filter</p>
              <div className="border rounded-lg p-4 overflow-hidden">
                <TableSkeleton rows={3} cols={4} hasFilter={true} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Form Skeleton Grid Layout</p>
              <div className="border rounded-lg p-4 overflow-hidden">
                <FormSkeleton 
                  fields={4} 
                  layout="grid" 
                  fieldTypes={['text', 'select', 'datepicker', 'textarea']} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Advanced Page Skeletons</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Campaign Detail Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.5] origin-top-left">
                  <CampaignDetailSkeleton />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Dashboard Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.5] origin-top-left">
                  <DashboardSkeleton />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Auth Sign-in Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.7] origin-top-left">
                  <AuthSkeleton variant="signin" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Auth Sign-up Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.7] origin-top-left">
                  <AuthSkeleton variant="signup" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Migration Guide</h2>
        <p className="text-sm text-gray-600 mb-4">We're standardizing loading states across the application. Please update your code to use these new contextual skeleton components.</p>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Instead of:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`if (loading) {
  return <LoadingSpinner />;
}`}
            </pre>
          </div>
          
          <div>
            <p className="text-sm font-medium">Use the appropriate contextual skeleton:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`import { WizardSkeleton } from '@/components/ui/loading-skeleton';

if (loading) {
  return <WizardSkeleton step={currentStep} />;
}`}
            </pre>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium">For Suspense boundaries:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`import { TableSkeleton } from '@/components/ui/loading-skeleton';

<Suspense fallback={<TableSkeleton rows={5} hasFilter={true} />}>
  <Component />
</Suspense>`}
            </pre>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium">For complete customization:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`import { WizardSkeleton, SkeletonSection, FormFieldSkeleton } from '@/components/ui/loading-skeleton';

<WizardSkeleton
  step={3}
  stepContent={
    <>
      <SkeletonSection title={true} titleWidth="w-1/3" lines={2} />
      <SkeletonSection title={true} titleWidth="w-1/4" lines={0}>
        <div className="space-y-4">
          <FormFieldSkeleton type="text" />
          <FormFieldSkeleton type="select" />
        </div>
      </SkeletonSection>
    </>
  }
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 