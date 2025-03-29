import React from 'react';
import { useRouter } from 'next/navigation';

export interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-work-sans" role="alert">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full font-work-sans">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-sora">Something went wrong</h2>
        
        {error &&
        <p className="text-gray-600 mb-6 font-work-sans">
            {error.message || 'An unexpected error occurred'}
          </p>
        }

        <div className="flex flex-col sm:flex-row gap-4 font-work-sans">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-work-sans">

            Refresh Page
          </button>
          
          {resetErrorBoundary &&
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-work-sans">

              Try Again
            </button>
          }
          
          <button
            onClick={() => router.push('/campaigns')}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-work-sans">

            Return to Campaigns
          </button>
        </div>
      </div>
    </div>);

};

export default ErrorFallback;