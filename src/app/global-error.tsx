'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background text-foreground font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 sm:p-6">
          <div className="w-16 h-16 md:w-20 md:h-20 mb-8 text-muted-foreground">⚠️</div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
            Something went wrong!
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-8 px-2 leading-relaxed">
            We encountered a critical error. Our team has been notified and we're working on a fix.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => reset()}
            >
              Try Again
            </button>

            <button
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>

          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Need Help?</span>
              </div>
              <p className="text-xs text-gray-500">
                If this problem persists, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
