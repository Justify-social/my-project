'use client';

import React from 'react';
import { OrganizationProfile, useOrganization, OrganizationSwitcher } from '@clerk/nextjs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Skeleton placeholder for OrganizationProfile
const OrgProfileSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-8 w-1/4 mb-6" />
    <Card className="border-divider">
      <CardHeader>
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  </div>
);

// --- Main Component using Clerk's Pre-built UI ---
const TeamManagementPage = () => {
  const { organization, isLoaded: isOrgLoaded } = useOrganization();

  return (
    <div className="space-y-8">
      {!isOrgLoaded ? (
        <OrgProfileSkeleton />
      ) : organization ? (
        // Use a simple wrapper allowing the component to dictate its width
        <div className="w-full">
          <OrganizationProfile
            path="/settings/team" // Clerk uses this for internal routing
            routing="path" // Required for catch-all routes
            appearance={{
              elements: {
                // --- Core Theme Styles ---
                rootBox: 'w-full', // Let it try to fill container
                card: 'w-full max-w-none shadow-none border-none bg-transparent', // Make internal card invisible

                // --- Text & Headers ---
                headerTitle: 'text-primary text-2xl font-bold mb-1',
                headerSubtitle: 'text-secondary text-sm mb-6',
                profileSectionTitleText:
                  'text-lg font-semibold text-primary mb-4 border-b border-divider pb-2',
                accordionTrigger: 'text-md font-medium text-primary hover:no-underline',
                dividerLine: 'border-divider',

                // --- Form Elements ---
                formFieldLabel: 'text-sm font-medium text-secondary mb-1 block',
                formInput:
                  'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                formFieldHintText: 'text-xs text-muted-foreground mt-1',
                formFieldErrorText: 'text-xs text-destructive mt-1',
                formButtonPrimary:
                  'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50',
                formButtonReset: 'text-secondary hover:text-primary text-sm font-medium',
                select__control: 'border border-input rounded-md',
                selectButton: 'border border-input rounded-md bg-background hover:bg-muted',
                selectOptionsContainer: 'bg-popover border border-border rounded-md shadow-md',

                // --- Table Elements ---
                tableHead: 'text-xs uppercase text-muted-foreground font-medium px-4 py-2',
                tableRow: 'border-b border-divider',
                tableCell: 'py-3 px-4 text-sm text-primary align-middle',
                paginationButton: 'text-secondary hover:text-primary disabled:opacity-50',

                // --- Specific Components ---
                badge: 'bg-muted text-secondary text-xs font-medium px-2.5 py-0.5 rounded-full',
                button__danger: 'text-destructive hover:text-destructive/90',
              },
            }}
          />
        </div>
      ) : (
        <Card className="border-divider max-w-md mx-auto">
          {' '}
          {/* Keep fallback centered */}
          <CardHeader>
            <CardTitle>No Active Organization</CardTitle>
            <CardDescription>Select an organization to manage or create a new one.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <OrganizationSwitcher
              hidePersonal={true}
              appearance={
                {
                  /* Add custom styling if needed */
                }
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagementPage;
