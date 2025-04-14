'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { InfluencerCard } from "@/components/ui/card-influencer"; // Assuming this can display fetched/validated data
import { ProgressBarWizard } from "@/components/ui/progress-bar-wizard"; // Import progress bar
import { PlatformEnumBackend, platformToFrontend } from '@/components/features/campaigns/types'; // Import platform types

// Helper to format currency
const formatCurrency = (value: number | undefined | null, currencyCode: string = 'USD'): string => {
  if (value === undefined || value === null) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return `${currencyCode} ${value}`; // Fallback
  }
};

// Helper to display contact info
const ContactDisplay: React.FC<{ contact: any; label: string }> = ({ contact, label }) => {
  if (!contact || (!contact.firstName && !contact.surname && !contact.email)) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm">{contact.firstName} {contact.surname}</p>
      <p className="text-sm text-muted-foreground">{contact.email}</p>
      {contact.position && <p className="text-xs text-muted-foreground/80">({contact.position})</p>}
    </div>
  );
};


export default function SubmissionContent() {
  const { wizardState, isLoading, updateWizardState, saveProgress, stepsConfig } = useWizard(); // Add stepsConfig
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const campaignData = wizardState; // Use the whole state for summary

  const handleGoBack = () => {
    // Navigate back to the previous step (assuming step 4 is the last before submission)
    if (campaignData?.campaignId) {
      const previousStep = stepsConfig.find(step => step.number === stepsConfig.length - 1)?.number || 4; // Default to 4 if not found
      router.push(`/campaigns/wizard/step-${previousStep}?id=${campaignData.campaignId}`);
    } else {
      console.warn("Cannot go back, campaign ID missing.");
      router.push('/campaigns'); // Fallback
    }
  };

  const handleFinalSubmit = useCallback(async () => {
    if (!campaignData?.campaignId) {
      toast.error("Campaign ID is missing. Cannot submit.");
      return;
    }
    setIsSubmitting(true);
    toast.loading("Submitting campaign...", { id: 'submission-toast' });

    try {
      // 1. Update final state (optional, if needed)
      // updateWizardState({ status: 'Submitted', submissionDate: new Date().toISOString() });
      // await saveProgress(); // Ensure final state is saved

      // 2. **Placeholder for actual API call to submit/finalize the campaign**
      console.log("Submitting campaign data:", campaignData);
      // Replace with actual API call:
      // const response = await fetch('/api/campaigns/submit', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ campaignId: campaignData.campaignId })
      // });
      // if (!response.ok) throw new Error('Submission failed');
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("API Call Simulated Success");

      toast.success("Campaign Submitted Successfully!", { id: 'submission-toast' });

      // 3. Redirect to a success page or dashboard
      router.push(`/campaigns/details/${campaignData.campaignId}?status=submitted`);

    } catch (error) {
      console.error("Campaign submission failed:", error);
      toast.error("Failed to submit campaign. Please try again.", { id: 'submission-toast' });
      setIsSubmitting(false);
    }
    // No finally block needed for setIsSubmitting(false) because we redirect on success
  }, [campaignData, router, updateWizardState, saveProgress]); // Add dependencies

  // Memoize filtered influencers for display
  const displayInfluencers = useMemo(() => {
    return campaignData?.Influencer?.filter(inf => inf?.platform && inf?.handle) || [];
  }, [campaignData?.Influencer]);

  // Memoize filtered additional contacts
  const displayAdditionalContacts = useMemo(() => {
    return campaignData?.additionalContacts?.filter(c => c?.email) || [];
  }, [campaignData?.additionalContacts]);

  if (isLoading && !campaignData) {
    // Use the step number for the submission step from stepsConfig
    // Assume submission is the last step
    const submissionStepNumber = stepsConfig.length > 0 ? stepsConfig[stepsConfig.length - 1].number : 5; // Default to 5 if empty
    return <WizardSkeleton step={submissionStepNumber} />;
  }

  if (!campaignData?.campaignId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <Icon iconId="faTriangleExclamationLight" className="text-destructive h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Campaign</h2>
        <p className="text-muted-foreground text-center mb-4">Could not load campaign data. It might not exist or there was an error.</p>
        <Button variant="outline" onClick={() => router.push('/campaigns')}>
          <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  // Assume submission is the last step
  const submissionStepNumber = stepsConfig.length > 0 ? stepsConfig[stepsConfig.length - 1].number : 5; // Default to 5 if empty

  return (
    <>
      {/* Add Progress Bar */}
      <ProgressBarWizard
        currentStep={submissionStepNumber}
        steps={stepsConfig}
        onStepClick={(step) => { // Allow navigation back to completed steps
          // Ensure step number is valid and campaignId exists
          if (step < submissionStepNumber && campaignData?.campaignId) {
            // Construct path using step number
            const path = `/campaigns/wizard/step-${step}?id=${campaignData.campaignId}`;
            router.push(path);
          }
        }}
        onBack={handleGoBack} // Use the custom back handler
        onNext={handleFinalSubmit}
        isNextDisabled={isSubmitting || isLoading}
        isNextLoading={isSubmitting}
      />
      <div className="space-y-6 pt-8 pb-[var(--footer-height)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon iconId="faListCheckLight" className="mr-3 h-5 w-5 text-primary" />
              Campaign Summary
            </CardTitle>
            <CardDescription>Please review the details below before submitting your campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default">
              <Icon iconId="faCircleInfoLight" className="h-4 w-4" />
              <AlertDescription>
                Campaign Name: <span className="font-semibold text-foreground">{campaignData.name || 'N/A'}</span>
              </AlertDescription>
            </Alert>
            {campaignData.businessGoal && (
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Goal:</span> {campaignData.businessGoal}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="font-medium text-foreground">Start Date:</span> {campaignData.startDate ? format(new Date(campaignData.startDate), 'PPP') : 'N/A'}</div>
              <div><span className="font-medium text-foreground">End Date:</span> {campaignData.endDate ? format(new Date(campaignData.endDate), 'PPP') : 'N/A'}</div>
              <div className="md:col-span-2"><span className="font-medium text-foreground">Time Zone:</span> {campaignData.timeZone || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon iconId="faUsersLight" className="mr-3 h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContactDisplay contact={campaignData.primaryContact} label="Primary Contact" />
            {campaignData.secondaryContact && (campaignData.secondaryContact.firstName || campaignData.secondaryContact.surname || campaignData.secondaryContact.email) && (
              <ContactDisplay contact={campaignData.secondaryContact} label="Secondary Contact" />
            )}
            {displayAdditionalContacts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Additional Contacts</h4>
                {displayAdditionalContacts.map((contact, index) => (
                  <ContactDisplay key={index} contact={contact} label={`Additional Contact ${index + 1}`} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon iconId="faSackDollarLight" className="mr-3 h-5 w-5 text-primary" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div><span className="font-medium text-foreground">Total Budget:</span> {formatCurrency(campaignData.budget?.total, campaignData.budget?.currency)}</div>
            <div><span className="font-medium text-foreground">Social Media Budget:</span> {formatCurrency(campaignData.budget?.socialMedia, campaignData.budget?.currency)}</div>
            <div className="sm:col-span-2"><span className="font-medium text-foreground">Currency:</span> {campaignData.budget?.currency || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon iconId="faUserTagLight" className="mr-3 h-5 w-5 text-primary" />
              Influencer(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayInfluencers.length > 0 ? (
              <div className="space-y-4">
                {displayInfluencers.map((inf, index) => (
                  <InfluencerCard
                    key={inf.id || index} // Use inf.id if available, fallback to index
                    platform={inf.platform}
                    handle={inf.handle}
                    // Pass other available validated data if stored in wizardState
                    // displayName={inf.displayName}
                    // avatarUrl={inf.avatarUrl}
                    // followerCount={inf.followerCount}
                    // verified={inf.verified}
                    className="bg-card/50 border-border" // Use neutral card style
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No influencers added.</p>
            )}
          </CardContent>
        </Card>

        {/* Final Submit Button is now part of ProgressBarWizard Footer */}

      </div>
    </>
  );
}
