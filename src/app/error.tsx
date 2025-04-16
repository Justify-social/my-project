'use client';

import { useEffect } from 'react';

export default function Error({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ... existing code ...
  }, []);

  return (
    <div className="p-4 font-body">
      <h2 className="font-heading">Something went wrong!</h2>
      <button onClick={() => reset()} className="font-body">
        Try again
      </button>
    </div>
  );
}
