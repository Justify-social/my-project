"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/Wizard/shared/ErrorBoundary";

interface StepLoaderProps {
  step: number;
}

export function StepLoader({ step }: StepLoaderProps) {
  const StepContent = dynamic(
    () => import(`@/app/campaigns/wizard/step-${step}/Step${step}Content`),
    { 
      ssr: false,
      loading: () => <LoadingSpinner />,
    }
  );

  return function ContentLoader() {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <StepContent />
        </Suspense>
      </ErrorBoundary>
    );
  };
} 