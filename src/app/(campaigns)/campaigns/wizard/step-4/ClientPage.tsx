'use client';

import React, { Suspense } from 'react';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import StepLoader from '@/components/features/campaigns/StepContentLoader';

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<WizardSkeleton step={4} />}>
        <StepLoader step={4} />
      </Suspense>
    </div>
  );
}
