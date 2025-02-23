'use client';

import React from 'react';
import { useWizard } from "@/context/WizardContext";
import Header from "@/components/Wizard/Header";
import ProgressBar from "@/components/Wizard/ProgressBar";
import { useRouter } from "next/navigation";

export default function ClientPage() {
  const router = useRouter();
  const wizardContext = useWizard();

  if (!wizardContext) {
    throw new Error('Wizard context is required');
  }

  const handleNextStep = async () => {
    router.push('/campaigns/wizard/step-4');
  };

  const handlePreviousStep = () => {
    router.push('/campaigns/wizard/step-2');
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
        onStepClick={(step) => router.push(`/campaigns/wizard/step-${step}`)}
        onBack={handlePreviousStep}
        onNext={handleNextStep}
        isFormValid={true}
        isDirty={false}
      />
    </div>
  );
} 