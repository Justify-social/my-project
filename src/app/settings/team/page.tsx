'use client'; // Mark as Client Component

import { OrganizationProfile, useOrganization, OrganizationSwitcher, CreateOrganization } from '@clerk/nextjs'; // Import useOrganization AND OrganizationSwitcher/CreateOrganization
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Card for fallback message

// Skeleton placeholder for OrganizationProfile
const OrgProfileSkeleton = () => (
    <div className="space-y-8">
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4 mt-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

const TeamManagementPage = () => {
    // Get Clerk organization loading state AND the organization object
    const { organization, isLoaded: isOrgLoaded } = useOrganization();

    return (
        <div className="space-y-8">
            {!isOrgLoaded ? (
                <OrgProfileSkeleton />
            ) : organization ? (
                // Only render OrgProfile if an organization is loaded and active
                <OrganizationProfile
                    path="/settings/team" // Changed path to match actual route
                    routing="path"
                    appearance={{
                        baseTheme: undefined,
                        elements: {
                            card: 'bg-transparent shadow-none border-none p-0',
                            pageScrollBox: 'p-0',
                            navbar: 'hidden', // Assuming you want to hide internal nav
                            headerTitle: 'text-primary text-xl font-bold mb-1',
                            headerSubtitle: 'text-secondary text-sm mb-4',
                            formFieldInput: 'border-divider focus:ring-accent focus:border-accent block w-full rounded-md shadow-sm sm:text-sm py-2 px-3',
                            formFieldLabel: 'text-sm font-medium text-primary mb-1 block',
                            formButtonPrimary: 'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                            formButtonReset: 'text-secondary hover:text-primary text-sm font-medium py-2 px-4 rounded-md border border-divider',
                            button__danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
                            selectButton: 'border-divider text-primary',
                            selectOptionsContainer: 'bg-background border-divider',
                            tableHead: 'text-muted-foreground text-sm font-medium',
                            tableRow: 'border-b border-divider',
                            tableCell: 'py-3 px-4 text-sm text-primary',
                            badge: 'bg-secondary text-secondary-foreground',
                            dividerLine: 'bg-divider my-6',
                            navbarButton: 'text-primary hover:bg-muted',
                            navbarButton__active: 'bg-muted text-primary font-semibold',
                        },
                    }}
                />
            ) : (
                // Render fallback UI if loaded but no organization is active
                <Card className="border-divider">
                    <CardHeader>
                        <CardTitle>No Active Organization</CardTitle>
                        <CardDescription>
                            Select an organization to manage or create a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start gap-4">
                        <p className="text-sm text-secondary">Use the switcher below:</p>
                        {/* Use Clerk's built-in switcher */}
                        <OrganizationSwitcher
                            hidePersonal={true} // Often hide personal workspace in team settings
                            appearance={{ /* Add custom styling if needed */ }}
                        />
                        {/* Optionally add Create Organization Button */}
                        {/* <CreateOrganization /> */}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TeamManagementPage; 