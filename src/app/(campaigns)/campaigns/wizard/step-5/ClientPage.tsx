'use client';

import React, { Suspense } from 'react';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import StepLoader from '../../../../../components/features/campaigns/StepContentLoader';

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-white font-body pb-[var(--footer-height)]">
      <Suspense fallback={<WizardSkeleton step={5} />}>
        <StepLoader step={5} />
      </Suspense>
    </div>
  );
}
