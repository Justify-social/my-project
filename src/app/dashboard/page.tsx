import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import AuthCheck from '@/components/auth/AuthCheck';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

export default function Dashboard() {
  return (
    <AuthCheck>
      <div className="px-4 md:px-6 py-6 font-work-sans">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent user={{ id: '1', name: 'User', role: 'admin' }} />
        </Suspense>
      </div>
    </AuthCheck>);

}