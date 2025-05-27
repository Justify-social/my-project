'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// --- Helper: Card for Debug Tool Links ---
interface DebugToolCardProps {
  title: string;
  description: string;
  linkHref?: string;
  buttonText: string;
  onButtonClick?: () => void;
  isLoading?: boolean;
}

const DebugToolCard: React.FC<DebugToolCardProps> = ({
  title,
  description,
  linkHref,
  buttonText,
  onButtonClick,
  isLoading,
}) => (
  <Card className="border-divider">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      {linkHref ? (
        <Button variant="default" asChild>
          <Link href={linkHref}>{buttonText}</Link>
        </Button>
      ) : (
        <Button variant="default" onClick={onButtonClick} disabled={isLoading}>
          {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
          {buttonText}
        </Button>
      )}
    </CardContent>
  </Card>
);
// -------------------------------------

export default function DebugToolsPage() {
  return (
    <div className="w-full p-6 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Debug Tools</h1>

      {/* Debug Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Debug Tools arranged in alphabetical order */}
        <DebugToolCard
          title="API Verification"
          description="Test and verify external API integrations."
          linkHref="/debug-tools/api-verification"
          buttonText="Open API Verification"
        />
        <DebugToolCard
          title="Campaign Wizard Checker"
          description="View all created campaign wizards."
          linkHref="/debug-tools/campaign-wizards"
          buttonText="Check Campaign Wizards"
        />
        <DebugToolCard
          title="Clerk Authentication"
          description="Test and debug authentication flow, configuration, and user states."
          linkHref="/debug-tools/clerk-auth"
          buttonText="Test Authentication"
        />
        <DebugToolCard
          title="Cypress Analytics Dashboard"
          description="Comprehensive test analytics, performance metrics, coverage analysis, and error patterns."
          linkHref="/debug-tools/analytics"
          buttonText="View Analytics Dashboard"
        />
        <DebugToolCard
          title="Database Health"
          description="Access schema, documentation, and health monitoring."
          linkHref="/debug-tools/database"
          buttonText="View Database Health"
        />
        <DebugToolCard
          title="Documentation Hub"
          description="Access comprehensive developer documentation and guides."
          buttonText="View Documentation"
          onButtonClick={() => window.open('https://justify-1.gitbook.io/jzyx2tuf', '_blank')}
        />
        <DebugToolCard
          title="Mux Asset Checker"
          description="View and verify Mux video assets."
          linkHref="/debug-tools/mux-assets"
          buttonText="Check Mux Assets"
        />
        <DebugToolCard
          title="Notification Management"
          description="Create, manage, and test the notification system."
          linkHref="/debug-tools/notifications"
          buttonText="Manage Notifications"
        />
        <DebugToolCard
          title="Resend Email Management"
          description="Comprehensive email management, analytics, templates, and monitoring."
          linkHref="/debug-tools/resend-management"
          buttonText="Manage Email System"
        />
        <DebugToolCard
          title="UI Components"
          description="View and test centralized UI components."
          linkHref="/debug-tools/ui-components"
          buttonText="View UI Components"
        />
      </div>

      {/* Campaign Verification Tool Section - REMOVED */}
      {/* 
      <Card id="campaign-verify" className="border-divider">
        <CardHeader>
          <CardTitle className="text-xl">Verify Campaign Data</CardTitle>
          <CardDescription>Enter a campaign ID to verify its data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              placeholder="Enter Campaign ID"
              className="flex-grow"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(step => (
              <Button key={step} variant="secondary" disabled={!campaignId}>
                Go to Step {step}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      */}

      {/* Campaign Results Display - Also REMOVED */}
    </div>
  );
}
