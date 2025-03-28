'use client';

import React from 'react';

export default function MMMLayout({
  children


}: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen bg-gray-50 font-work-sans">
      <main>
        {children}
      </main>
    </div>);

}