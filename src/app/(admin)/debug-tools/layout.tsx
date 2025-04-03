'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function DebugToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Main content */}
      <div className="w-full overflow-auto">
        {children}
      </div>
    </div>
  );
} 