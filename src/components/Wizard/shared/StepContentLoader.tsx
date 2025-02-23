"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from './ErrorBoundary';
import { StepLoaderProps } from './types';

// Pre-define the dynamic components
const Step1Content = dynamic(() => import('@/app/campaigns/wizard/step-1/Step1Content').then(mod => mod.default), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const Step2Content = dynamic(() => import('@/app/campaigns/wizard/step-2/Step2Content').then(mod => mod.default), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const Step3Content = dynamic(() => import('@/app/campaigns/wizard/step-3/Step3Content').then(mod => mod.default), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export function StepLoader({ step }: StepLoaderProps) {
  const renderContent = () => {
    switch (step) {
      case 1:
        return <Step1Content />;
      case 2:
        return <Step2Content />;
      case 3:
        return <Step3Content />;
      default:
        throw new Error(`Step ${step} not implemented`);
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        {renderContent()}
      </Suspense>
    </ErrorBoundary>
  );
} 