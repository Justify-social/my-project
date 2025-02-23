import { Suspense } from 'react';
import Step1Content from './Step1Content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step1Content />
    </Suspense>
  );
}