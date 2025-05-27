'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';

export default function Error({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', _error);
  }, [_error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6 bg-background">
      <Icon
        iconId="faTriangleExclamationLight"
        className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mb-8 drop-shadow-lg"
      />

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
        Something went wrong!
      </h1>

      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 px-2 leading-relaxed">
        We encountered an unexpected error. Don't worry, our team has been notified and we're
        working on a fix.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
        <Button
          variant="default"
          size="lg"
          className="w-full sm:w-auto shadow-lg bg-accent hover:bg-accent/90 text-primary-foreground py-3 text-base"
          onClick={() => reset()}
        >
          <Icon iconId="faRotateLight" className="mr-2" />
          Try Again
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto py-3 text-base border border-border"
          onClick={() => router.push('/dashboard')}
        >
          <Icon iconId="faHouseLight" className="mr-2" />
          Go to Dashboard
        </Button>
      </div>

      <div className="mt-8 max-w-md mx-auto">
        <div className="bg-background/60 backdrop-blur-sm border border-divider rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon iconId="faCircleInfoLight" className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Need Help?</span>
          </div>
          <p className="text-xs text-muted-foreground">
            If this problem persists, please contact our support team with the error details.
          </p>
        </div>
      </div>
    </div>
  );
}
