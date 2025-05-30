'use client';

import React, { useEffect, useState } from 'react';
import { OrganizationProfile, CreateOrganization, useOrganization } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon/icon';

// Skeleton placeholder for OrganizationProfile
const OrgProfileSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-8 w-1/4 mb-6" />
    <Card className="border-border">
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

// New user setup card
const SetupOrganisationCard = () => (
  <Card className="border-accent bg-accent/5">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Icon iconId="faUserGroupSolid" className="h-6 w-6 text-accent" />
        <div>
          <CardTitle className="text-xl font-bold text-primary">
            Welcome! Create Your Organisation
          </CardTitle>
          <CardDescription className="text-secondary mt-2">
            To get started with the platform, you'll need to create an organisation. This helps us
            organise your campaigns, team members, and projects.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="bg-background p-4 rounded-lg border border-border">
        <h3 className="font-semibold mb-2 text-primary">What you can do here:</h3>
        <ul className="space-y-2 text-sm text-secondary">
          <li className="flex items-center gap-2">
            <Icon iconId="faCheckSolid" className="h-4 w-4 text-accent" />
            Create a new organisation for your team
          </li>
          <li className="flex items-center gap-2">
            <Icon iconId="faCheckSolid" className="h-4 w-4 text-accent" />
            Manage team members and permissions
          </li>
          <li className="flex items-center gap-2">
            <Icon iconId="faCheckSolid" className="h-4 w-4 text-accent" />
            Set up your organisation's branding and settings
          </li>
          <li className="flex items-center gap-2">
            <Icon iconId="faCheckSolid" className="h-4 w-4 text-accent" />
            Invite team members to collaborate
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
);

export default function TeamManagementPage() {
  const { organization, isLoaded } = useOrganization();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  const redirectUrl = searchParams.get('redirect_url');

  // Handle redirect only if there's a specific redirect URL and user has an organisation
  useEffect(() => {
    if (isLoaded && organization && redirectUrl && !hasRedirected) {
      setHasRedirected(true);
      // Small delay to ensure organisation is fully set up
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    }
  }, [isLoaded, organization, redirectUrl, router, hasRedirected]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl" data-cy="team-management-container">
        <OrgProfileSkeleton />
      </div>
    );
  }

  // No organisation state - show setup card with CreateOrganization
  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl" data-cy="team-management-container">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Team Management</h1>
              <p className="text-secondary mt-2">Create your organisation and manage your team</p>
            </div>
          </div>

          <SetupOrganisationCard />

          {/* CreateOrganization component for users without an organisation */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Create Organisation
              </CardTitle>
              <CardDescription className="text-secondary">
                Fill in the details below to create your new organisation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <CreateOrganization
                appearance={{
                  elements: {
                    organizationPreview: 'hidden',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                  },
                }}
                afterCreateOrganizationUrl="/settings/team"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Organisation exists - show normal team management with OrganizationProfile
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-cy="team-management-container">
      <div className="space-y-6">
        {/* Success message if user was just redirected */}
        {redirectUrl && (
          <Card className="border-success bg-success/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-success">
                <Icon iconId="faCircleCheckSolid" className="h-5 w-5" />
                <span className="font-medium">Organisation setup complete!</span>
              </div>
              <p className="text-sm text-success/80 mt-1">
                You can now access all platform features. You'll be redirected to continue shortly.
              </p>
            </CardContent>
          </Card>
        )}

        {/* OrganizationProfile - only renders when organisation exists */}
        <div className="organization-profile-container">
          <style
            dangerouslySetInnerHTML={{
              __html: `
              /* Hide dangerous organization actions */
              [data-localization-key*="leaveOrganization"],
              [data-localization-key*="deleteOrganization"],
              [data-localization-key*="dangerSection"],
              button[data-localization-key*="leaveOrganization"],
              button[data-localization-key*="deleteOrganization"],
              
              /* Hide slug field */
              input[name*="slug"],
              input[name="organizationSlug"],
              [data-localization-key*="organizationSlug"],
              
              /* Hide entire danger section */
              .cl-organizationProfilePage-danger,
              .cl-organizationProfilePage__dangerSection,
              
              /* Hide form rows containing slug */
              .cl-formFieldRow:has(input[name*="slug"]) {
                display: none !important;
                visibility: hidden !important;
              }
              
              /* Additional fallback hiding - text-based */
              .organization-profile-container button:is([class*="danger"], [class*="delete"], [class*="leave"]) {
                display: none !important;
              }
              
              /* Hide buttons with specific text content */
              .organization-profile-container button:contains("Leave organization"),
              .organization-profile-container button:contains("Delete organization") {
                display: none !important;
              }
            `,
            }}
          />
          <OrganizationProfile
            appearance={{
              elements: {
                // Hide dangerous organization actions section
                organizationProfilePage__dangerSection: 'hidden',
                organizationProfilePage__leaveOrganizationSection: 'hidden',
                organizationProfilePage__deleteOrganizationSection: 'hidden',

                // Hide slug editing field
                organizationProfilePage__organizationSlugField: 'hidden',
                formFieldRow__organizationSlug: 'hidden',

                // More specific element targeting for current Clerk versions
                'organizationProfile-page__danger': 'hidden',
                'organizationProfile-page__leaveOrganization': 'hidden',
                'organizationProfile-page__deleteOrganization': 'hidden',
                'organizationProfile-page__organizationSlug': 'hidden',

                // Alternative naming patterns
                '[data-localization-key="organizationProfile.profilePage.dangerSection.title"]':
                  'hidden',
                '[data-localization-key="organizationProfile.profilePage.dangerSection.leaveOrganization.title"]':
                  'hidden',
                '[data-localization-key="organizationProfile.profilePage.dangerSection.deleteOrganization.title"]':
                  'hidden',

                // CSS targeting as fallback
                'button[data-localization-key*="leaveOrganization"]': 'hidden',
                'button[data-localization-key*="deleteOrganization"]': 'hidden',
                'input[name*="slug"]': 'hidden',
                'input[name="organizationSlug"]': 'hidden',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
