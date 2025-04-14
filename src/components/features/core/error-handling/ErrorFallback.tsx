'use client';

import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component exists

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * A standard fallback component to display when an ErrorBoundary catches an error.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  console.error('Render Error Caught:', error); // Log the error for debugging

  return (
    <div
      role="alert"
      className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800 font-body"
    >
      <div className="flex items-center mb-3">
        <Icon iconId="faTriangleExclamationLight" className="h-5 w-5 mr-2 text-red-600" />
        <h3 className="text-lg font-semibold text-red-900 font-heading">Something went wrong</h3>
      </div>
      <p className="mb-4 text-sm">We encountered an unexpected error. Please try again.</p>
      {/* Optional: Display error message in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-4 text-xs bg-red-100 p-2 rounded">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">
            {error?.message || 'No error message available'}
            {'\n'}
            {error?.stack || 'No stack trace available'}
          </pre>
        </details>
      )}
      <Button onClick={resetErrorBoundary} variant="destructive" size="sm">
        Try Again
      </Button>
    </div>
  );
};

export default ErrorFallback;
