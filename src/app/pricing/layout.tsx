'use client';

import { useEffect } from 'react';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('Pricing layout mounted');
  }, []);

  return (
    <div className="flex-1 relative">
      {/* Debug overlay */}
      <div className="absolute top-0 right-0 bg-yellow-100 p-2 text-xs">
        Layout loaded
      </div>
      {children}
    </div>
  );
} 