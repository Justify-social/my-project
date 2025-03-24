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
    <div className="flex-1 p-8 font-work-sans">
      <div className="max-w-screen-xl mx-auto font-work-sans">
        <div className="bg-red-50 rounded-lg shadow-sm p-6 font-work-sans">
          <h1 className="text-2xl font-bold text-red-600 font-sora">Pricing Page Not Found</h1>
          {pageUrl &&
          <>
              <p className="font-work-sans">Debug Info:</p>
              <p className="font-work-sans">URL: {pageUrl}</p>
              <p className="font-work-sans">Pathname: {pagePath}</p>
            </>
          }
        </div>
      </div>
    </div>);

}