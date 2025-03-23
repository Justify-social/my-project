import { Spinner } from './index';

// Backward-compatibility wrapper for the SVG spinner
export function LoadingSpinner({ className = "w-4 h-4" }: { className?: string }) {
  return <Spinner type="svg" className={className} />;
}

// This comment indicates that this file is deprecated and will be removed in a future update
// @deprecated Use the Spinner component with type="svg" instead 