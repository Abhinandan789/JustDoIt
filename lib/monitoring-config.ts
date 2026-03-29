/**
 * Production Monitoring Configuration
 * 
 * Coordinates Sentry, Datadog, and CloudWatch logging
 * Initialized in app/layout.tsx
 */

export const monitoringConfig = {
  // Sentry Configuration
  sentry: {
    enabled: !!process.env.SENTRY_DSN,
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Ignore common non-critical errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Random plugins/extensions
      "chrome-extension://",
      "moz-extension://",
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget
      // See http://www.wnd.com/
      // See http://sidebar.conduit.com/
      "conduitPage",
      // Resend request timeouts
      "ResendError",
      // User cancelled actions
      "AbortError",
      "Network request failed",
    ],
  },

  // Datadog Configuration
  datadog: {
    enabled: !!process.env.DATADOG_API_KEY,
    apiKey: process.env.DATADOG_API_KEY,
    site: process.env.DATADOG_SITE || "datadoghq.com",
    service: "justdoit",
    env: process.env.NODE_ENV,
    version: process.env.APP_VERSION || "1.0.0",
    enableProfiling: process.env.NODE_ENV === "production",
  },

  // CloudWatch Configuration
  cloudwatch: {
    enabled: !!process.env.AWS_REGION,
    logGroupName: "/justdoit/production",
    logStreamName: process.env.HOSTNAME || "app-server",
    awsRegion: process.env.AWS_REGION,
  },

  // Alert Thresholds
  alerts: {
    errorRate: {
      warning: 0.5, // %
      critical: 1.0, // %
    },
    apiLatency: {
      warning: 1000, // ms (p95)
      critical: 2000, // ms
    },
    databaseLatency: {
      warning: 500, // ms (p99)
      critical: 1000, // ms
    },
    emailFailureRate: {
      warning: 1, // %
      critical: 5, // %
    },
    queueDepth: {
      warning: 500,
      critical: 1000,
    },
  },

  // Monitoring Tags (applied to all metrics)
  tags: {
    service: "justdoit",
    environment: process.env.NODE_ENV,
    region: process.env.AWS_REGION,
    version: process.env.APP_VERSION,
  },
};

/**
 * Feature flags for monitoring integrations
 * Disable specific integrations if not configured
 */
export const monitoringFeatures = {
  sentry: {
    captureErrors: monitoringConfig.sentry.enabled,
    capturePerformance: monitoringConfig.sentry.enabled,
    sessionReplay: process.env.NODE_ENV === "production",
  },
  datadog: {
    apm: monitoringConfig.datadog.enabled,
    profiling: monitoringConfig.datadog.enabled && process.env.NODE_ENV === "production",
    metrics: monitoringConfig.datadog.enabled,
  },
  cloudwatch: {
    structuredLogs: monitoringConfig.cloudwatch.enabled,
    metricEmission: monitoringConfig.cloudwatch.enabled,
  },
};

/**
 * Structured logging severity levels
 */
export const logLevels = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
};

/**
 * Common metric names (for consistent tagging)
 */
export const metrics = {
  api: {
    requestCount: "api.request.count",
    latency: "api.request.latency",
    errorCount: "api.request.error",
    errorRate: "api.request.error_rate",
  },
  database: {
    queryCount: "db.query.count",
    latency: "db.query.latency",
    errorCount: "db.query.error",
    poolUsage: "db.pool.usage",
  },
  email: {
    sent: "email.sent",
    failed: "email.failed",
    latency: "email.latency",
    retries: "email.retries",
  },
  queue: {
    depth: "queue.depth",
    processingTime: "queue.processing_time",
    failureRate: "queue.failure_rate",
  },
  tasks: {
    created: "task.created",
    completed: "task.completed",
    missed: "task.missed",
  },
  stripe: {
    chargeAttempts: "stripe.charge.attempts",
    chargeFailures: "stripe.charge.failures",
    webhookErrors: "stripe.webhook.errors",
  },
};
