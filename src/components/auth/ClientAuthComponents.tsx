'use client';

import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming button path
import { NAVIGATION_CONSTANTS } from '@/components/ui/navigation/navigation-constants';

export default function ClientAuthComponents() {
  return (
    <>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: NAVIGATION_CONSTANTS.profileSize,
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        {/* Example Sign In Button - Adjust as needed */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </SignedOut>
    </>
  );
}
