'use client';

import { ErrorDisplay } from '@/components/ui/error-display';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background text-foreground font-sans antialiased">
        <ErrorDisplay
          message="We encountered a critical error. Our team has been notified and we're working on a fix."
          errorType="GLOBAL"
          isFullPage={true}
          onReset={reset}
        />
      </body>
    </html>
  );
}
