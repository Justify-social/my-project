'use client';

import { useEffect, useState } from 'react';

export default function NotFound() {
  const [pageUrl, setPageUrl] = useState<string>('');
  const [pagePath, setPagePath] = useState<string>('');

  useEffect(() => {
    setPageUrl(window.location.href);
    setPagePath(window.location.pathname);
  }, []);

  return (
    <div className="flex-1 p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-red-50 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-600">Pricing Page Not Found</h1>
          {pageUrl && (
            <>
              <p>Debug Info:</p>
              <p>URL: {pageUrl}</p>
              <p>Pathname: {pagePath}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 