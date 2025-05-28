'use client';

import { ErrorDisplay } from '@/components/ui/error-display';

export default function NotFound() {
  return (
    <ErrorDisplay
      message="Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
      errorType="PAGE_NOT_FOUND"
      isFullPage={true}
    />
  );
}
