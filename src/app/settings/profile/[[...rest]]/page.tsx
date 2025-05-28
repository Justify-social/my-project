'use client';

import React, { Suspense } from 'react';
import { UserProfile, SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileSkeleton } from '@/components/ui/loading-skeleton';

// Basic User Profile Page using Clerk component
const UserProfileSettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <Suspense fallback={<ProfileSkeleton />}>
          <UserProfile
            path="/settings/profile" // Matches the route
            routing="path" // Required for catch-all
            appearance={{
              elements: {
                // --- Core Theme Styles (Consistent with OrgProfile) ---
                rootBox: 'w-full',
                card: 'w-full max-w-none shadow-none border-none bg-transparent', // Invisible card

                // --- Text & Headers ---
                headerTitle: 'text-primary text-2xl font-bold mb-1',
                headerSubtitle: 'text-secondary text-sm mb-6',
                profileSectionTitleText:
                  'text-lg font-semibold text-primary mb-4 border-b border-divider pb-2',
                accordionTrigger: 'text-md font-medium text-primary hover:no-underline',
                dividerLine: 'border-divider',

                // --- Navigation (if applicable within UserProfile) ---
                navbar: 'border-r border-divider pr-4 md:pr-6 lg:pr-8', // Optional styling if navbar used
                navbarButton:
                  'text-secondary hover:text-primary hover:bg-muted rounded-md font-medium',
                navbarButtonIcon: 'text-secondary group-hover:text-primary',

                // --- Form Elements ---
                formFieldLabel: 'text-sm font-medium text-secondary mb-1 block',
                formInput:
                  'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                formFieldHintText: 'text-xs text-muted-foreground mt-1',
                formFieldErrorText: 'text-xs text-destructive mt-1',
                formButtonPrimary:
                  'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50', // Use PRIMARY bg
                formButtonReset: 'text-secondary hover:text-primary text-sm font-medium',
                select__control: 'border border-input rounded-md',
                selectButton: 'border border-input rounded-md bg-background hover:bg-muted',
                selectOptionsContainer: 'bg-popover border border-border rounded-md shadow-md',

                // --- Specific Components ---
                userPreviewMainIdentifier: 'text-primary font-medium',
                userPreviewSecondaryIdentifier: 'text-secondary text-sm',
                badge: 'bg-muted text-secondary text-xs font-medium px-2.5 py-0.5 rounded-full',
                button__danger: 'text-destructive hover:text-destructive/90',
              },
            }}
          >
            {/* Custom sections can still be added here if needed */}
          </UserProfile>

          <Separator />
          <div className="flex justify-start pt-4">
            <SignOutButton redirectUrl="/sign-in">
              <Button variant="outline">Sign Out</Button>
            </SignOutButton>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default UserProfileSettingsPage;
