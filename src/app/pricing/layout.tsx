'use client';

import { useEffect, useState } from 'react';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('PricingLayout mounted');
    console.log('Current pathname:', window.location.pathname);
    console.log('Current URL:', window.location.href);
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {mounted && (
        <div className="fixed top-0 right-0 bg-yellow-100 p-2 text-xs z-50">
          Layout loaded
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
} 