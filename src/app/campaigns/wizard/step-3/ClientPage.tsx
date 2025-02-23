'use client';

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import dynamic from 'next/dynamic';

const Step3ContentLoader = dynamic(
  () => import('@/components/Wizard/shared/StepContentLoader').then(mod => mod.StepLoader({ step: 3 })),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

export default function ClientPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step3ContentLoader />
    </Suspense>
  );
} 