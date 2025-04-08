/**
 * @component LoadingSpinnerExample
 * @description Example usage of the LoadingSpinner component
 */

import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function LoadingSpinnerExample() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Loading Spinner</h2>
        <p className="text-gray-500">
          A loading spinner component with customizable size and color.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-2">
          <h3 className="font-medium">Default</h3>
          <LoadingSpinner />
        </div>

        <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-2">
          <h3 className="font-medium">Small</h3>
          <LoadingSpinner size="sm" />
        </div>

        <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-2">
          <h3 className="font-medium">Medium</h3>
          <LoadingSpinner size="md" />
        </div>

        <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-2">
          <h3 className="font-medium">Large</h3>
          <LoadingSpinner size="lg" />
        </div>

        <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-2">
          <h3 className="font-medium">Custom Color</h3>
          <LoadingSpinner color="#00BFFF" />
        </div>

        <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-2 bg-gray-800">
          <h3 className="font-medium text-white">On Dark Background</h3>
          <LoadingSpinner color="white" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">With Text</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-4">
            <h3 className="font-medium">Inline with Text</h3>
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Loading data...</span>
            </div>
          </div>

          <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-4">
            <h3 className="font-medium">Centered with Text Below</h3>
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="md" />
              <span>Please wait</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">In Context</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="border p-6 rounded-lg flex flex-col items-center justify-center gap-4">
            <h3 className="font-medium">Button Loading State</h3>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-gray-200 rounded flex items-center justify-center gap-2">
                <span>Default</span>
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center gap-2" disabled>
                <LoadingSpinner size="sm" color="white" />
                <span>Loading</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 