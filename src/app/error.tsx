'use client';

export default function Error({
  error,
  reset



}: {error: Error & {digest?: string;};reset: () => void;}) {
  return (
    <div className="p-4 font-work-sans">
      <h2 className="font-sora">Something went wrong!</h2>
      <button onClick={() => reset()} className="font-work-sans">Try again</button>
    </div>);

}