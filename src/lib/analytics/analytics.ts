export const Analytics = {
  track: (eventName: string, properties?: Record<string, unknown>) => {
    // For now, just console log the events
    console.log(`[Analytics] ${eventName}`, properties);

    // You can integrate with your actual analytics service here
    // Example: mixpanel.track(eventName, properties);
  },
};

export const trackEvent = (_eventName: string, _properties: Record<string, unknown>) => {
  // console.log(`[Analytics] ${_eventName}`, _properties);
  // Replace with your actual analytics SDK call, e.g.:
  // analytics.track(_eventName, _properties);
};
