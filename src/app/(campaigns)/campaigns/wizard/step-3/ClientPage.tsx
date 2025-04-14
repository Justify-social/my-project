'use client';

import { Suspense } from 'react';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import { StepLoader } from '@/components/features/campaigns/StepContentLoader';

export default function ClientPage() {
  return (
    <Suspense fallback={<WizardSkeleton step={3} />}>
      <StepLoader step={3} />
    </Suspense>
  );
}
