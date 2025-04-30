'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SubmissionContent() {
  const wizardContext = useWizard();
  const router = useRouter();

  if (!wizardContext) {
    return null;
  }

  const { wizardState, isLoading } = wizardContext;

  const campaignId = wizardState?.id;
  const campaignName = wizardState?.name || 'your campaign';

  // --- Loading State ---
  if (isLoading && !wizardState) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <WizardSkeleton />
      </div>
    );
  }

  // --- Error State ---
  if (!isLoading && !campaignId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)] text-center p-6">
        <Icon iconId="faTriangleExclamationLight" className="text-destructive h-16 w-16 mb-6" />
        <h2 className="text-2xl font-semibold mb-3">Error Loading Confirmation</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Could not retrieve campaign details for confirmation. The campaign ID might be missing or
          invalid.
        </p>
        <Button variant="outline" onClick={() => router.push('/campaigns')}>
          <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-6">
      {/* Enhanced Success Message */}
      <h1 className="text-5xl font-bold mb-5 tracking-tight">Campaign Submitted!</h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-xl">
        Congratulations! Your campaign{' '}
        <span className="font-semibold text-foreground">"{campaignName}"</span> has been
        successfully submitted.
      </p>

      {/* Navigation Options Card */}
      <Card className="w-full max-w-lg bg-gradient-to-br from-background to-muted/20 border-none shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-center">
            What would you like to do next?
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 px-8 pb-8">
          {/* Start Brand Lift - Primary Action */}
          <Button
            variant="default"
            size="lg"
            className="w-full shadow-lg bg-accent hover:bg-accent/90 text-primary-foreground"
            onClick={() => router.push(`/brand-lift?campaignId=${campaignId}`)} // Example target URL
            disabled={!campaignId}
          >
            <Icon iconId="faArrowTrendUpLight" className="mr-2" />
            Start Brand Lift
          </Button>

          <Separator className="my-2" />

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-background/80"
              onClick={() => router.push('/campaigns')} // Navigate to campaigns list
            >
              <Icon iconId="faListLight" className="mr-2" />
              View Campaigns
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              <Icon iconId="faChartLineLight" className="mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
