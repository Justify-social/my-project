'use client';

import { SignUp } from '@clerk/nextjs';
import { Suspense, useState, useEffect } from 'react';
import { AuthSkeleton } from '@/components/ui/loading-skeleton';

// Removed Link import as it's handled by Clerk component
// import Link from 'next/link';

function SignUpComponent() {
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return <AuthSkeleton />;
  }

  return (
    <div className="w-full">
      {/* Unified Auth Block - Header and Form Centered Together */}
      <div className="text-center space-y-3 sm:space-y-4 lg:space-y-3 xl:space-y-5">
        {/* Welcome Header */}
        <div>
          <h2 className="font-sora text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-slate-900 mb-1 sm:mb-2 lg:mb-1 xl:mb-3 tracking-tight leading-tight">
            Start measuring ROI
          </h2>
          <p className="text-slate-600 font-medium text-xs sm:text-sm lg:text-sm xl:text-base leading-relaxed">
            Join enterprise marketing teams proving results
          </p>
        </div>

        {/* Clerk Form - Responsive and Dynamic Styling */}
        <div>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                card: 'bg-white border border-slate-200/60 rounded-xl shadow-sm p-4 sm:p-5 lg:p-4 xl:p-5 w-full',
                rootBox: 'w-full',
                formContainer: 'w-full space-y-2 sm:space-y-3 lg:space-y-2 xl:space-y-3',
                formFieldInput:
                  'w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] focus:outline-none transition-colors text-left leading-tight',
                formFieldLabel:
                  'text-left text-sm font-medium text-slate-700 mb-1 block w-full leading-tight',
                formButtonPrimary:
                  'w-full bg-[#333333] hover:bg-[#4A5568] text-white font-medium py-2 px-4 rounded-md transition-colors text-sm mt-2 leading-tight',
                formHeaderTitle: 'hidden',
                formHeaderSubtitle: 'hidden',
                socialButtons: 'w-full space-y-1.5 mb-2 sm:mb-3 lg:mb-2 xl:mb-3',
                socialButtonsBlockButton:
                  'w-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-md transition-colors text-sm flex items-center justify-center gap-2 leading-tight',
                dividerLine: 'bg-slate-200 my-2 sm:my-3 lg:my-2 xl:my-3',
                dividerText: 'text-slate-500 text-sm bg-white px-3 leading-tight',
                footerAction:
                  'text-center w-full mt-2 sm:mt-3 lg:mt-2 xl:mt-3 pt-2 border-t border-slate-100',
                footerActionLink:
                  'text-[#00BFFF] hover:text-[#3182CE] font-medium text-sm leading-tight',
                formFieldErrorText: 'text-red-500 text-xs mt-0.5 text-left leading-tight',
                identityPreviewEditButton: 'text-[#00BFFF] hover:text-[#3182CE] leading-tight',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <SignUpComponent />
    </Suspense>
  );
}
