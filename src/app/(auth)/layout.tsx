// Layout file for (auth)
import { Suspense } from 'react';
import { Icon } from '@/components/ui/icon';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-white bg-primary transition ease-in-out duration-150">
            <Icon iconId="faSpinnerLight" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Loading Authentication...
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}