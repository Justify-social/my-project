import { Spinner } from './spinner';

// Backward-compatibility wrapper for the border spinner
export const LoadingSpinner = () => {
  return <Spinner size="lg" variant="current" />;
};

// This comment indicates that this file is deprecated and will be removed in a future update
// @deprecated Use the Spinner component instead 