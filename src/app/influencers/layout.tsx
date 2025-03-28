'use client';

import React, { ReactNode } from 'react';

export default function InfluencersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {children}
    </div>
  );
} 