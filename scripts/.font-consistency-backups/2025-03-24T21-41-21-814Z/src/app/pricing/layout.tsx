'use client';

import { useEffect, useState } from 'react';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main content */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
} 