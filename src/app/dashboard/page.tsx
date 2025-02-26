import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import AuthCheck from '@/components/auth/AuthCheck';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Dashboard() {
  return (
    <AuthCheck>
      <div className="px-4 md:px-6 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner className="w-12 h-12 text-[#0ea5e9]" />
            <p className="mt-4 text-gray-500">Loading dashboard data...</p>
          </div>
        }>
          <DashboardContent user={{ id: '1', name: 'User', role: 'admin' }} />
        </Suspense>
      </div>
    </AuthCheck>
  );
}
