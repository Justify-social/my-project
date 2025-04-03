import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Disable problematic integrations
  integrations: (integrations) => {
    return integrations.filter(
      (integration) => integration.name !== 'OpenTelemetry'
    )
  },
}) 