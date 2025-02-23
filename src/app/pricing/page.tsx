'use client';

import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";

export default function Page() {
  const [pageUrl, setPageUrl] = useState<string>('');
  const [pagePath, setPagePath] = useState<string>('');

  useEffect(() => {
    console.log('Pricing page rendering');
    setPageUrl(window.location.href);
    setPagePath(window.location.pathname);
  }, []);
  
  return (
    <ErrorBoundary>
      <div className="flex-1 p-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold">Pricing Page Test</h1>
            <p>If you can see this, the route is working!</p>
            {pageUrl && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>Debug Info:</p>
                <p>Current URL: {pageUrl}</p>
                <p>Pathname: {pagePath}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 