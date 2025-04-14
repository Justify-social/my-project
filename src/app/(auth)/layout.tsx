// Layout file for (auth)
import { Suspense } from 'react';
import { Icon } from '@/components/ui/icon';
// Import LoadingSkeleton
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense
        fallback={
          // Replace spinner with a simple skeleton
          <div className="flex items-center justify-center p-8">
            <LoadingSkeleton variant="card" width={400} height={300} />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
