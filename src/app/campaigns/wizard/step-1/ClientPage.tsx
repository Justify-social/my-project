'use client';

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StepLoader } from "@/components/Wizard/shared/StepContentLoader";

export default function ClientPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StepLoader step={1} />
    </Suspense>
  );
} 