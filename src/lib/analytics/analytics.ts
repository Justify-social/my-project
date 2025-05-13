export const Analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    // For now, just console log the events
    console.log(`[Analytics] ${eventName}`, properties);

    // You can integrate with your actual analytics service here
    // Example: mixpanel.track(eventName, properties);
  },
};

export const trackEvent = (eventName: string, properties: Record<string, any>) => {
  // console.log(`[Analytics] ${eventName}`, properties);
  // Replace with your actual analytics SDK call, e.g.:
  // analytics.track(eventName, properties);
};
