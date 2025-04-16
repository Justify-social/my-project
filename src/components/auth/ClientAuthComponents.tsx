'use client';

import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming button path

export default function ClientAuthComponents() {
    return (
        <>
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
                {/* Example Sign In Button - Adjust as needed */}
                <Link href="/signin" passHref>
                    <Button variant="outline" size="sm">Sign In</Button>
                </Link>
            </SignedOut>
        </>
    );
} 