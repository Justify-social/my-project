'use client';

import { useEffect } from 'react';
import { reportWebVitals, trackNavigationTiming } from '@/lib/analytics';

/**
 * Web Vitals Provider Component
 *
 * This component initializes Web Vitals tracking on the client side.
 * It should be included once in the app layout to track Core Web Vitals
 * across all pages.
 */
export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals tracking
    reportWebVitals();

    // Track navigation timing
    trackNavigationTiming();

    // Track initial page load
    if (typeof window !== 'undefined') {
      const pageName = window.location.pathname;
      console.log(`[WebVitals] Initialized tracking for page: ${pageName}`);
    }
  }, []);

  return <>{children}</>;
}

/**
 * Lightweight Web Vitals Reporter
 *
 * Alternative component that only reports metrics without wrapping children.
 * Use this if you prefer to add it directly to layout without a provider pattern.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    reportWebVitals();
    trackNavigationTiming();
  }, []);

  return null;
}
