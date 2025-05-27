'use client';

import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming button path

export default function ClientAuthComponents() {
  return (
    <>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: 'w-14 h-14', // Match coins and bell size (56px)
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
