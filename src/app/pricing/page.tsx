'use client';

import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

export default function Page() {
  console.log('Pricing page rendering');
  
  return (
    <ErrorBoundary>
      <div className="flex-1 p-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold">Pricing Page Test</h1>
            <p>If you can see this, the route is working!</p>
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>Debug Info:</p>
              <p>Current URL: {window.location.href}</p>
              <p>Pathname: {window.location.pathname}</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 