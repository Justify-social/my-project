'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 font-body">
      <h2 className="font-heading">Something went wrong!</h2>
      <button onClick={() => reset()} className="font-body">
        Try again
      </button>
    </div>
  );
}
