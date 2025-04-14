import { Suspense } from 'react';
import { WizardSkeleton } from '@/components/ui/loading-skeleton';
import ClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton step={3} />}>
      <ClientPage />
    </Suspense>
  );
}
