'use client';

import { Suspense } from "react";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import { StepLoader } from "@/components/features/campaigns/StepContentLoader";

export default function ClientPage() {
  return (
    <Suspense fallback={<WizardSkeleton step={2} />}>
      <StepLoader step={2} />
    </Suspense>
  );
} 