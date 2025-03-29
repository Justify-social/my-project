import React from 'react';
import Spinner from './Spinner/index';
import ButtonSpinner from './spinner/index';
import InlineSpinner from './spinner/index';
import DotsSpinner from './spinner/index';
import {
  Spinner,
  AuthSpinner,
  ButtonSpinner,
  InlineSpinner,
  DotsSpinner,
  FullscreenSpinner } from
'@/components/ui/spinner';

export function LoadingSpinnerExamples() {
  return (
    <div className="space-y-8 font-work-sans" id="loading-spinners">
      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Spinner Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-work-sans">
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Base Spinner Variants</p>
            <div className="flex gap-4 items-center font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Default</p>
                <Spinner />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Primary</p>
                <Spinner variant="primary" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Secondary</p>
                <Spinner variant="secondary" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Accent</p>
                <Spinner variant="accent" />
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Spinner Sizes</p>
            <div className="flex gap-4 items-center font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">XS</p>
                <Spinner size="xs" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">SM</p>
                <Spinner size="sm" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">MD</p>
                <Spinner size="md" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">LG</p>
                <Spinner size="lg" />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">XL</p>
                <Spinner size="xl" />
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Spinner with Label</p>
            <div className="space-y-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Bottom (default)</p>
                <Spinner showLabel={true} label="Loading..." />
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Right</p>
                <div className="flex items-center font-work-sans">
                  <Spinner />
                  <span className="ml-2 font-work-sans">Loading...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="font-work-sans">
            <p className="text-sm text-gray-500 mb-2 font-work-sans">Specialized Spinners</p>
            <div className="space-y-4 font-work-sans">
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Button Spinner</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center font-work-sans">
                  <ButtonSpinner className="mr-2" /> Loading...
                </button>
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Inline Spinner</p>
                <div className="text-sm font-work-sans">Loading your data <InlineSpinner /></div>
              </div>
              <div className="font-work-sans">
                <p className="text-xs text-gray-500 mb-1 font-work-sans">Dots Loading</p>
                <DotsSpinner />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="font-work-sans">
        <h2 className="text-lg font-semibold mb-4 font-sora">Authentication Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-work-sans">
          <div className="p-6 border rounded-lg bg-white shadow-sm font-work-sans">
            <p className="text-sm text-gray-500 mb-4 font-work-sans">AuthSpinner Component</p>
            <div className="flex flex-col items-center justify-center h-40 font-work-sans">
              <div className="scale-50 font-work-sans">
                <AuthSpinner label="Loading Justify..." />
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded border font-work-sans">
              <pre className="text-xs overflow-x-auto font-work-sans">
                {`import { AuthSpinner } from '@/components/ui/spinner';

// In your component
return <AuthSpinner label="Loading Justify..." />;`}
              </pre>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg bg-white shadow-sm font-work-sans">
            <p className="text-sm text-gray-500 mb-4 font-work-sans">Fullscreen Spinner</p>
            <div className="flex flex-col items-center justify-center h-40 relative border rounded font-work-sans">
              <div className="scale-75 absolute inset-0 flex items-center justify-center font-work-sans">
                <div className="relative bg-white/80 w-full h-full flex items-center justify-center font-work-sans">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 font-work-sans"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded border font-work-sans">
              <pre className="text-xs overflow-x-auto font-work-sans">
                {`import { FullscreenSpinner } from '@/components/ui/spinner';

// In your component
return <FullscreenSpinner label="Processing..." />;`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>);

}