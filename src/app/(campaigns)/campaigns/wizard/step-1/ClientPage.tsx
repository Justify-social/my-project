'use client';

import { Suspense } from 'react';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import StepContentLoader from '../../../../../components/features/campaigns/StepContentLoader';

export default function ClientPage() {
  return (
    <Suspense fallback={<WizardSkeleton step={1} />}>
      <StepContentLoader step={1} />
    </Suspense>
  );
}
