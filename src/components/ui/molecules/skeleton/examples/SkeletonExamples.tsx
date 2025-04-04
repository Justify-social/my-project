import React from 'react';
import {
  UIFormSkeleton as FormSkeleton,
  UITableSkeleton as TableSkeleton,
  UICampaignDetailSkeleton as CampaignDetailSkeleton,
  UIDashboardSkeleton as DashboardSkeleton,
  WizardSkeleton,
  FormFieldSkeleton,
  AuthSkeleton,
  SkeletonSection
} from '@/components/ui/molecules/skeleton/LoadingSkeleton';
import { Spinner } from '@/components/ui/atoms/spinner/Spinner'

export function LoadingSkeletonExamples() {
  return (
    <div className="space-y-8 font-work-sans" id="loading-skeletons">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Contextual Skeleton Components</h2>
        <div className="space-y-6 font-work-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Wizard Skeleton (Step 3)</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.6] origin-top-left font-work-sans">
                  <WizardSkeleton step={3} />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Form Field Skeleton Variants</p>
              <div className="border rounded-lg p-4 overflow-hidden space-y-4 font-work-sans">
                <div className="flex flex-wrap gap-4 font-work-sans">
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Text Input</p>
                    <FormFieldSkeleton type="text" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Select</p>
                    <FormFieldSkeleton type="select" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Checkbox</p>
                    <FormFieldSkeleton type="checkbox" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 font-work-sans">
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Radio</p>
                    <FormFieldSkeleton type="radio" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Datepicker</p>
                    <FormFieldSkeleton type="datepicker" />
                  </div>
                  <div className="w-1/3 font-work-sans">
                    <p className="text-xs text-gray-500 mb-1 font-work-sans">Upload</p>
                    <FormFieldSkeleton type="upload" />
                  </div>
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Table Skeleton with Filter</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans">
                <TableSkeleton rows={3} cols={4} hasFilter={true} />
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Form Skeleton Grid Layout</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans">
                <FormSkeleton
                  fields={4}
                  layout="grid"
                  fieldTypes={['text', 'select', 'datepicker', 'textarea']} />

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Advanced Page Skeletons</h2>
        <div className="space-y-6 font-work-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-work-sans">
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Campaign Detail Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.5] origin-top-left font-work-sans">
                  <CampaignDetailSkeleton />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Dashboard Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.5] origin-top-left font-work-sans">
                  <DashboardSkeleton />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Auth Sign-in Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.7] origin-top-left font-work-sans">
                  <AuthSkeleton variant="signin" />
                </div>
              </div>
            </div>
            <div className="font-work-sans">
              <p className="text-sm text-gray-500 mb-2 font-work-sans">Auth Sign-up Skeleton</p>
              <div className="border rounded-lg p-4 overflow-hidden font-work-sans" style={{ maxHeight: '300px' }}>
                <div className="scale-[0.7] origin-top-left font-work-sans">
                  <AuthSkeleton variant="signup" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border font-work-sans">
        <h2 className="text-lg font-semibold mb-2 font-sora">Migration Guide</h2>
        <p className="text-sm text-gray-600 mb-4 font-work-sans">We're standardizing loading states across the application. Please update your code to use these new contextual skeleton components.</p>
        
        <div className="space-y-4 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm font-medium font-work-sans">Instead of:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`if (loading) {
  return <LoadingSpinner />;
}`}
            </pre>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm font-medium font-work-sans">Use the appropriate contextual skeleton:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`import { WizardSkeleton } from '@/components/ui/loading-skeleton';

if (loading) {
  return <WizardSkeleton step={currentStep} />;
}`}
            </pre>
          </div>
          
          <div className="pt-2 font-work-sans">
            <p className="text-sm font-medium font-work-sans">For Suspense boundaries:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              {`import { TableSkeleton } from '@/components/ui/loading-skeleton';

<Suspense fallback={<TableSkeleton rows={5} hasFilter={true} />}>
  <Component />
</Suspense>`}
            </pre>
          </div>
          
          <div className="pt-2 font-work-sans">
            <p className="text-sm font-medium font-work-sans">For complete customization:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto font-work-sans">
              import { SkeletonSection } from '@/components/ui/molecules/skeleton/SkeletonSection'
import { FormFieldSkeleton } from '@/components/ui/molecules/skeleton/FormFieldSkeleton'

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
    </div>);

}
/**
 * SkeletonExamples - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const SkeletonExamples = {
  LoadingSkeletonExamples
};

export default SkeletonExamples;
