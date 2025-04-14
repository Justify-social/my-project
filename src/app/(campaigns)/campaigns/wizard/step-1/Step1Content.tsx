import React, { useEffect } from 'react';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { ProgressBarWizard } from '@/components/ui/progress-bar-wizard';
import { useForm } from 'react-hook-form';

// Placeholder for form component or other content
export default function Step1Content() {
    const wizard = useWizard();
    const form = useForm();

    const handleStepClick = (stepNumber: number) => {
        console.log(`Navigating to step ${stepNumber}`);
        // Add navigation logic here
    };

    const handleNext = () => {
        console.log('Proceeding to next step');
        // Add navigation logic here
    };

    return (
        <div>
            {/* Add form content here */}
            <ProgressBarWizard
                currentStep={1}
                steps={wizard.stepsConfig}
                onStepClick={handleStepClick}
                onBack={null}
                onNext={handleNext}
                isNextDisabled={!form.formState.isValid}
                isNextLoading={form.formState.isSubmitting || wizard.isLoading}
            />
        </div>
    );
} 