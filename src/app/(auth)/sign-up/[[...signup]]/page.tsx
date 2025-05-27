'use client';

import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';
import { AuthSkeleton } from '@/components/ui/loading-skeleton';

// Removed Link import as it's handled by Clerk component
// import Link from 'next/link';

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <div className="w-full">
        {/* Enterprise Header */}
        <div className="text-center mb-10">
          <h2 className="font-sora text-3xl font-bold text-slate-900 mb-3">Start measuring ROI</h2>
          <p className="text-slate-600 font-medium">
            Join enterprise marketing teams proving results
          </p>
        </div>

        {/* Clean Clerk Form with Default Styling */}
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              card: 'shadow-none border-0 bg-transparent',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            },
          }}
        />
      </div>
    </Suspense>
  );
}
