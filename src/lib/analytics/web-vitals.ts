'use client';

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { Analytics, WebVitalMetric } from './analytics';

/**
 * Interface for web-vitals metric callback parameter
 * Based on the web-vitals library metric structure
 */
interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

/**
 * Extended Navigator interface with connection property
 */
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    type?: string;
    downlink?: number;
    rtt?: number;
  };
}

/**
 * Reports Web Vitals metrics to our analytics system
 * This function should be called on the client side to track Core Web Vitals
 */
export function reportWebVitals() {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  const handleMetric = (metric: WebVitalsMetric) => {
    // Transform web-vitals metric to our interface
    const webVitalMetric: WebVitalMetric = {
      name: metric.name as WebVitalMetric['name'],
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating as WebVitalMetric['rating'],
      navigationType: metric.navigationType,
    };

    // Send to analytics
    Analytics.trackWebVital(webVitalMetric);
  };

  try {
    // Track Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    // Track Interaction to Next Paint (newer metric, replaces FID)
    onINP(handleMetric);
  } catch (error) {
    console.warn('[WebVitals] Error setting up metrics tracking:', error);
  }
}

/**
 * Track custom performance metrics
 */
export function trackCustomMetric(
  name: string,
  value: number,
  additionalData?: Record<string, unknown>
) {
  Analytics.trackPerformance(name, value, additionalData);
}

/**
 * Track page load performance
 */
export function trackPageLoad(pageName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    const navigatorWithConnection = navigator as NavigatorWithConnection;

    Analytics.trackPerformance('page_load', loadTime, {
      page_name: pageName,
      user_agent: navigator.userAgent,
      connection_type: navigatorWithConnection.connection?.effectiveType || 'unknown',
    });
  });
}

/**
 * Track navigation timing
 */
export function trackNavigationTiming() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      Analytics.trackPerformance(
        'navigation_timing',
        navigation.loadEventEnd - navigation.fetchStart,
        {
          dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_connect: navigation.connectEnd - navigation.connectStart,
          request_response: navigation.responseEnd - navigation.requestStart,
          dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          load_event: navigation.loadEventEnd - navigation.loadEventStart,
        }
      );
    }
  });
}
