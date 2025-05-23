export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export const Analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: new Date().toISOString(),
      userId: undefined, // TODO: Add user context
      sessionId: undefined, // TODO: Add session context
    };

    // For now, just console log the events
    console.log(`[Analytics] ${eventName}`, event);

    // TODO: Integrate with your actual analytics service here
    // Example: mixpanel.track(eventName, properties);
    // Example: gtag('event', eventName, properties);
  },

  // Specialized method for Web Vitals tracking
  trackWebVital: (metric: WebVitalMetric) => {
    const event: AnalyticsEvent = {
      eventName: 'web_vital',
      properties: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        metric_id: metric.id,
        navigation_type: metric.navigationType,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`[Analytics] Web Vital - ${metric.name}`, event);

    // TODO: Send to analytics service
    // This is where you'd send to DataDog, New Relic, Google Analytics, etc.
  },

  // Track performance timing
  trackPerformance: (name: string, duration: number, additionalData?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      eventName: 'performance_timing',
      properties: {
        timing_name: name,
        duration_ms: duration,
        ...additionalData,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`[Analytics] Performance - ${name}`, event);
  },
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  Analytics.track(eventName, properties);
};
