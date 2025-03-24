import React from 'react';
import { 
  Spinner, 
  AuthSpinner, 
  ButtonSpinner, 
  InlineSpinner, 
  DotsSpinner, 
  FullscreenSpinner 
} from '@/components/ui/spinner';

export function LoadingSpinnerExamples() {
  return (
    <div className="space-y-8" id="loading-spinners">
      <div>
        <h2 className="text-lg font-semibold mb-4">Spinner Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-500 mb-2">Base Spinner Variants</p>
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Default</p>
                <Spinner />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Primary</p>
                <Spinner variant="primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Secondary</p>
                <Spinner variant="secondary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Accent</p>
                <Spinner variant="accent" />
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Spinner Sizes</p>
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">XS</p>
                <Spinner size="xs" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">SM</p>
                <Spinner size="sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">MD</p>
                <Spinner size="md" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">LG</p>
                <Spinner size="lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">XL</p>
                <Spinner size="xl" />
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Spinner with Label</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Bottom (default)</p>
                <Spinner showLabel={true} label="Loading..." />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Right</p>
                <div className="flex items-center">
                  <Spinner />
                  <span className="ml-2">Loading...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Specialized Spinners</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Button Spinner</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center">
                  <ButtonSpinner className="mr-2" /> Loading...
                </button>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Inline Spinner</p>
                <div className="text-sm">Loading your data <InlineSpinner /></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Dots Loading</p>
                <DotsSpinner />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Authentication Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-4">AuthSpinner Component</p>
            <div className="flex flex-col items-center justify-center h-40">
              <div className="scale-50">
                <AuthSpinner label="Loading Justify..." />
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <pre className="text-xs overflow-x-auto">
                {`import { AuthSpinner } from '@/components/ui/spinner';

// In your component
return <AuthSpinner label="Loading Justify..." />;`}
              </pre>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-4">Fullscreen Spinner</p>
            <div className="flex flex-col items-center justify-center h-40 relative border rounded">
              <div className="scale-75 absolute inset-0 flex items-center justify-center">
                <div className="relative bg-white/80 w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <pre className="text-xs overflow-x-auto">
                {`import { FullscreenSpinner } from '@/components/ui/spinner';

// In your component
return <FullscreenSpinner label="Processing..." />;`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 