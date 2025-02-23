'use client';

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import dynamic from 'next/dynamic';

const Step1ContentLoader = dynamic(
  () => import('@/components/Wizard/shared/StepContentLoader').then(mod => mod.StepLoader({ step: 1 })),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

export default function ClientPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step1ContentLoader />
    </Suspense>
  );
} 