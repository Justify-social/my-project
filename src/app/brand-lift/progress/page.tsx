"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create a separate component for the content that uses useSearchParams
const ProgressContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Move all your existing content and logic here
  // Copy everything from your current page except the outer wrapper
  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8">
      {/* Your existing content stays exactly the same */}
      {/* Just move it from the main component into here */}
    </div>
  );
};

// Main page component with Suspense boundary
export default function BrandLiftProgressPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8">
          <h1 className="text-2xl font-bold">Loading Progress...</h1>
        </div>
      }
    >
      <ProgressContent />
    </Suspense>
  );
}
