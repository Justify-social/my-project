'use client';

import React, { Suspense } from 'react';
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function ClientPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wizardContext = useWizard();

  if (!wizardContext) {
    throw new Error('Wizard context is required');
  }

  const handleNextStep = async () => {
    const campaignId = searchParams.get('id');
    router.push(`/campaigns/wizard/step-4${campaignId ? `?id=${campaignId}` : ''}`);
  };

  const handlePreviousStep = () => {
    const campaignId = searchParams.get('id');
    router.push(`/campaigns/wizard/step-2${campaignId ? `?id=${campaignId}` : ''}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <Header currentStep={3} totalSteps={5} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Step 3: Audience Targeting</h1>
        <p className="text-gray-600">
          Define your target audience and demographic preferences.
        </p>
      </div>

      {/* Add your audience targeting components here */}
      
      <ProgressBar
        currentStep={3}
        onStepClick={(step) => {
          const campaignId = searchParams.get('id');
          router.push(`/campaigns/wizard/step-${step}${campaignId ? `?id=${campaignId}` : ''}`);
        }}
        onBack={handlePreviousStep}
        onNext={handleNextStep}
        isFormValid={true}
        isDirty={false}
      />
    </div>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientPageContent />
    </Suspense>
  );
} 