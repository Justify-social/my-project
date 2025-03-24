'use client';

export default function GlobalError({
  error,
  reset



}: {error: Error & {digest?: string;};reset: () => void;}) {
  return (
    <html>
      <body>
        <h2 className="font-sora">Something went wrong!</h2>
        <button onClick={() => reset()} className="font-work-sans">Try again</button>
      </body>
    </html>);

}