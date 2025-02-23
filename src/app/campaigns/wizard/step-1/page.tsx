import { Suspense } from 'react';
import Step1Content from './Step1Content';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <Step1Content />
    </Suspense>
  );
}