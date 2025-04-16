'use client';

import React from 'react';
// import { usePathname } from 'next/navigation'; // Unused import

// Simply pass children through without wrapping in additional containers
// This will allow debug tools to inherit the root layout with navigation
export default function DebugToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
