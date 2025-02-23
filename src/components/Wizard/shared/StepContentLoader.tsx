"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from './ErrorBoundary';
import { StepLoaderProps } from './types';

export function StepLoader({ step }: StepLoaderProps) {
  const DynamicContent = dynamic(
    () => import(`@/app/campaigns/wizard/step-${step}/Step${step}Content`),
    {
      loading: () => <LoadingSpinner />,
      ssr: false
    }
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicContent />
      </Suspense>
    </ErrorBoundary>
  );
} 