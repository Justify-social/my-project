import React from 'react';
import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" role="alert">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        
        {error && (
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
          
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          )}
          
          <button
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Return to Campaigns
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback; 