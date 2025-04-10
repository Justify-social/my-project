// Layout file for (dashboard)
import { Suspense } from 'react';
import { Icon } from '@/components/ui/icon';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-white bg-primary transition ease-in-out duration-150">
            <Icon iconId="faSpinnerLight" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Loading Dashboard...
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}