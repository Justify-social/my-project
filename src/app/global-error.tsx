'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2 className="font-heading">Something went wrong!</h2>
        <button onClick={() => reset()} className="font-body">
          Try again
        </button>
      </body>
    </html>
  );
}
