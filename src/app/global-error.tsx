'use client';

import { Icon } from '@/components/ui/icon/icon';

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
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 sm:p-6">
          <Icon
            iconId="faTriangleExclamationLight"
            className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mb-8 drop-shadow-lg"
          />

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
            Something went wrong!
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 px-2 leading-relaxed">
            We encountered a critical error. Our team has been notified and we're working on a fix.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              className="w-full sm:w-auto px-6 py-3 bg-accent hover:bg-accent/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-lg inline-flex items-center justify-center"
              onClick={() => reset()}
            >
              <Icon iconId="faRotateLight" className="mr-2 w-4 h-4" />
              Try Again
            </button>

            <button
              className="w-full sm:w-auto px-6 py-3 border border-border text-foreground bg-background rounded-lg font-medium hover:bg-muted/50 transition-colors inline-flex items-center justify-center"
              onClick={() => (window.location.href = '/dashboard')}
            >
              <Icon iconId="faHouseLight" className="mr-2 w-4 h-4" />
              Go to Dashboard
            </button>
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
      </body>
    </html>
  );
}
